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
  diasCorridos: number; // días de calendario transcurridos
  excluidos: DiaExcluido[];
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
  // 2026
  "2026-02-16", "2026-02-17", // Carnaval
  "2026-04-03", // Viernes Santo
]);

/**
 * Feria judicial por año: verano (enero completo) + invierno (≈2 semanas de
 * julio fijadas por acordada de la CSJN — VERIFICAR cada año).
 * Cada rango es [desdeISO, hastaISO] inclusive.
 */
export const FERIA_JUDICIAL: Record<number, [string, string][]> = {
  2025: [["2025-01-01", "2025-01-31"], ["2025-07-14", "2025-07-25"]],
  2026: [["2026-01-01", "2026-01-31"], ["2026-07-13", "2026-07-24"]],
};

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
}): VencimientoResult {
  const inicio = parseLocalDate(params.desde);
  const total = Math.max(1, Math.floor(params.diasHabiles));

  const excluidos: DiaExcluido[] = [];
  let cursor = new Date(inicio);
  let habilesContados = 0;

  while (habilesContados < total) {
    cursor = addDays(cursor, 1); // el día de notificación no se cuenta
    const motivo = motivoInhabil(cursor);
    if (motivo === null) {
      habilesContados++;
    } else {
      excluidos.push({ fecha: toISODate(cursor), motivo });
    }
  }

  const vencimiento = new Date(cursor);
  const diaGracia = proximoDiaHabil(addDays(vencimiento, 1));
  const diasCorridos = Math.round((vencimiento.getTime() - inicio.getTime()) / MS_DIA);

  return {
    vencimiento: toISODate(vencimiento),
    diaGracia: toISODate(diaGracia),
    diasCorridos,
    excluidos,
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
  { id: "ofrecer_prueba", label: "Ofrecer prueba", dias: 10, fundamento: "art. 367 CPCCN" },
  { id: "contestar_traslado", label: "Contestar traslado (general)", dias: 5, fundamento: "art. 150 CPCCN" },
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
  { id: "danos", label: "Daños (responsabilidad civil)", anios: 3, fundamento: "art. 2561 CCCN" },
  { id: "generica", label: "Genérica (CCCN)", anios: 5, fundamento: "art. 2560 CCCN" },
  { id: "accidente_civil", label: "Accidente/enfermedad — vía civil", anios: 2, fundamento: "art. 2562 CCCN" },
];
