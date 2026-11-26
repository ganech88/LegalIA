import { MODELOS } from "./models";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

export const GROQ_MODEL = MODELOS.groq;

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqResponse {
  choices?: { message: { content: string } }[];
  error?: { message: string };
}

async function llamar(messages: GroqMessage[], options: { temperature?: number; maxTokens?: number } | undefined, stream: boolean) {
  return fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: options?.temperature ?? 0.5,
      max_tokens: options?.maxTokens ?? 2048,
      stream,
    }),
  });
}

export async function groqChat(
  messages: GroqMessage[],
  options?: { temperature?: number; maxTokens?: number },
): Promise<string> {
  const res = await llamar(messages, options, false);
  const data: GroqResponse = await res.json();
  if (data.error) throw new Error(data.error.message);
  const content = data.choices?.[0]?.message?.content;
  if (!res.ok || !content) throw new Error(`Groq API error: ${res.status}`);
  return content;
}

export async function groqChatStream(
  messages: GroqMessage[],
  options?: { temperature?: number; maxTokens?: number },
): Promise<ReadableStream<Uint8Array>> {
  const res = await llamar(messages, options, true);
  if (!res.ok || !res.body) {
    const detalle = await res.text().catch(() => "");
    throw new Error(`Groq API error: ${res.status} ${detalle.slice(0, 160)}`);
  }
  return res.body;
}
