import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { buildChatSystemPrompt } from "@/lib/ai/prompts/base-legal";
import { streamWithFallback, providerChatModelName } from "@/lib/ai/provider";

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

  try {
    const systemPrompt = buildChatSystemPrompt();
    const { stream, provider, collectResponse } = await streamWithFallback(
      systemPrompt, message, { temperature: 0.5, maxTokens: 2048 },
    );

    // Save to DB after stream completes
    const wrappedStream = new ReadableStream({
      async start(controller) {
        const reader = stream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } finally {
          controller.close();
          await supabase.from("consultas_ia").insert({
            user_id: user.id,
            pregunta: message,
            respuesta: collectResponse(),
            modelo_usado: providerChatModelName(provider),
          });
        }
      },
    });

    return new Response(wrappedStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: `Error al consultar la IA: ${errMsg}` }, { status: 502 });
  }
}
