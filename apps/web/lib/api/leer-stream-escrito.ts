"use client";

import { parseStreamedEscrito } from "./stream-escrito";

/**
 * Consume la respuesta en streaming de /api/generate-escrito(-custom) desde el
 * cliente. Llama a `onTexto` con el texto acumulado (sin marcadores) a medida
 * que llega, y resuelve con el id guardado o un error.
 */
export async function leerStreamEscrito(
  res: Response,
  onTexto: (texto: string) => void,
): Promise<{ texto: string; id?: string; error?: string }> {
  const reader = res.body?.getReader();
  if (!reader) return { texto: "", error: "Respuesta vacía del servidor." };
  const decoder = new TextDecoder();
  let raw = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    raw += decoder.decode(value, { stream: true });
    // No mostrar el marcador de cierre mientras llega.
    const corte = raw.indexOf("\n<<<legalia:");
    onTexto(corte >= 0 ? raw.slice(0, corte) : raw);
  }
  return parseStreamedEscrito(raw);
}
