const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

export const GROQ_MODEL = "llama-3.3-70b-versatile";

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqChoice {
  message: { content: string };
}

interface GroqResponse {
  choices: GroqChoice[];
  error?: { message: string };
}

export async function groqChat(
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number },
): Promise<string> {
  const messages: GroqMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
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
      stream: false,
    }),
  });

  const data: GroqResponse = await res.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.choices[0].message.content;
}

export async function groqChatStream(
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number },
): Promise<ReadableStream<Uint8Array>> {
  const messages: GroqMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
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
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Groq API error: ${res.status}`);
  }

  return res.body;
}
