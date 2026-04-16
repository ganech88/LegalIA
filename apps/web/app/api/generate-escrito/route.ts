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

    const titulo = `${template.nombre_display} — ${new Date().toLocaleDateString("es-AR")}`;

    const { data: escrito, error: insertError } = await supabase
      .from("escritos")
      .insert({
        user_id: user.id,
        template_id,
        tipo: template.tipo,
        titulo,
        datos_caso,
        contenido_generado: content || "[No se pudo generar el escrito. Intentá de nuevo.]",
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
    const errMsg = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: `Error al generar el escrito: ${errMsg}` }, { status: 502 });
  }
}
