/**
 * Utilidades de fecha seguras frente a zona horaria.
 *
 * `new Date("2026-03-02")` se interpreta como UTC medianoche; al leer
 * getDate()/getMonth() en una zona al oeste de UTC (Argentina, UTC-3) se corre
 * al día anterior. Estas funciones tratan las fechas "YYYY-MM-DD" como fechas
 * LOCALES (sin hora), evitando ese desfase en los cálculos legales.
 */

/** Parsea "YYYY-MM-DD" (o un Date/ISO) como fecha local a medianoche. */
export function parseLocalDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  return new Date(value);
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Formatea un Date como "YYYY-MM-DD" usando componentes locales. */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
