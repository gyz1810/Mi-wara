// Reglas de los cheques que usan tanto la app como /api/atajo: como se reconoce un cheque
// que ya paso por casa, y cuando vence de verdad.

// Un cheque comun vale 30 dias corridos desde la fecha que tiene escrita. Avisamos unos
// dias antes para llegar a cobrarlo o entregarlo.
export const DIAS_VALIDEZ = 30;
export const DIAS_AVISO_VENCIMIENTO = 7;

// El banco viene de una foto, asi que "Bco. Galicia" y "BANCO GALICIA" son el mismo.
// Comparamos sin acentos, sin espacios y sin puntuacion.
export const normalizarBanco = (s) =>
  String(s || "").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Z0-9]/g, "");

// El numero es lo que identifica al cheque. Los ceros de la izquierda dependen de como
// lo imprima cada banco y de como lo lea la foto, asi que no cuentan.
export const normalizarNumero = (s) => String(s || "").replace(/\D/g, "").replace(/^0+/, "");

// Dos bancos son compatibles si uno contiene al otro: alcanza para distinguir Galicia de
// Nacion sin exigir que la foto se lea igual las dos veces. Si de un lado no hay banco,
// no descartamos por eso: el numero ya es bastante especifico.
const bancosCompatibles = (a, b) => {
  const A = normalizarBanco(a), B = normalizarBanco(b);
  if (!A || !B) return true;
  return A === B || A.includes(B) || B.includes(A);
};

// Busca la entrada por la que entro este mismo cheque fisico. Solo mira entradas que
// todavia no se entregaron: un cheque se da una sola vez.
export function buscarEntradaOriginal(cheques, { banco, numero, excluirId } = {}) {
  const num = normalizarNumero(numero);
  if (!num) return null;

  const yaEntregadas = new Set(cheques.map((c) => c.vinculadoA || c.vinculado_a).filter(Boolean));

  return (
    cheques.find(
      (c) =>
        c.tipo === "entrada" &&
        c.id !== excluirId &&
        !yaEntregadas.has(c.id) &&
        normalizarNumero(c.numero) === num &&
        bancosCompatibles(c.banco, banco)
    ) || null
  );
}

// "2026-09-15" + 30 dias -> "2026-10-15"
export function vencimientoDe(fechaCobro) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaCobro || "")) return "";
  const d = new Date(fechaCobro + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + DIAS_VALIDEZ);
  return d.toISOString().slice(0, 10);
}

// Dias que faltan para que el cheque deje de valer. Negativo si ya vencio.
export function diasParaVencer(fechaCobro, hoyISO) {
  const vence = vencimientoDe(fechaCobro);
  if (!vence) return null;
  return Math.round((new Date(vence + "T00:00:00Z") - new Date(hoyISO + "T00:00:00Z")) / 86400000);
}

// Un cheque que todavia tenemos en la mano: entro y no se entrego a nadie.
export const sigueEnCartera = (c, cheques) =>
  c.tipo === "entrada" && !cheques.some((x) => (x.vinculadoA || x.vinculado_a) === c.id);

// Los que hay que mirar ya: vencen dentro de la ventana de aviso, o ya vencieron.
export function chequesPorVencer(cheques, hoyISO) {
  return cheques.filter((c) => {
    if (c.medioPago !== "cheque" || !sigueEnCartera(c, cheques)) return false;
    const dias = diasParaVencer(c.fechaCobro, hoyISO);
    return dias !== null && dias <= DIAS_AVISO_VENCIMIENTO;
  });
}
