/**
 * Cómputo de plazos procesales y vencimientos (CPCCN art. 156 y conc.).
 *
 * Reglas:
 * - Los plazos procesales se cuentan en DÍAS HÁBILES JUDICIALES: se excluyen
 *   sábados, domingos, feriados nacionales y la feria judicial.
 * - No se cuenta el día de la notificación; el cómputo arranca el día hábil
 *   siguiente (art. 156).
 * - Plazo de gracia (art. 124): el escrito puede presentarse dentro de las
 *   primeras horas hábiles del día siguiente al vencimiento.
 *
 * ⚠️ El resultado lista TODOS los días excluidos para que el profesional los
 * audite. Los feriados trasladables y las ferias provinciales varían: SIEMPRE
 * verificar contra el calendario oficial y la jurisdicción que corresponda.
 */

import { parseLocalDate, toISODate } from "./fecha";

const MS_DIA = 1000 * 60 * 60 * 24;

export type MotivoExcluido = "fin de semana" | "feriado" | "feria judicial";

export interface DiaExcluido {
  fecha: string; // ISO YYYY-MM-DD
  motivo: MotivoExcluido;
}

export interface VencimientoResult {
  vencimiento: string; // ISO
  diaGracia: string; // ISO — día hábil siguiente (art. 124)
  horasGracia: number; // 2 (nacional/CABA) o 4 (PBA)
  diasCorridos: number; // días de calendario transcurridos
  excluidos: DiaExcluido[];
  /** Puentes turísticos dentro del período, contados como hábiles: verificar acordada. */
  advertencias: string[];
}

/** Feriados nacionales de fecha fija (formato MM-DD). Actualizar si cambia la ley. */
export const FERIADOS_FIJOS = new Set<string>([
  "01-01", // Año Nuevo
  "03-24", // Día de la Memoria
  "04-02", // Malvinas
  "05-01", // Día del Trabajador
  "05-25", // Revolución de Mayo
  "06-20", // Día de la Bandera
  "07-09", // Independencia
  "12-08", // Inmaculada Concepción
  "12-25", // Navidad
]);

/**
 * Feriados de fecha variable (Carnaval, Viernes Santo) y trasladables conocidos,
 * por año (YYYY-MM-DD). DEBE actualizarse anualmente con el calendario oficial.
 */
export const FERIADOS_ESPECIFICOS = new Set<string>([
  // 2025
  "2025-03-03", "2025-03-04", // Carnaval
  "2025-04-18", // Viernes Santo
  "2025-06-16", // Güemes (17/06 trasladado al lunes 16, ley 27.399)
  "2025-08-17", // San Martín (domingo, no se traslada)
  "2025-10-12", // Diversidad Cultural (domingo)
  "2025-11-24", // Soberanía Nacional (20/11 trasladado al lunes 24)
  // 2026 (calendario oficial: ley 27.399)
  "2026-02-16", "2026-02-17", // Carnaval
  "2026-04-03", // Viernes Santo
  "2026-06-15", // Güemes (17/06 miércoles → lunes 15)
  "2026-08-17", // San Martín (lunes)
  "2026-10-12", // Diversidad Cultural (lunes)
  "2026-11-23", // Soberanía Nacional (20/11 viernes → lunes 23)
]);

/**
 * Días NO LABORABLES con fines turísticos ("puentes", decreto anual del PEN).
 * NO se excluyen del cómputo por defecto: la CSJN suele adherir por acordada,
 * pero contar un día hábil como inhábil corre el vencimiento hacia adelante y
 * es el error peligroso. Se listan como advertencia para que el profesional
 * verifique la acordada de su jurisdicción.
 */
export const PUENTES_TURISTICOS = new Set<string>([
  "2025-05-02", "2025-08-15", "2025-11-21",
  "2026-03-23", "2026-07-10", "2026-12-07",
]);

/**
 * Feria judicial por año: verano (enero completo) + invierno (≈2 semanas de
 * julio fijadas por acordada de la CSJN — VERIFICAR cada año).
 * Cada rango es [desdeISO, hastaISO] inclusive.
 */
