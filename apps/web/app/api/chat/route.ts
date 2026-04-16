import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { buildChatSystemPrompt } from "@/lib/ai/prompts/base-legal";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { message } = await request.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
  }

  const { data: canUse } = await supabase.rpc("check_and_increment_usage", {
    p_user_id: user.id,
    p_kind: "consulta",
  });

  if (!canUse) {
    return NextResponse.json(
      { error: "Alcanzaste el límite de consultas de tu plan. Actualizá para continuar." },
      { status: 429 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    const demoResponse = `[MODO DEMO — Sin API key de Anthropic]\n\nTu consulta: "${message}"\n\nPara respuestas reales, configurá ANTHROPIC_API_KEY en .env.local`;

    await supabase.from("consultas_ia").insert({
      user_id: user.id,
      pregunta: message,
      respuesta: demoResponse,
      modelo_usado: "demo",
    });

    return new Response(demoResponse, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  try {
    const { getAnthropicClient } = await import("@/lib/ai/anthropic");
    const anthropic = getAnthropicClient();

    const systemPrompt = buildChatSystemPrompt();

    const stream = anthropic.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      temperature: 0.5,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: message }],
    });

    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              const text = event.delta.text;
              fullResponse += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          await supabase.from("consultas_ia").insert({
            user_id: user.id,
            pregunta: message,
            respuesta: fullResponse,
            modelo_usado: "haiku-4.5",
          });
        } catch (streamError: unknown) {
          const errMsg = streamError instanceof Error ? streamError.message : "Error de IA";
          controller.enqueue(encoder.encode(`\n\n[Error: ${errMsg}]`));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Error desconocido";
    const isCredits = errMsg.includes("credit balance");
    return NextResponse.json(
      {
        error: isCredits
          ? "Sin créditos en Anthropic. Cargá saldo en console.anthropic.com/settings/billing"
          : `Error al consultar la IA: ${errMsg}`,
      },
      { status: 502 }
    );
  }
}
