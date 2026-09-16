// Recibe una foto desde un Atajo de iOS, la lee y la guarda sola en Mi Wara.
//
//   POST /api/atajo?tipo=cheque[&flujo=entrada|salida]
//   POST /api/atajo?tipo=factura
//
// Cuerpo: la foto cruda (Content-Type: image/jpeg o image/png), que es lo que manda
// Atajos con "Cuerpo de la solicitud: Archivo". Tambien acepta JSON {image, media_type}.
//
// Requiere el token de ATAJO_TOKEN, en el encabezado x-atajo-token o en ?token=.
// Sin eso el endpoint queda abierto a cualquiera que adivine la URL, y cada llamada
// gasta creditos de la API y escribe en la base.

import { supabase } from "../../../lib/supabaseClient";
import { leerImagenes, FORMATOS_ACEPTADOS, PROMPT_CHEQUE, PROMPT_FACTURA } from "../../../lib/ocr";

const MESES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const IVA = 1.21;

const entero = (n) => Math.round(Number(String(n ?? "").replace(/[^0-9.-]/g, "")) || 0);
const porcentaje = (n) => parseFloat(String(n ?? "").replace(",", ".")) || 0;

const texto = (cuerpo, status) =>
  new Response(cuerpo, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });

// "2026-09-16" -> "SEP". Sin fecha legible, cae en el mes en curso.
const mesDe = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return MESES[new Date().getMonth()];
  const i = Number(m[2]) - 1;
  return MESES[i] ?? MESES[new Date().getMonth()];
};

const ddmmyy = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  return m ? `${m[3]}/${m[2]}/${m[1].slice(2)}` : "";
};

const plata = (n) => "$ " + entero(n).toLocaleString("es-AR");

// Busca la empresa leida en la factura entre las contrapartes ya usadas, para traer
// proveedor/cliente y los porcentajes habituales. Mismo criterio que usa la app.
function buscarEnHistorial(movimientos, nombre) {
  const norm = (nombre || "").trim().toUpperCase();
  if (!norm) return null;
  const coincide = (a) => {
    const A = (a || "").trim().toUpperCase();
    return A && (A === norm || norm.includes(A) || A.includes(norm));
  };
  for (const mv of [...movimientos].reverse()) {
    if (coincide(mv.contacto_prov)) {
      return { lado: "proveedor", proveedor: mv.proveedor, contacto_prov: mv.contacto_prov,
               costo_pct: mv.costo_pct, perc: mv.perc };
    }
  }
  for (const mv of [...movimientos].reverse()) {
    if (coincide(mv.contacto_cli)) {
      return { lado: "cliente", cliente: mv.cliente, contacto_cli: mv.contacto_cli,
               venta_pct: mv.venta_pct, perc: mv.perc };
    }
  }
  return null;
}

