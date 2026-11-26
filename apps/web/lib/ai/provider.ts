/**
 * Cadena de proveedores de IA con fallback configurable.
 *
 * ORDEN POR DEFECTO según el tipo de tarea:
 *  - Escritos: anthropic → groq  (calidad primero)
 *  - Chat:     según el plan del usuario (ver ordenChatPorPlan)
 *
 * Se puede sobreescribir con variables de entorno (lista separada por comas):
 *   AI_PROVIDER_ORDER   orden global
 *   AI_ESCRITO_ORDER    orden solo para escritos
 *   AI_CHAT_ORDER       orden solo para el chat
 * Los IDs de modelo están en lib/ai/models.ts (también con override por env).
 *
 * COMPLIANCE (Ley 25.326 / secreto profesional): los escritos contienen datos
 * personales y confidenciales de las partes. Conviene priorizar para escritos un
 * proveedor cuyos términos NO usen los datos para entrenar modelos. Verificar las
 * políticas de cada proveedor antes de procesar datos reales de clientes.
 */
import { MODELOS } from "./models";

export type Provider = "groq" | "gemini" | "anthropic" | "demo";
export type Kind = "escrito" | "chat";

export interface Turno {
  role: "user" | "assistant";
  content: string;
}

/**
 * Entrada de una generación. `bloques` es el system prompt partido de lo más
 * estable a lo más variable: el primer bloque es idéntico para todos los
 * usuarios y es el que se marca para caché.
 */
export interface Entrada {
  bloques: string[];
  mensajes: Turno[];
}

export interface Fallo {
  provider: Provider;
  error: string;
}

const ALL_PROVIDERS: Provider[] = ["groq", "gemini", "anthropic"];
/**
 * Gemini quedó fuera de la cadena por defecto (26/11/2026): el proyecto de
 * Google está sin crédito y cada consulta perdía tiempo en un intento fallido.
 * El código se conserva: para volver a usarlo alcanza con nombrarlo en
 * AI_CHAT_ORDER / AI_ESCRITO_ORDER (por ejemplo "anthropic,gemini,groq").
 */

interface GenerateResult {
  content: string;
  provider: Provider;
}

function providerHasKey(p: Provider): boolean {
  if (p === "groq") return Boolean(process.env.GROQ_API_KEY);
  if (p === "gemini") return Boolean(process.env.GOOGLE_AI_API_KEY);
  if (p === "anthropic") return Boolean(process.env.ANTHROPIC_API_KEY);
  return false;
}

function parseOrder(value: string | undefined): Provider[] | null {
  if (!value) return null;
  const parsed = value
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is Provider => (ALL_PROVIDERS as string[]).includes(s));
  return parsed.length ? parsed : null;
}

/**
 * Orden del chat según el plan. Las cuotas gratuitas de Groq y Google son por
 * proyecto (una sola bolsa para toda la plataforma), no por usuario: no
 * escalan. Por eso el usuario pago va primero al modelo pago —lo financia su
 * suscripción— y el plan gratis usa primero la cuota gratuita de Groq.
 */
export function ordenChatPorPlan(plan: string | null | undefined): Provider[] {
  return plan && plan !== "free" ? ["anthropic", "groq"] : ["groq", "anthropic"];
}

function availableProviders(kind: Kind, preferido?: Provider[]): Provider[] {
  const escritoDefault: Provider[] = ["anthropic", "groq"];
  const specific = kind === "escrito"
    ? parseOrder(process.env.AI_ESCRITO_ORDER)
    : parseOrder(process.env.AI_CHAT_ORDER);
  const order =
    specific ??
    parseOrder(process.env.AI_PROVIDER_ORDER) ??
    (kind === "escrito" ? escritoDefault : preferido ?? ordenChatPorPlan(null));
  return order.filter(providerHasKey);
}

function registrarFallo(fallos: Fallo[], provider: Provider, err: unknown) {
  const error = err instanceof Error ? err.message : String(err);
  fallos.push({ provider, error: error.slice(0, 300) });
  // Un proveedor caído no debe pasar inadvertido (así se retiraron dos modelos sin que nadie lo viera).
  console.warn(`[ia] ${provider} falló, se prueba el siguiente: ${error.slice(0, 300)}`);
}

