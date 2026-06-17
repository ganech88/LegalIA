import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { buildChatSystemPrompt } from "@/lib/ai/prompts/base-legal";
import { streamWithFallback, providerChatModelName } from "@/lib/ai/provider";
import { buildRagContext, buildCaseContext } from "@/lib/legal/rag";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { message } = await request.json();
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
  }
  if (message.length > 4000) {
    return NextResponse.json({ error: "La consulta es demasiado larga (máx. 4000 caracteres)." }, { status: 400 });
  }

  const { data: rlOk } = await supabase.rpc("check_rate_limit", {
    p_user_id: user.id, p_action: "consulta", p_max: 20, p_window_seconds: 60,
  });
  if (rlOk === false) {
    return NextResponse.json(
      { error: "Demasiadas consultas en poco tiempo. Esperá un momento e intentá de nuevo." },
      { status: 429 }
    );
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
    const ragContext = buildRagContext(message);

    const { data: casos } = await supabase
      .from("casos")
      .select("caratula, expediente, fuero, jurisdiccion, juzgado, notas, estado")
      .eq("user_id", user.id)
      .eq("estado", "activo")
      .limit(10);

    const { data: escritosRecientes } = await supabase
      .from("escritos")
      .select("titulo, tipo, contenido_generado")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3);

    const caseContext = buildCaseContext(casos ?? [], escritosRecientes ?? []);
    const fullContext = [ragContext, caseContext].filter(Boolean).join("\n\n---\n\n");

    const systemPrompt = buildChatSystemPrompt(fullContext || undefined);
    const { stream, provider, collectResponse } = await streamWithFallback(
      systemPrompt, message, { temperature: 0.5, maxTokens: 2048 },
    );

    // En modo demo (sin API key) no se consumió una consulta real: devolvemos el crédito.
    if (provider === "demo") {
      await supabase.rpc("decrement_usage", { p_user_id: user.id, p_kind: "consulta" });
    }

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
    // Todos los proveedores fallaron: devolvemos el crédito de consulta.
    await supabase.rpc("decrement_usage", { p_user_id: user.id, p_kind: "consulta" });
    const errMsg = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: `Error al consultar la IA: ${errMsg}` }, { status: 502 });
  }
}
