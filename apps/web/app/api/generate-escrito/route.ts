import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateWithFallback, providerModelName } from "@/lib/ai/provider";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { template_id, datos_caso } = await request.json();
  if (!template_id || typeof template_id !== "string") {
    return NextResponse.json({ error: "Falta el identificador del template" }, { status: 400 });
  }
  if (!datos_caso || typeof datos_caso !== "object" || Array.isArray(datos_caso)) {
    return NextResponse.json({ error: "Datos del caso inválidos" }, { status: 400 });
  }

  const { data: template } = await supabase
    .from("escrito_templates")
    .select("*")
    .eq("id", template_id)
    .single();

  if (!template) {
    return NextResponse.json({ error: "Template no encontrado" }, { status: 404 });
  }

  // Rate limiting: máx. 10 escritos por minuto por usuario.
  const { data: rlOk } = await supabase.rpc("check_rate_limit", {
    p_user_id: user.id, p_action: "escrito", p_max: 10, p_window_seconds: 60,
  });
  if (rlOk === false) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes en poco tiempo. Esperá un momento e intentá de nuevo." },
      { status: 429 }
    );
  }

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

  let prompt = template.template_prompt as string;
  for (const [key, value] of Object.entries(datos_caso)) {
    const strValue = Array.isArray(value) ? value.join(", ") : String(value ?? "");
    prompt = prompt.replaceAll(`{${key}}`, strValue);
  }

  try {
    const { content, provider } = await generateWithFallback(
      prompt,
      "Generá el escrito completo basándote en los datos proporcionados. Seguí la estructura indicada.",
      { temperature: 0.3, maxTokens: 4096 },
    );

    // Si no se generó contenido, devolvemos el crédito de uso al usuario.
    if (!content?.trim()) {
      await supabase.rpc("decrement_usage", { p_user_id: user.id, p_kind: "escrito" });
      return NextResponse.json(
        { error: "No se pudo generar el escrito. No se descontó de tu cuota; intentá de nuevo." },
        { status: 502 }
      );
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
        contenido_generado: content,
        jurisdiccion: datos_caso.jurisdiccion || template.jurisdiccion?.[0] || "nacional",
        fuero: template.fuero,
        modelo_usado: providerModelName(provider),
      })
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json({ error: "Error al guardar el escrito" }, { status: 500 });
    }

    return NextResponse.json({ id: escrito.id });
  } catch (error: unknown) {
    // La generación falló: devolvemos el crédito de uso.
    await supabase.rpc("decrement_usage", { p_user_id: user.id, p_kind: "escrito" });
    const errMsg = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: `Error al generar el escrito: ${errMsg}` }, { status: 502 });
  }
}