export const FERIA_JUDICIAL: Record<number, [string, string][]> = {
  2025: [["2025-01-01", "2025-01-31"], ["2025-07-21", "2025-08-01"]],
  // Invierno 2026: Acordada CSJN 11/2026 (02/06/2026) — 20 al 31 de julio.
  2026: [["2026-01-01", "2026-01-31"], ["2026-07-20", "2026-07-31"]],
};

/** Jurisdicción para el plazo de gracia (art. 124 CPCCN: 2 hs; art. 124 CPCC PBA: 4 hs). */
export type JurisdiccionPlazo = "nacional" | "pba";
export const HORAS_GRACIA: Record<JurisdiccionPlazo, number> = { nacional: 2, pba: 4 };

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * MS_DIA);
}

function enFeriaJudicial(d: Date): boolean {
  const rangos = FERIA_JUDICIAL[d.getFullYear()];
  if (!rangos) {
    // Sin datos del año: aplicamos solo la feria de verano (enero), que es estable.
    return d.getMonth() === 0;
  }
  const iso = toISODate(d);
  return rangos.some(([desde, hasta]) => iso >= desde && iso <= hasta);
}

/** Motivo por el que un día NO es hábil judicial, o null si es hábil. */
export function motivoInhabil(d: Date): MotivoExcluido | null {
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return "fin de semana";
  const mmdd = `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (FERIADOS_FIJOS.has(mmdd) || FERIADOS_ESPECIFICOS.has(toISODate(d))) return "feriado";
  if (enFeriaJudicial(d)) return "feria judicial";
  return null;
}

export function esDiaHabil(d: Date): boolean {
  return motivoInhabil(d) === null;
}

/** Devuelve el primer día hábil en o después de la fecha dada. */
export function proximoDiaHabil(d: Date): Date {
  let cursor = new Date(d);
  while (!esDiaHabil(cursor)) cursor = addDays(cursor, 1);
  return cursor;
}

/**
 * Calcula el vencimiento de un plazo en días hábiles judiciales contado desde
 * (sin incluir) la fecha de notificación.
 */
export function calcularVencimiento(params: {
  desde: string; // fecha de notificación (ISO)
  diasHabiles: number;
  jurisdiccion?: JurisdiccionPlazo;
}): VencimientoResult {
  const inicio = parseLocalDate(params.desde);
  const total = Math.max(1, Math.floor(params.diasHabiles));
  const jurisdiccion = params.jurisdiccion ?? "nacional";

  const excluidos: DiaExcluido[] = [];
  const advertencias: string[] = [];
  let cursor = new Date(inicio);
  let habilesContados = 0;

  while (habilesContados < total) {
    cursor = addDays(cursor, 1); // el día de notificación no se cuenta
    const motivo = motivoInhabil(cursor);
    if (motivo === null) {
      habilesContados++;
      const iso = toISODate(cursor);
      if (PUENTES_TURISTICOS.has(iso)) {
        advertencias.push(`${iso.split("-").reverse().join("/")} es día no laborable turístico: se contó como hábil (criterio conservador). Si la CSJN o la SCBA lo declararon inhábil por acordada, el vencimiento se corre un día.`);
      }
    } else {
      excluidos.push({ fecha: toISODate(cursor), motivo });
    }
  }

  const vencimiento = new Date(cursor);
  const diaGracia = proximoDiaHabil(addDays(vencimiento, 1));
  const diasCorridos = Math.round((vencimiento.getTime() - inicio.getTime()) / MS_DIA);
  const anio = vencimiento.getFullYear();
  if (!FERIA_JUDICIAL[anio]) {
    advertencias.push(`No hay calendario de feria de invierno cargado para ${anio}: verificá la acordada de la CSJN.`);
  }

  return {
    vencimiento: toISODate(vencimiento),
    diaGracia: toISODate(diaGracia),
    horasGracia: HORAS_GRACIA[jurisdiccion],
    diasCorridos,
    excluidos,
    advertencias,
  };
}

/**
 * Prescripción / plazos en días corridos (calendario). Para prescripción civil,
 * laboral, etc. Suma años y/o días corridos a la fecha de inicio.
 */
export function calcularPrescripcion(params: {
  desde: string;
  anios?: number;
  diasCorridos?: number;
}): { vencimiento: string; diasTotales: number } {
  const inicio = parseLocalDate(params.desde);
  const fin = new Date(inicio);
  if (params.anios) fin.setFullYear(fin.getFullYear() + params.anios);
  if (params.diasCorridos) fin.setDate(fin.getDate() + params.diasCorridos);
  const diasTotales = Math.round((fin.getTime() - inicio.getTime()) / MS_DIA);
  return { vencimiento: toISODate(fin), diasTotales };
}

/** Plazos procesales frecuentes (días hábiles, CPCCN nacional salvo aclaración). */
export interface PresetPlazo {
  id: string;
  label: string;
  dias: number;
  fundamento: string;
}

export const PRESETS_PLAZO: PresetPlazo[] = [
  { id: "contestar_demanda", label: "Contestar demanda (ordinario)", dias: 15, fundamento: "art. 338 CPCCN" },
  { id: "contestar_sumario", label: "Contestar demanda (sumarísimo)", dias: 5, fundamento: "art. 498 CPCCN" },
  { id: "apelar_sentencia", label: "Apelar sentencia definitiva", dias: 5, fundamento: "art. 244 CPCCN" },
  { id: "expresar_agravios", label: "Expresar agravios", dias: 10, fundamento: "art. 259 CPCCN" },
  { id: "oponer_excepciones", label: "Oponer excepciones previas", dias: 10, fundamento: "art. 346 CPCCN" },
  { id: "recurso_aclaratoria", label: "Aclaratoria", dias: 3, fundamento: "art. 166 CPCCN" },
  { id: "producir_prueba", label: "Producir la prueba (plazo ordinario)", dias: 40, fundamento: "art. 367 CPCCN (la prueba se OFRECE con la demanda y la contestación, arts. 333 y 356)" },
  { id: "contestar_traslado", label: "Contestar traslado (general)", dias: 5, fundamento: "art. 150 CPCCN" },
  // Fuero laboral nacional (ley 18.345)
  { id: "contestar_demanda_laboral", label: "Contestar demanda laboral (CABA)", dias: 10, fundamento: "art. 68 ley 18.345" },
  { id: "apelar_sentencia_laboral", label: "Apelar sentencia laboral, fundada (CABA)", dias: 6, fundamento: "art. 116 ley 18.345" },
  { id: "contestar_traslado_laboral", label: "Contestar traslado en el fuero laboral (CABA)", dias: 3, fundamento: "art. 48 ley 18.345" },
  // Fuero laboral PBA (ley 15.057)
  { id: "contestar_demanda_laboral_pba", label: "Contestar demanda laboral (PBA)", dias: 10, fundamento: "ley 15.057 PBA (verificar en el texto vigente)" },
];

/** Plazos de prescripción frecuentes (años, días corridos). */
export interface PresetPrescripcion {
  id: string;
  label: string;
  anios: number;
  fundamento: string;
}

export const PRESETS_PRESCRIPCION: PresetPrescripcion[] = [
  { id: "laboral", label: "Créditos laborales", anios: 2, fundamento: "art. 256 LCT" },
  { id: "lrt", label: "Prestaciones ley de riesgos del trabajo", anios: 2, fundamento: "art. 44 ley 24.557 (desde que la prestación debió ser abonada o el cese, según el caso)" },
  { id: "danos", label: "Daños (responsabilidad civil)", anios: 3, fundamento: "art. 2561 CCCN" },
  { id: "generica", label: "Genérica (CCCN)", anios: 5, fundamento: "art. 2560 CCCN" },
  { id: "accidente_civil", label: "Accidente/enfermedad — vía civil", anios: 2, fundamento: "art. 2562 CCCN" },
];
