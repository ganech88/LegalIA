/**
 * AI Provider chain: Groq (free) → Gemini (free) → Anthropic (paid)
 * Each provider is tried in order. If one fails, the next is used.
 */

type Provider = "groq" | "gemini" | "anthropic" | "demo";

interface GenerateResult {
  content: string;
  provider: Provider;
}

function availableProviders(): Provider[] {
  const providers: Provider[] = [];
  if (process.env.GROQ_API_KEY) providers.push("groq");
  if (process.env.GOOGLE_AI_API_KEY) providers.push("gemini");
  if (process.env.ANTHROPIC_API_KEY) providers.push("anthropic");
  return providers;
}

// --- Non-streaming generation (for escritos) ---

async function generateWithGroq(
  systemPrompt: string,
  userMessage: string,
  temperature: number,
  maxTokens: number,
): Promise<string> {
  const { groqChat } = await import("@/lib/ai/groq");
  return groqChat(systemPrompt, userMessage, { temperature, maxTokens });
}

async function generateWithGemini(
  systemPrompt: string,
  userMessage: string,
  temperature: number,
  maxTokens: number,
): Promise<string> {
  const { getGeminiClient, GEMINI_FLASH_MODEL } = await import("@/lib/ai/gemini");
  const gemini = getGeminiClient();
  const response = await gemini.models.generateContent({
    model: GEMINI_FLASH_MODEL,
    config: {
      systemInstruction: systemPrompt,
      temperature,
      maxOutputTokens: maxTokens,
    },
    contents: [{ role: "user", parts: [{ text: userMessage }] }],
  });
  return response.text ?? "";
}

async function generateWithAnthropic(
  systemPrompt: string,
  userMessage: string,
  temperature: number,
  maxTokens: number,
): Promise<string> {
  const { getAnthropicClient } = await import("@/lib/ai/anthropic");
  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    temperature,
    system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userMessage }],
  });
  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text ?? "";
}

const generators: Record<Provider, typeof generateWithGroq> = {
  groq: generateWithGroq,
  gemini: generateWithGemini,
  anthropic: generateWithAnthropic,
  demo: async () => "",
};

export async function generateWithFallback(
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number },
): Promise<GenerateResult> {
  const providers = availableProviders();
  const temp = options?.temperature ?? 0.3;
  const maxTok = options?.maxTokens ?? 4096;

  if (providers.length === 0) {
    return { content: "", provider: "demo" };
  }

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    try {
      const content = await generators[provider](systemPrompt, userMessage, temp, maxTok);
      return { content, provider };
    } catch {
      // If last provider, throw
      if (i === providers.length - 1) {
        throw new Error(`All AI providers failed. Last tried: ${provider}`);
      }
      // Otherwise try next provider
    }
  }

  return { content: "", provider: "demo" };
}

// --- Streaming generation (for chat) ---

export async function streamWithFallback(
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number },
): Promise<{ stream: ReadableStream<Uint8Array>; provider: Provider; collectResponse: () => string }> {
  const providers = availableProviders();
  const temp = options?.temperature ?? 0.5;
  const maxTok = options?.maxTokens ?? 2048;

  if (providers.length === 0) {
    const encoder = new TextEncoder();
    const text = `[MODO DEMO — Sin API key configurada]\n\nConfigurá GROQ_API_KEY, GOOGLE_AI_API_KEY o ANTHROPIC_API_KEY en .env.local`;
    let collected = text;
    return {
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(text));
          controller.close();
        },
      }),
      provider: "demo",
      collectResponse: () => collected,
    };
  }

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    try {
      const result = await buildStream(provider, systemPrompt, userMessage, temp, maxTok);
      return { ...result, provider };
    } catch {
      if (i === providers.length - 1) {
        throw new Error(`All AI providers failed. Last tried: ${provider}`);
      }
    }
  }

  throw new Error("No providers available");
}

async function buildStream(
  provider: Provider,
  systemPrompt: string,
  userMessage: string,
  temperature: number,
  maxTokens: number,
): Promise<{ stream: ReadableStream<Uint8Array>; collectResponse: () => string }> {
  let fullResponse = "";
  const encoder = new TextEncoder();

  if (provider === "groq") {
    const { groqChatStream } = await import("@/lib/ai/groq");
    const groqStream = await groqChatStream(systemPrompt, userMessage, { temperature, maxTokens });
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
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
                const parsed = JSON.parse(data);
                const text = parsed.choices?.[0]?.delta?.content ?? "";
                if (text) {
                  fullResponse += text;
                  controller.enqueue(encoder.encode(text));
                }
              } catch { /* skip malformed */ }
            }
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Error";
          controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`));
        }
        controller.close();
      },
    });
    return { stream, collectResponse: () => fullResponse };
  }

  if (provider === "gemini") {
    const { getGeminiClient, GEMINI_FLASH_MODEL } = await import("@/lib/ai/gemini");
    const gemini = getGeminiClient();

    const geminiStream = await gemini.models.generateContentStream({
      model: GEMINI_FLASH_MODEL,
      config: { systemInstruction: systemPrompt, temperature, maxOutputTokens: maxTokens },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of geminiStream) {
            const text = chunk.text ?? "";
            if (text) {
              fullResponse += text;
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Error";
          controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`));
        }
        controller.close();
      },
    });
    return { stream, collectResponse: () => fullResponse };
  }

  // Anthropic
  const { getAnthropicClient } = await import("@/lib/ai/anthropic");
  const anthropic = getAnthropicClient();
  const anthropicStream = anthropic.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: maxTokens,
    temperature,
    system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userMessage }],
  });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of anthropicStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            const text = event.delta.text;
            fullResponse += text;
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error";
        controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`));
      }
      controller.close();
    },
  });
  return { stream, collectResponse: () => fullResponse };
}

/** Maps provider to display name for DB storage */
export function providerModelName(provider: Provider): string {
  const names: Record<Provider, string> = {
    groq: "groq-llama-3.3-70b",
    gemini: "gemini-flash",
    anthropic: "sonnet-4.6",
    demo: "demo",
  };
  return names[provider];
}

/** For chat, Anthropic uses Haiku not Sonnet */
export function providerChatModelName(provider: Provider): string {
  const names: Record<Provider, string> = {
    groq: "groq-llama-3.3-70b",
    gemini: "gemini-flash",
    anthropic: "haiku-4.5",
    demo: "demo",
  };
  return names[provider];
}
