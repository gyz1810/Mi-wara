// Lectura por foto: cheques (un objeto JSON) y facturas (un array JSON, varias por tanda).
// Recibe las imagenes en base64 y el prompt desde el cliente, y devuelve { result } ya parseado.

const MAX_IMAGES = 12;
const DEFAULT_MAX_TOKENS = 4000;

// Claude a veces contesta con el JSON envuelto en ``` o con una linea de texto antes/despues.
// Sacamos las vallas y, si aun asi no parsea, recortamos desde el primer [ o { hasta su cierre.
function parseJsonLoose(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch {}

  const starts = [clean.indexOf("["), clean.indexOf("{")].filter((i) => i !== -1);
  if (starts.length === 0) return undefined;
  const start = Math.min(...starts);
  const end = Math.max(clean.lastIndexOf("]"), clean.lastIndexOf("}"));
  if (end <= start) return undefined;
  try {
    return JSON.parse(clean.slice(start, end + 1));
  } catch {
    return undefined;
  }
}

export async function POST(req) {
  try {
    const { images, prompt, maxTokens } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "Falta configurar ANTHROPIC_API_KEY en las variables de entorno de Vercel." },
        { status: 500 }
      );
    }
    if (!Array.isArray(images) || images.length === 0) {
      return Response.json({ error: "No se recibió ninguna imagen." }, { status: 400 });
    }
    if (images.length > MAX_IMAGES) {
      return Response.json(
        { error: `Mandá hasta ${MAX_IMAGES} fotos por vez (llegaron ${images.length}).` },
        { status: 400 }
      );
    }
    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Falta indicar qué hay que leer de la imagen." }, { status: 400 });
    }

    const content = [
      ...images.map((img) => ({
        type: "image",
        source: { type: "base64", media_type: img.media_type || "image/jpeg", data: img.data },
      })),
      { type: "text", text: prompt },
    ];

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: Number(maxTokens) > 0 ? Number(maxTokens) : DEFAULT_MAX_TOKENS,
        messages: [{ role: "user", content }],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return Response.json({ error: `Error de la API de Claude: ${errText}` }, { status: 502 });
    }

    const json = await resp.json();
    const textBlock = (json.content || []).find((b) => b.type === "text");
    if (!textBlock) {
      return Response.json({ error: "No pude interpretar la respuesta." }, { status: 502 });
    }

    const result = parseJsonLoose(textBlock.text);
    if (result === undefined) {
      return Response.json(
        { error: "No pude interpretar la respuesta.", raw: textBlock.text },
        { status: 502 }
      );
    }

    return Response.json({ result });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
