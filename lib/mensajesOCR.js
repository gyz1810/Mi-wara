// Traduce el error crudo de la lectura por foto a algo accionable, en castellano.
// Lo usan la app (alert) y /api/atajo (notificacion del Atajo). Sin esto el usuario
// solo ve un JSON de la API y no sabe si falta saldo, si la clave esta mal o si la
// foto no se entiende.

export function mensajeDeErrorOCR(err, fallback) {
  const detalle = (err && err.message) || String(err || "");
  const d = detalle.toLowerCase();

  if (detalle === "FOTO_NO_ABRE") {
    return "No pude abrir esa foto. Si está guardada en iCloud, abrila primero en Fotos para que se descargue al teléfono, y probá de nuevo.";
  }
  if (d.includes("credit balance") || d.includes("billing") || d.includes("insufficient")) {
    return "La cuenta de Anthropic no tiene saldo. Cargá créditos en console.anthropic.com para poder leer fotos.";
  }
  if (d.includes("authentication") || d.includes("invalid x-api-key") || d.includes("unauthorized") || d.includes("401")) {
    return "La clave de la API no es válida o venció. Generá una nueva y actualizala en Vercel.";
  }
  if (d.includes("anthropic_api_key")) {
    return "Falta configurar la clave de la API en el servidor.";
  }
  if (d.includes("rate") && d.includes("limit")) {
    return "Demasiadas fotos seguidas. Esperá unos segundos y probá de nuevo.";
  }
  return detalle ? `${fallback}\n\nDetalle: ${detalle}` : fallback;
}
