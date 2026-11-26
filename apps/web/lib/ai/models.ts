/**
 * IDs de modelo en UN solo lugar, con override por variable de entorno.
 *
 * Los proveedores retiran modelos seguido: `llama-3.3-70b-versatile` (Groq)
 * dejó de responder el 16/08/2026 y `gemini-2.0-flash` el 01/06/2026, y el
 * chat cayó en silencio al último proveedor de la cadena. Si un modelo vuelve
 * a retirarse, alcanza con cambiar la variable en Vercel, sin deploy de código.
 */
export const MODELOS = {
  groq: process.env.GROQ_MODEL ?? "openai/gpt-oss-120b",
  /** Segundo modelo de Groq (misma clave): se prueba si el primero falla o agota su cuota. */
  groqRespaldo: process.env.GROQ_MODEL_RESPALDO ?? "openai/gpt-oss-20b",
  gemini: process.env.GEMINI_MODEL ?? "gemini-3.8-flash",
  anthropicChat: process.env.ANTHROPIC_CHAT_MODEL ?? "claude-haiku-4-5-20251001",
  anthropicEscrito: process.env.ANTHROPIC_ESCRITO_MODEL ?? "claude-sonnet-4-6",
} as const;

/** Estimación de tokens (≈3,6 caracteres por token en español). Solo para topes y métricas. */
export function estimarTokens(texto: string): number {
  return Math.ceil((texto ?? "").length / 3.6);
}