/** El historial debe empezar con el usuario y alternar roles; se descarta lo que no cumpla. */
export function normalizarMensajes(mensajes: Turno[]): Turno[] {
  const out: Turno[] = [];
  for (const m of mensajes) {
    if (!m.content?.trim()) continue;
    const ultimo = out[out.length - 1];
    if (!ultimo && m.role !== "user") continue;
    if (ultimo && ultimo.role === m.role) {
      ultimo.content += `\n\n${m.content}`;
    } else {
      out.push({ role: m.role, content: m.content });
    }
  }
  while (out.length && out[out.length - 1].role !== "user") out.pop();
  return out;
}

const sistemaPlano = (e: Entrada) => e.bloques.filter(Boolean).join("\n\n");

function sistemaAnthropic(e: Entrada) {
  return e.bloques.filter(Boolean).map((text, i) =>
    i === 0 ? { type: "text" as const, text, cache_control: { type: "ephemeral" as const } } : { type: "text" as const, text },
  );
}

const modeloAnthropic = (kind: Kind) => (kind === "escrito" ? MODELOS.anthropicEscrito : MODELOS.anthropicChat);

// --- Generación sin streaming ---

async function generar(provider: Provider, e: Entrada, temperature: number, maxTokens: number, kind: Kind): Promise<string> {
  if (provider === "groq") {
    const { groqChat } = await import("@/lib/ai/groq");
    return (await groqChat([{ role: "system", content: sistemaPlano(e) }, ...e.mensajes], { temperature, maxTokens })).content;
  }
  if (provider === "gemini") {
    const { getGeminiClient, GEMINI_FLASH_MODEL } = await import("@/lib/ai/gemini");
    const response = await getGeminiClient().models.generateContent({
      model: GEMINI_FLASH_MODEL,
      config: { systemInstruction: sistemaPlano(e), temperature, maxOutputTokens: maxTokens },
      contents: e.mensajes.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    });
    const texto = response.text ?? "";
    if (!texto.trim()) throw new Error("Gemini devolvió una respuesta vacía");
    return texto;
  }
  const { getAnthropicClient } = await import("@/lib/ai/anthropic");
  const response = await getAnthropicClient().messages.create({
    model: modeloAnthropic(kind),
    max_tokens: maxTokens,
    temperature,
    system: sistemaAnthropic(e),
    messages: e.mensajes,
  });
  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text ?? "";
}

export async function generateWithFallback(
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number; kind?: Kind; orden?: Provider[] },
): Promise<GenerateResult> {
  const kind = options?.kind ?? "escrito";
  const providers = availableProviders(kind, options?.orden);
  const temp = options?.temperature ?? 0.3;
  const maxTok = options?.maxTokens ?? 4096;
  if (providers.length === 0) return { content: "", provider: "demo" };

  const entrada: Entrada = { bloques: [systemPrompt], mensajes: [{ role: "user", content: userMessage }] };
  const fallos: Fallo[] = [];
  for (const provider of providers) {
    try {
      return { content: await generar(provider, entrada, temp, maxTok, kind), provider };
    } catch (err) {
      registrarFallo(fallos, provider, err);
    }
  }
  throw new Error(`All AI providers failed. Last tried: ${providers[providers.length - 1]}`);
}

// --- Generación con streaming ---

export interface StreamResult {
  stream: ReadableStream<Uint8Array>;
  provider: Provider;
  collectResponse: () => string;
  /** Modelo exacto que respondió, cuando el proveedor tiene más de uno. */
  modelo?: string;
  /** Proveedores que fallaron antes del que respondió. */
  fallos: Fallo[];
}

/** Streaming con la entrada completa (bloques de sistema + historial como mensajes reales). */
export async function streamEntradaWithFallback(
  entrada: Entrada,
  options?: { temperature?: number; maxTokens?: number; kind?: Kind; orden?: Provider[] },
): Promise<StreamResult> {
  const kind = options?.kind ?? "chat";
  const providers = availableProviders(kind, options?.orden);
  const temp = options?.temperature ?? 0.5;
  const maxTok = options?.maxTokens ?? 2048;

  if (providers.length === 0) {
    const text = `[MODO DEMO — Sin API key configurada]\n\nConfigurá GROQ_API_KEY, GOOGLE_AI_API_KEY o ANTHROPIC_API_KEY en .env.local`;
    return {
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(text));
          controller.close();
        },
      }),
      provider: "demo",
      collectResponse: () => text,
      fallos: [],
    };
  }

  const limpia: Entrada = { bloques: entrada.bloques, mensajes: normalizarMensajes(entrada.mensajes) };
  const fallos: Fallo[] = [];
  for (const provider of providers) {
    try {
      const result = await buildStream(provider, limpia, temp, maxTok, kind);
      return { ...result, provider, fallos };
    } catch (err) {
      registrarFallo(fallos, provider, err);
    }
  }
  throw new Error(`All AI providers failed. Last tried: ${providers[providers.length - 1]}`);
}

