/**
 * Datos que LegalIA ya tiene verificados en código (las calculadoras) y que el
 * asistente no encuentra en la base de normas. Se inyectan en el contexto
 * cuando la consulta los toca, para que no los "recuerde" mal: en la primera
 * prueba el modelo inventó un piso de un salario mínimo para las prestaciones
 * de la LRT.
 *
 * Fuente única: se leen de lib/legal/art.ts y lib/legal/honorarios.ts, así que
 * cuando se actualiza la calculadora se actualiza el asistente.
 */
import { pisosVigentes } from "./art";
import { umaVigente } from "./honorarios";

const ars = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
const fecha = (iso: string) => iso.split("-").reverse().join("/");
const normalizar = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function bloqueART(hoyISO: string): string {
  const p = pisosVigentes(hoyISO);
  return [
    "[Datos verificados de LegalIA — prestaciones dinerarias de la Ley de Riesgos del Trabajo 24.557 (con leyes 26.773 y 27.348)]",
    "- Ingreso base (art. 12, ley 27.348): promedio de las remuneraciones de los 12 meses anteriores a la primera manifestación invalidante, actualizadas por RIPTE.",
    "- Incapacidad permanente parcial, menor al 66 % (art. 14.2): 53 × ingreso base × (% de incapacidad / 100) × (65 / edad). Piso: el piso del art. 14 multiplicado por el porcentaje de incapacidad. Si la incapacidad es mayor al 50 % y menor al 66 %, se suma la compensación del art. 11.4.a.",
    "- Incapacidad permanente total, 66 % o más (art. 15.2): 53 × ingreso base × (65 / edad), sin multiplicar por el porcentaje, más la compensación del art. 11.4.b.",
    "- Muerte (art. 18): igual que la total, más la compensación del art. 11.4.c.",
    "- Adicional del 20 % (art. 3, ley 26.773): si el daño ocurrió en el lugar de trabajo o a disposición del empleador; no corresponde en accidentes in itinere.",
    "- Incapacidad laboral temporaria (art. 13): prestación mensual según el art. 208 LCT; los primeros 10 días los paga el empleador.",
    `- Importes vigentes del ${fecha(p.vigencia_desde)} al ${fecha(p.vigencia_hasta)} — ${p.fuente}: piso art. 14.2 ${ars(p.piso_art_14)} (por el % de incapacidad); piso arts. 15.2 y 18 ${ars(p.piso_art_15)}; compensaciones art. 11.4: a) ${ars(p.compensacion_11_4_a)}, b) ${ars(p.compensacion_11_4_b)}, c) ${ars(p.compensacion_11_4_c)}; mínimo del adicional del art. 3 ley 26.773 ${ars(p.minimo_art_3_26773)}.`,
    "- Se aplican los importes vigentes a la fecha de la primera manifestación invalidante. Para liquidar un caso, LegalIA tiene la calculadora en /calculadoras/art-ley-24557.",
  ].join("\n");
}

function bloqueUMA(hoyISO: string): string {
  const u = umaVigente(hoyISO);
  return [
    "[Datos verificados de LegalIA — UMA, ley 27.423 de honorarios]",
    `- Último valor cargado: ${ars(u.valor)}, vigente desde el ${fecha(u.desde)} (${u.resolucion}). La CSJN lo actualiza periódicamente: confirmar si hay un valor posterior.`,
    "- Para regular honorarios, LegalIA tiene la calculadora en /calculadoras/honorarios.",
  ].join("\n");
}

/**
 * `exacto` se prueba contra el texto original (distingue mayúsculas): "ART" es
 * la aseguradora, "art." es un artículo cualquiera y no debe disparar el bloque.
 */
const TEMAS: { si: RegExp; exacto?: RegExp; bloque: (hoy: string) => string }[] = [
  {
    si: /\b(lrt|srt|ilp|ilt)\b|riesgos? del trabajo|aseguradora|24\.?557|26\.?773|27\.?348|incapacidad|accidente (de trabajo|laboral)|in itinere|enfermedad profesional|gran invalidez/,
    exacto: /\bART\b/,
    bloque: bloqueART,
  },
  { si: /\buma\b|honorarios|27\.?423/, bloque: bloqueUMA },
];

/** Bloques de datos verificados pertinentes a la consulta (vacío si no toca ninguno). */
export function datosVerificadosPara(consulta: string, hoy: Date = new Date()): string {
  const texto = normalizar(consulta);
  const hoyISO = hoy.toISOString().slice(0, 10);
  return TEMAS
    .filter((t) => t.si.test(texto) || Boolean(t.exacto?.test(consulta)))
    .map((t) => t.bloque(hoyISO))
    .join("\n\n---\n\n");
}
