// Lectura de imagenes con Claude, compartida por /api/leer-cheque (lo que usa la app)
// y /api/atajo (lo que usa el Atajo del iPhone).

export const MAX_IMAGENES = 12;
const TOKENS_POR_DEFECTO = 4000;

// La API solo acepta estas imagenes. El iPhone entrega HEIC, asi que hay que convertir
// antes de llegar aca: en la app lo hace el canvas, en el Atajo la accion "Convertir imagen".
export const IMAGENES_ACEPTADAS = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const PDF = "application/pdf";

// Los PDF van como documento, no como imagen: Claude los lee nativamente y con mejor
// fidelidad que una foto de la misma factura.
export const FORMATOS_ACEPTADOS = [...IMAGENES_ACEPTADAS, PDF];

const bloqueDeArchivo = (a) => {
  const media_type = (a.media_type || "image/jpeg").toLowerCase();
  const source = { type: "base64", media_type, data: a.data };
  return media_type === PDF ? { type: "document", source } : { type: "image", source };
};

// Claude a veces contesta con el JSON envuelto en ``` o con una linea de texto alrededor.
// Sacamos las vallas y, si aun asi no parsea, recortamos desde el primer [ o { hasta su cierre.
export function parseJsonLoose(text) {
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

export class ErrorOCR extends Error {
  constructor(mensaje, status) {
    super(mensaje);
    this.status = status;
  }
}

// Manda las fotos y/o PDFs a Claude y devuelve el JSON ya parseado.
export async function leerImagenes({ images, prompt, maxTokens }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ErrorOCR("Falta configurar ANTHROPIC_API_KEY en las variables de entorno de Vercel.", 500);
  }
  if (!Array.isArray(images) || images.length === 0) {
    throw new ErrorOCR("No se recibió ninguna imagen.", 400);
  }
  if (images.length > MAX_IMAGENES) {
    throw new ErrorOCR(`Mandá hasta ${MAX_IMAGENES} fotos por vez (llegaron ${images.length}).`, 400);
  }
  if (!prompt || typeof prompt !== "string") {
    throw new ErrorOCR("Falta indicar qué hay que leer de la imagen.", 400);
  }

  // El bloque de texto va ultimo: con documentos e imagenes, la instruccion despues del
  // material es lo que la API espera.
  const content = [...images.map(bloqueDeArchivo), { type: "text", text: prompt }];

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: Number(maxTokens) > 0 ? Number(maxTokens) : TOKENS_POR_DEFECTO,
      messages: [{ role: "user", content }],
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new ErrorOCR(`Error de la API de Claude: ${errText}`, 502);
  }

  const json = await resp.json();
  const textBlock = (json.content || []).find((b) => b.type === "text");
  if (!textBlock) throw new ErrorOCR("No pude interpretar la respuesta.", 502);

  const result = parseJsonLoose(textBlock.text);
  if (result === undefined) {
    const err = new ErrorOCR("No pude interpretar la respuesta.", 502);
    err.raw = textBlock.text;
    throw err;
  }
  return result;
}

export const PROMPT_CHEQUE =
  "Mirá esta foto de un cheque bancario argentino. Respondé SOLO con un objeto JSON (sin texto adicional, sin ```) con estas claves: banco, numero, monto (solo número entero, sin puntos ni signos), fecha (formato AAAA-MM-DD, fecha de pago/vencimiento del cheque), contraparte (nombre de quien lo libra o a la orden de quien está). Si algún dato no se ve, usá cadena vacía.";

export const PROMPT_FACTURA =
  "Mirá esta factura (puede ser una foto o un PDF). Respondé SOLO con un objeto JSON (sin texto adicional, sin ```) con estas claves: empresa (el nombre de la empresa que figura en la factura, la razón social principal), fecha (formato AAAA-MM-DD), neto (el importe neto o subtotal SIN IVA si figura explícitamente, si no dejalo vacío), total (el importe TOTAL final, con IVA incluido, si figura), numero (número de factura si se ve). Si algún dato no se ve, usá cadena vacía en esa clave.";
