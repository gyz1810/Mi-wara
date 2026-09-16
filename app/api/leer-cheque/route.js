// Lectura por foto desde la app. El Atajo del iPhone entra por /api/atajo.
import { leerImagenes } from "../../../lib/ocr";

export async function POST(req) {
  try {
    const { images, prompt, maxTokens } = await req.json();
    const result = await leerImagenes({ images, prompt, maxTokens });
    return Response.json({ result });
  } catch (e) {
    if (e && e.status) {
      return Response.json({ error: e.message, ...(e.raw ? { raw: e.raw } : {}) }, { status: e.status });
    }
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