/** Firma anterior (un system prompt + un mensaje): la usan los escritos. */
export async function streamWithFallback(
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number; kind?: Kind },
): Promise<StreamResult> {
  return streamEntradaWithFallback(
    { bloques: [systemPrompt], mensajes: [{ role: "user", content: userMessage }] },
    options,
  );
}

async function buildStream(
  provider: Provider,
  e: Entrada,
  temperature: number,
  maxTokens: number,
  kind: Kind,
): Promise<{ stream: ReadableStream<Uint8Array>; collectResponse: () => string; modelo?: string }> {
  let fullResponse = "";
  const encoder = new TextEncoder();
  const emitirError = (controller: ReadableStreamDefaultController<Uint8Array>, err: unknown) => {
    const msg = err instanceof Error ? err.message : "Error";
    controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`));
  };

  if (provider === "groq") {
    const { groqChatStream } = await import("@/lib/ai/groq");
    const { body: groqStream, model: modeloGroq } = await groqChatStream(
      [{ role: "system", content: sistemaPlano(e) }, ...e.mensajes],
      { temperature, maxTokens },
    );
    const decoder = new TextDecoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const reader = groqStream.getReader();
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const text = JSON.parse(data).choices?.[0]?.delta?.content ?? "";
                if (text) {
                  fullResponse += text;
                  controller.enqueue(encoder.encode(text));
                }
              } catch { /* skip malformed */ }
            }
          }
        } catch (err) {
          emitirError(controller, err);
        }
        controller.close();
      },
    });
    return { stream, collectResponse: () => fullResponse, modelo: `groq:${modeloGroq}` };
  }

  if (provider === "gemini") {
    const { getGeminiClient, GEMINI_FLASH_MODEL } = await import("@/lib/ai/gemini");
    const geminiStream = await getGeminiClient().models.generateContentStream({
      model: GEMINI_FLASH_MODEL,
      config: { systemInstruction: sistemaPlano(e), temperature, maxOutputTokens: maxTokens },
      contents: e.mensajes.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    });
    // Igual que con Anthropic: se espera el primer fragmento para que un modelo
    // retirado o una cuota agotada salten acá y la cadena pase al siguiente.
    const iterator = geminiStream[Symbol.asyncIterator]();
    const primero = await iterator.next();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          let paso = primero;
          while (!paso.done) {
            const text = paso.value.text ?? "";
            if (text) {
              fullResponse += text;
              controller.enqueue(encoder.encode(text));
            }
            paso = await iterator.next();
          }
        } catch (err) {
          emitirError(controller, err);
        }
        controller.close();
      },
    });
    return { stream, collectResponse: () => fullResponse };
  }

  // Anthropic
  const { getAnthropicClient } = await import("@/lib/ai/anthropic");
  const anthropicStream = getAnthropicClient().messages.stream({
    model: modeloAnthropic(kind),
    max_tokens: maxTokens,
    temperature,
    system: sistemaAnthropic(e),
    messages: e.mensajes,
  });

  // Esperamos el PRIMER evento antes de devolver el stream: así un 401/429/529
  // de Anthropic se lanza acá y la cadena pasa al siguiente proveedor, en vez
  // de terminar como "[Error: ...]" dentro de la respuesta del usuario.
  const iterator = anthropicStream[Symbol.asyncIterator]();
  const primero = await iterator.next();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        let paso = primero;
        while (!paso.done) {
          const event = paso.value;
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            const text = event.delta.text;
            fullResponse += text;
            controller.enqueue(encoder.encode(text));
          }
          paso = await iterator.next();
        }
      } catch (err) {
        emitirError(controller, err);
      }
      controller.close();
    },
  });
  return { stream, collectResponse: () => fullResponse };
}

/** Nombre del modelo para guardar en la base (escritos). */
export function providerModelName(provider: Provider): string {
  const names: Record<Provider, string> = {
    groq: `groq:${MODELOS.groq}`,
    gemini: `google:${MODELOS.gemini}`,
    anthropic: MODELOS.anthropicEscrito,
    demo: "demo",
  };
  return names[provider];
}

/** Nombre del modelo para guardar en la base (chat). */
export function providerChatModelName(provider: Provider): string {
  return provider === "anthropic" ? MODELOS.anthropicChat : providerModelName(provider);
}
