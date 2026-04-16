import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { template_id, datos_caso } = await request.json();
  if (!template_id || !datos_caso) {
    return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
  }

  const { data: template } = await supabase
    .from("escrito_templates")
    .select("*")
    .eq("id", template_id)
    .single();

  if (!template) {
    return NextResponse.json({ error: "Template no encontrado" }, { status: 404 });
  }

  // Check usage limits via DB function
  const { data: canUse } = await supabase.rpc("check_and_increment_usage", {
    p_user_id: user.id,
    p_kind: "escrito",
  });

  if (!canUse) {
    return NextResponse.json(
      { error: "Alcanzaste el límite de escritos de tu plan. Actualizá para continuar." },
      { status: 429 }
    );
  }

  let contenido = "";

  if (!process.env.ANTHROPIC_API_KEY) {
    contenido = `[MODO DEMO — Sin API key de Anthropic configurada]\n\n` +
      `Escrito: ${template.nombre_display}\n` +
      `Datos del caso:\n${JSON.stringify(datos_caso, null, 2)}\n\n` +
      `Para generar escritos reales, configurá ANTHROPIC_API_KEY en .env.local`;
  } else {
    try {
      const { getAnthropicClient } = await import("@/lib/ai/anthropic");
      const anthropic = getAnthropicClient();

      let prompt = template.template_prompt as string;
      for (const [key, value] of Object.entries(datos_caso)) {
        const strValue = Array.isArray(value) ? value.join(", ") : String(value ?? "");
        prompt = prompt.replaceAll(`{${key}}`, strValue);
      }

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        temperature: 0.3,
        system: [
          {
            type: "text",
            text: prompt,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
          {
            role: "user",
            content: `Generá el escrito completo basándote en los datos proporcionados. Seguí la estructura indicada.`,
          },
        ],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      contenido = textBlock?.text ?? "";
    } catch (aiError: unknown) {
      const errMsg = aiError instanceof Error ? aiError.message : "Error desconocido";
      const isCredits = errMsg.includes("credit balance");
      return NextResponse.json(
        {
          error: isCredits
            ? "Sin créditos en Anthropic. Cargá saldo en console.anthropic.com/settings/billing"
            : `Error al generar el escrito: ${errMsg}`,
        },
        { status: 502 }
      );
    }
  }

  const titulo = `${template.nombre_display} — ${new Date().toLocaleDateString("es-AR")}`;

  const { data: escrito, error: insertError } = await supabase
    .from("escritos")
    .insert({
      user_id: user.id,
      template_id,
      tipo: template.tipo,
      titulo,
      datos_caso,
      contenido_generado: contenido,
      jurisdiccion: datos_caso.jurisdiccion || template.jurisdiccion?.[0] || "nacional",
      fuero: template.fuero,
      modelo_usado: process.env.ANTHROPIC_API_KEY ? "sonnet-4.6" : "demo",
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: "Error al guardar el escrito" }, { status: 500 });
  }

  return NextResponse.json({ id: escrito.id });
}
