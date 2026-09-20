import { streamWithFallback, providerModelName, type Provider } from "@/lib/ai/provider";

/**
 * Generación de escritos en STREAMING.
 *
 * El cliente recibe el texto a medida que el modelo lo redacta (antes esperaba
 * 45-90 s mirando un contador) y, al final, una línea de cierre con el
 * resultado del guardado:
 *
 *   ...texto del escrito...\n<<<legalia:done>>>{"id":"uuid"}
 *   ...texto parcial...\n<<<legalia:error>>>{"error":"..."}
 *
 * `onComplete` recibe el texto completo y devuelve el id del escrito guardado.
 * Si algo falla (proveedor, guardado) se llama a `refund()` y el cliente
 * conserva el texto parcial para copiarlo.
 */
export const DONE_MARKER = "\n<<<legalia:done>>>";
export const ERROR_MARKER = "\n<<<legalia:error>>>";

export async function streamEscrito(params: {
  systemPrompt: string;
  userMessage: string;
  temperature?: number;
  maxTokens?: number;
  onComplete: (content: string, provider: Provider, modelo: string) => Promise<string>;
  refund: () => Promise<void>;
}): Promise<Response> {
  const { systemPrompt, userMessage, temperature = 0.3, maxTokens = 4096, onComplete, refund } = params;
  const encoder = new TextEncoder();

  let upstream: Awaited<ReturnType<typeof streamWithFallback>>;
  try {
    upstream = await streamWithFallback(systemPrompt, userMessage, { temperature, maxTokens, kind: "escrito" });
  } catch (error: unknown) {
    await refund();
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return Response.json({ error: `Error al generar el escrito: ${msg}` }, { status: 502 });
  }

  if (upstream.provider === "demo") {
    await refund();
    return Response.json({ error: "No hay proveedor de IA configurado." }, { status: 503 });
  }

  const { stream, provider, collectResponse } = upstream;

  const wrapped = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = stream.getReader();
      let falló = false;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
      } catch {
        falló = true;
      }

      const content = collectResponse();
      const errorMidStream = /\n\n\[Error: /.test(content);

      try {
        if (falló || errorMidStream || !content.trim()) {
          await refund();
          controller.enqueue(encoder.encode(ERROR_MARKER + JSON.stringify({ error: "La generación se interrumpió. No se descontó de tu cuota." })));
        } else {
          try {
            const id = await onComplete(content, provider, providerModelName(provider));
            controller.enqueue(encoder.encode(DONE_MARKER + JSON.stringify({ id })));
          } catch (e: unknown) {
            await refund();
            const msg = e instanceof Error ? e.message : "No se pudo guardar el escrito";
            controller.enqueue(encoder.encode(ERROR_MARKER + JSON.stringify({ error: `${msg}. Copiá el texto; no se descontó de tu cuota.` })));
          }
        }
      } finally {
        try { controller.close(); } catch { /* ya cerrado */ }
      }
    },
  });

  return new Response(wrapped, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

/** Utilidad para el cliente: separa el texto del marcador de cierre. */
export function parseStreamedEscrito(raw: string): { texto: string; id?: string; error?: string } {
  const d = raw.lastIndexOf(DONE_MARKER);
  if (d >= 0) {
    try {
      const j = JSON.parse(raw.slice(d + DONE_MARKER.length)) as { id: string };
      return { texto: raw.slice(0, d), id: j.id };
    } catch { /* cae abajo */ }
  }
  const e = raw.lastIndexOf(ERROR_MARKER);
  if (e >= 0) {
    try {
      const j = JSON.parse(raw.slice(e + ERROR_MARKER.length)) as { error: string };
      return { texto: raw.slice(0, e), error: j.error };
    } catch { /* cae abajo */ }
  }
  return { texto: raw };
}