// Saca la foto del pedido, venga cruda o en JSON.
async function leerFoto(req) {
  const ct = (req.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();

  if (ct === "application/json") {
    const body = await req.json();
    const media_type = (body.media_type || "image/jpeg").toLowerCase();
    if (!body.image) throw Object.assign(new Error("El JSON no trae la clave \"image\"."), { status: 400 });
    return { media_type, data: body.image };
  }

  const buf = Buffer.from(await req.arrayBuffer());
  if (buf.length === 0) {
    throw Object.assign(new Error("No llegó ninguna foto en el cuerpo del pedido."), { status: 400 });
  }
  if (!FORMATOS_ACEPTADOS.includes(ct)) {
    throw Object.assign(
      new Error(
        `Formato "${ct || "desconocido"}" no aceptado. El iPhone manda HEIC: agregá la acción ` +
        `"Convertir imagen" a JPEG en el Atajo, antes de "Obtener contenido de la URL".`
      ),
      { status: 415 }
    );
  }
  return { media_type: ct, data: buf.toString("base64") };
}

export async function POST(req) {
  try {
    const url = new URL(req.url);

    // --- token ---
    const esperado = process.env.ATAJO_TOKEN;
    if (!esperado) {
      return texto("Falta configurar ATAJO_TOKEN en las variables de entorno de Vercel.", 500);
    }
    const recibido = req.headers.get("x-atajo-token") || url.searchParams.get("token") || "";
    if (recibido !== esperado) {
      return texto("Token inválido.", 401);
    }

    // --- que tipo de foto es ---
    const tipo = (url.searchParams.get("tipo") || "cheque").toLowerCase();
    if (tipo !== "cheque" && tipo !== "factura") {
      return texto('El parámetro "tipo" tiene que ser "cheque" o "factura".', 400);
    }
    const flujo = (url.searchParams.get("flujo") || "entrada").toLowerCase();
    if (tipo === "cheque" && flujo !== "entrada" && flujo !== "salida") {
      return texto('El parámetro "flujo" tiene que ser "entrada" o "salida".', 400);
    }

    const foto = await leerFoto(req);
    const leido = await leerImagenes({
      images: [foto],
      prompt: tipo === "cheque" ? PROMPT_CHEQUE : PROMPT_FACTURA,
      maxTokens: 1000,
    });
    const d = leido && typeof leido === "object" && !Array.isArray(leido) ? leido : {};

    // ---------- cheque ----------
    if (tipo === "cheque") {
      const monto = entero(d.monto);
      if (monto <= 0) {
        return texto("Leí el cheque pero no pude sacar el monto. Cargalo a mano en la app.", 422);
      }
      const hoy = new Date().toISOString().slice(0, 10);
      const { error } = await supabase.from("checks").insert({
        tipo: flujo,
        medio_pago: "cheque",
        fecha: hoy,
        fecha_cobro: /^\d{4}-\d{2}-\d{2}$/.test(d.fecha || "") ? d.fecha : hoy,
        banco: d.banco || "",
        numero: String(d.numero || ""),
        monto,
        contraparte: d.contraparte || "",
        estado: "pendiente",
        aplicado_a: null,
      });
      if (error) return texto(`Lo leí pero no pude guardarlo: ${error.message}`, 502);

      return texto(
        `Cheque guardado — ${plata(monto)}` +
        `${d.banco ? ` · ${d.banco}` : ""}${d.numero ? ` · Nº ${d.numero}` : ""}` +
        `${d.contraparte ? ` · ${d.contraparte}` : ""}`,
        200
      );
    }

    // ---------- factura ----------
    const total = entero(d.total);
    const netoLeido = entero(d.neto);
    const neto = netoLeido > 0 ? netoLeido : total > 0 ? Math.round(total / IVA) : 0;
    if (neto <= 0) {
      return texto("Leí la factura pero no pude sacar el importe. Cargala a mano en la app.", 422);
    }

    const { data: previos, error: errLectura } = await supabase
      .from("movements")
      .select("proveedor, contacto_prov, cliente, contacto_cli, costo_pct, venta_pct, perc")
      .order("created_at", { ascending: true })
      .limit(1000);
    if (errLectura) return texto(`No pude leer el historial: ${errLectura.message}`, 502);

    const m = buscarEnHistorial(previos || [], d.empresa);
    const costo_pct = m?.lado === "proveedor" ? porcentaje(m.costo_pct) : 0;
    const venta_pct = m?.lado === "cliente" ? porcentaje(m.venta_pct) : 0;
    const perc = m ? porcentaje(m.perc) : 0;
    const a_pagar = Math.round((neto * (costo_pct + perc)) / 100);
    const a_cobrar = Math.round((neto * (venta_pct + perc)) / 100);

    const { error } = await supabase.from("movements").insert({
      mes: mesDe(d.fecha),
      fecha: ddmmyy(d.fecha),
      proveedor: m?.lado === "proveedor" ? m.proveedor : "",
      contacto_prov: m?.lado === "proveedor" ? m.contacto_prov : (m ? "" : (d.empresa || "")),
      cliente: m?.lado === "cliente" ? m.cliente : "",
      contacto_cli: m?.lado === "cliente" ? m.contacto_cli : "",
      neto,
      costo_pct,
      venta_pct,
      a_pagar,
      perc,
      a_cobrar,
      bille: 0,
      ganancia: a_cobrar - a_pagar,
      circuito: total > 0 && netoLeido <= 0 ? "si" : "no",
      monto_final: total,
    });
    if (error) return texto(`La leí pero no pude guardarla: ${error.message}`, 502);

    const falta = m
      ? `Cargada como ${m.lado} ${m.lado === "proveedor" ? m.proveedor : m.cliente}.`
      : "No reconocí la empresa: completá proveedor y cliente en la app.";
    return texto(
      `Factura guardada en ${mesDe(d.fecha)} — neto ${plata(neto)}` +
      `${d.empresa ? ` · ${d.empresa}` : ""}. ${falta}`,
      200
    );
  } catch (e) {
    const status = e && e.status ? e.status : 500;
    return texto(e && e.message ? e.message : String(e), status);
  }
}
