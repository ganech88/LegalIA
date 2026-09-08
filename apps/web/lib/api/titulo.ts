/**
 * Título legible del escrito a partir de los datos del caso.
 * Antes: "Demanda laboral — 8/9/2026" (todos los escritos del día iguales, y
 * con "/" que rompe el nombre del archivo DOCX en Windows).
 */
export function tituloDesdeDatos(nombreTemplate: string, datos: Record<string, string>): string {
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      const v = datos[k];
      if (typeof v === "string" && v.trim()) return v.trim().slice(0, 60);
    }
    return "";
  };
  const actor = pick("actor_nombre", "actor", "nombre_actor", "cliente", "remitente", "recurrente", "amparista");
  const demandado = pick("demandado_nombre", "demandado", "nombre_demandado", "destinatario", "contraparte", "empleador");
  const caratula = pick("caratula");
  const fecha = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");

  let partes = caratula;
  if (!partes && actor && demandado) partes = `${actor} c/ ${demandado}`;
  else if (!partes && (actor || demandado)) partes = actor || demandado;

  return partes ? `${partes} — ${nombreTemplate}` : `${nombreTemplate} — ${fecha}`;
}

/** Nombre de archivo seguro para Windows/macOS. */
export function nombreArchivoSeguro(titulo: string, ext: string): string {
  const base = titulo.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim().slice(0, 120) || "escrito";
  return `${base}.${ext}`;
}
