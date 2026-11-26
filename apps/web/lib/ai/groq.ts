import { MODELOS } from "./models";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

export const GROQ_MODEL = MODELOS.groq;
/** Modelos de Groq en orden de preferencia (misma clave, sin cuenta nueva). */
export const GROQ_MODELOS = [...new Set([MODELOS.groq, MODELOS.groqRespaldo].filter(Boolean))];

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqResponse {
  choices?: { message: { content: string } }[];
  error?: { message: string };
}

type Opciones = { temperature?: number; maxTokens?: number } | undefined;

async function llamar(model: string, messages: GroqMessage[], options: Opciones, stream: boolean) {
  return fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.5,
      max_tokens: options?.maxTokens ?? 2048,
      stream,
    }),
  });
}

/** Prueba cada modelo de Groq en orden; lanza el último error si fallan todos. */
async function conRespaldo<T>(intento: (model: string) => Promise<T>): Promise<{ valor: T; model: string }> {
  let ultimo: unknown = new Error("Groq: sin modelos configurados");
  for (const model of GROQ_MODELOS) {
    try {
      return { valor: await intento(model), model };
    } catch (err) {
      ultimo = err;
      console.warn(`[ia] groq ${model} falló: ${err instanceof Error ? err.message.slice(0, 200) : err}`);
    }
  }
  throw ultimo;
}

export async function groqChat(messages: GroqMessage[], options?: Opciones): Promise<{ content: string; model: string }> {
  const { valor, model } = await conRespaldo(async (m) => {
    const res = await llamar(m, messages, options, false);
    const data: GroqResponse = await res.json();
    if (data.error) throw new Error(data.error.message);
    const content = data.choices?.[0]?.message?.content;
    if (!res.ok || !content) throw new Error(`Groq API error: ${res.status}`);
    return content;
  });
  return { content: valor, model };
}

export async function groqChatStream(
  messages: GroqMessage[],
  options?: Opciones,
): Promise<{ body: ReadableStream<Uint8Array>; model: string }> {
  const { valor, model } = await conRespaldo(async (m) => {
    const res = await llamar(m, messages, options, true);
    if (!res.ok || !res.body) {
      const detalle = await res.text().catch(() => "");
      throw new Error(`Groq API error: ${res.status} ${detalle.slice(0, 160)}`);
    }
    return res.body;
  });
  return { body: valor, model };
}
