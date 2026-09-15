export async function POST(req) {
  try {
    const { images, prompt } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "Falta configurar ANTHROPIC_API_KEY en las variables de entorno de Vercel." },
        { status: 500 }
      );
    }
    if (!images || images.length === 0) {
      return Response.json({ error: "No se recibió ninguna imagen." }, { status: 400 });
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
        max_tokens: 2000,
        messages: [{ role: "user", content }],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return Response.json({ error: `Error de la API de Claude: ${errText}` }, { status: 502 });
    }

    const json = await resp.json();
    const textBlock = (json.content || []).find((b) => b.type === "text");
    let result = null;
    if (textBlock) {
      const clean = textBlock.text.replace(/```json|```/g, "").trim();
      try {
        result = JSON.parse(clean);
      } catch (e) {
        return Response.json({ error: "No pude interpretar la respuesta.", raw: textBlock.text }, { status: 502 });
      }
    }

    return Response.json({ result });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
