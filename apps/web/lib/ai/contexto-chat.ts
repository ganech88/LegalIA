/**
 * Armado del contexto de una consulta al asistente: qué se busca en la base
 * legal, qué historial viaja y qué tope de uso tiene cada plan.
 */
import type { Turno } from "./provider";

/** Turnos del historial que viajan al modelo, y su recorte. */
export const HISTORIAL_TURNOS = 4;
export const HISTORIAL_MAX_CHARS = 1500;

export function recortarHistorial(historial: Turno[]): Turno[] {
  return historial.slice(-HISTORIAL_TURNOS).map((m) => ({
    role: m.role,
    content: m.content.length > HISTORIAL_MAX_CHARS ? `${m.content.slice(0, HISTORIAL_MAX_CHARS)}…` : m.content,
  }));
}

/**
 * Texto que se manda a la búsqueda semántica. Una repregunta corta ("¿y en
 * PBA?") no dice de qué se habla: se le antepone la consulta anterior del
 * abogado. Sin llamada extra a un modelo.
 */
export function construirConsultaRag(mensaje: string, historial: Turno[]): string {
  const actual = mensaje.trim();
  if (actual.length >= 90) return actual;
  const previa = [...historial].reverse().find((m) => m.role === "user")?.content.trim();
  return previa ? `${previa.slice(0, 300)}\n${actual}` : actual;
}

/**
 * Tope DIARIO de tokens por usuario (entrada + salida, estimados). Protege la
 * bolsa compartida de los proveedores: sin esto, un solo usuario puede agotar
 * la cuota de todos.
 */
export const TOPE_TOKENS_DIA: Record<string, number> = {
  free: 40_000,
  profesional: 300_000,
  estudio: 600_000,
};

export function topeTokensDia(plan: string | null | undefined): number {
  return TOPE_TOKENS_DIA[plan ?? "free"] ?? TOPE_TOKENS_DIA.free;
}
