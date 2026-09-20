import type { CitaVerificada, ResultadoVerificacion } from "./citas";

/**
 * INFORME DE VERIFICACIÓN NORMATIVA — diferencial del producto.
 *
 * Documento imprimible (PDF vía diálogo de impresión) que deja constancia de
 * qué citas del escrito fueron contrastadas contra el texto completo de la
 * ley, cuáles requieren revisión y cuáles corresponden a normas derogadas.
 * Sirve para adjuntar al legajo, mostrar al cliente o defender el escrito
 * ante un tribunal que pregunte "¿esto lo verificó alguien?".
 */

const ESTADOS: Record<CitaVerificada["estado"], { label: string; color: string }> = {
  verificada: { label: "Verificada", color: "#1e7f4f" },
  dudosa: { label: "Verificar cita exacta", color: "#b7791f" },
  no_verificable: { label: "Revisar antes de presentar", color: "#b91c1c" },
  derogada: { label: "NORMA DEROGADA", color: "#7f1d1d" },
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function generarInformeVerificacionHtml(params: {
  titulo: string;
  resultado: ResultadoVerificacion;
  letrado?: { nombre?: string | null; matricula?: string | null; colegio?: string | null };
  fecha?: Date;
}): string {
  const { titulo, resultado, letrado, fecha = new Date() } = params;
  const { citas, resumen } = resultado;
  const orden: CitaVerificada["estado"][] = ["derogada", "no_verificable", "dudosa", "verificada"];
  const ordenadas = [...citas].sort((a, b) => orden.indexOf(a.estado) - orden.indexOf(b.estado));
  const fechaStr = fecha.toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });
  const horaStr = fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  const filas = ordenadas
    .map((c) => {
      const e = ESTADOS[c.estado];
      return `<tr>
        <td class="cita">${esc(c.cita)}<div class="tipo">${c.tipo === "fallo" ? "jurisprudencia" : "artículo"}</div></td>
        <td><span class="estado" style="color:${e.color};border-color:${e.color}">${e.label}</span></td>
        <td class="detalle">${esc(c.detalle)}${c.fuente ? `<div class="fuente">${esc(c.fuente)}</div>` : ""}</td>
      </tr>`;
    })
    .join("");

  const conclusion =
    resumen.derogadas > 0
      ? `El escrito cita ${resumen.derogadas} norma(s) derogada(s). Deben eliminarse o justificarse expresamente por la fecha del distracto antes de presentar.`
      : resumen.no_verificables > 0
        ? `${resumen.no_verificables} cita(s) no pudieron contrastarse contra el corpus: el letrado debe confirmarlas en la fuente oficial antes de presentar.`
        : resumen.dudosas > 0
          ? `${resumen.dudosas} cita(s) de jurisprudencia coinciden con criterios conocidos pero la carátula/fecha exacta debe confirmarse.`
          : "Todas las citas detectadas coinciden con el texto de las normas del corpus verificado.";

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe de verificación normativa — ${esc(titulo)}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1a2332; font-size: 11.5px; line-height: 1.45; margin: 0; }
  header { border-bottom: 3px double #1a2332; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-end; }
  .brand { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
  .brand span { color: #c9a227; }
  .meta { font-family: ui-monospace, Menlo, monospace; font-size: 9.5px; letter-spacing: .08em; text-transform: uppercase; color: #6b7280; text-align: right; }
  h1 { font-size: 17px; margin: 0 0 4px; }
  .sub { color: #4b5563; margin: 0 0 12px; }
  .kpis { display: flex; gap: 10px; margin: 12px 0 16px; }
  .kpi { flex: 1; border: 1px solid #d1d5db; border-radius: 4px; padding: 8px 10px; }
  .kpi b { display: block; font-size: 20px; }
  .kpi small { color: #6b7280; text-transform: uppercase; letter-spacing: .06em; font-size: 9px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 9.5px; text-transform: uppercase; letter-spacing: .06em; color: #6b7280; border-bottom: 1px solid #1a2332; padding: 6px 6px; }
  td { vertical-align: top; border-bottom: 1px solid #e5e7eb; padding: 7px 6px; }
  td.cita { font-weight: 700; width: 26%; }
  .tipo { font-weight: 400; font-size: 9.5px; color: #6b7280; }
  .estado { display: inline-block; border: 1px solid; border-radius: 3px; padding: 1px 6px; font-size: 9.5px; font-weight: 700; white-space: nowrap; }
  .detalle { color: #374151; }
  .fuente { font-family: ui-monospace, Menlo, monospace; font-size: 9.5px; color: #6b7280; margin-top: 2px; }
  .conclusion { margin-top: 16px; border-left: 3px solid #c9a227; padding: 8px 12px; background: #faf7f0; }
  footer { margin-top: 22px; border-top: 1px solid #d1d5db; padding-top: 8px; font-size: 9.5px; color: #6b7280; }
  @media print { .noprint { display: none; } }
</style></head><body>
<header>
  <div><div class="brand">Legal<span>IA</span></div><div style="font-size:10px;color:#6b7280">Informe de verificación normativa</div></div>
  <div class="meta">${esc(fechaStr)} · ${esc(horaStr)} hs<br>Corpus: LCT, CCCN y ley 18.345 completos (InfoLeg) + reformas leyes 27.742 / 27.802</div>
</header>
<h1>${esc(titulo)}</h1>
<p class="sub">${letrado?.nombre ? `Letrado/a: ${esc(letrado.nombre)}${letrado.matricula ? ` · ${esc(letrado.colegio ?? "Matrícula")} ${esc(letrado.matricula)}` : ""}` : "Escrito verificado con LegalIA"}</p>
<div class="kpis">
  <div class="kpi"><b style="color:#1e7f4f">${resumen.verificadas}</b><small>verificadas</small></div>
  <div class="kpi"><b style="color:#b7791f">${resumen.dudosas}</b><small>a confirmar</small></div>
  <div class="kpi"><b style="color:#b91c1c">${resumen.no_verificables}</b><small>no verificables</small></div>
  <div class="kpi"><b style="color:#7f1d1d">${resumen.derogadas}</b><small>derogadas</small></div>
</div>
${citas.length === 0 ? "<p>No se detectaron citas de artículos ni de fallos en el escrito.</p>" : `<table><thead><tr><th>Cita</th><th>Estado</th><th>Detalle / fuente</th></tr></thead><tbody>${filas}</tbody></table>`}
<div class="conclusion"><strong>Conclusión:</strong> ${esc(conclusion)}</div>
<footer>Verificación automática contra el texto de las normas cargadas en LegalIA a la fecha indicada. No reemplaza el control del profesional: una cita "no verificable" puede ser correcta y estar fuera del corpus. Las normas marcadas como derogadas lo fueron por la ley 27.742 (art. 99) o por la norma indicada en cada caso.</footer>
<script>window.onload=function(){window.print()}</script>
</body></html>`;
}
