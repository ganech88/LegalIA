import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { generateWithFallback, providerModelName } from "@/lib/ai/provider";
import { sanitizePromptValue, ANTI_INJECTION_GUARD } from "@/lib/ai/sanitize";
import { checkIpRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Rate limit por IP (además del límite por usuario): corta abuso desde una misma IP.
  if (!checkIpRateLimit(getClientIp(request), "escrito", 15, 60)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes desde esta conexión. Esperá un momento." },
      { status: 429 }
    );
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

  // Las funciones de cuota se invocan con service role si está disponible
  // (evita que el cliente las llame por su cuenta vía RPC).
  const admin = createAdminClient();
  const usageClient = admin ?? supabase;

  const { data: canUse } = await usageClient.rpc("check_and_increment_usage", {
    p_user_id: user.id,
    p_kind: "escrito",
  });

  if (!canUse) {
    return NextResponse.json(
      { error: "Alcanzaste el límite de escritos de tu plan. Actualizá para continuar." },
      { status: 429 }
    );
  }

  // Interpolación con datos SANITIZADOS (defensa contra prompt injection).
  let prompt = template.template_prompt as string;
  const datosSanitizados: Record<string, string> = {};
  for (const [key, value] of Object.entries(datos_caso)) {
    const strValue = sanitizePromptValue(value);
    datosSanitizados[key] = strValue;
    prompt = prompt.replaceAll(`{${key}}`, strValue);
  }

  // Estilo de redacción personalizado del abogado (si lo configuró).
  const { data: perfil } = await supabase
    .from("profiles")
    .select("estilo_redaccion")
    .eq("id", user.id)
    .single();
  const estilo = perfil?.estilo_redaccion
    ? `\n\nEstilo de redacción del letrado (respetalo en la medida en que no contradiga el formato procesal): ${sanitizePromptValue(perfil.estilo_redaccion).slice(0, 1500)}`
    : "";

  try {
    const { content, provider } = await generateWithFallback(
      prompt + estilo + ANTI_INJECTION_GUARD,
      "Generá el escrito completo basándote en los datos proporcionados. Seguí la estructura indicada. Citá únicamente artículos de leyes argentinas de cuya existencia y contenido estés seguro; si no estás seguro de una cita, omitila o indicá que debe verificarse.",
      { temperature: 0.3, maxTokens: 4096 },
    );

    // Si no se generó contenido, devolvemos el crédito de uso al usuario.
    if (!content?.trim()) {
      await usageClient.rpc("decrement_usage", { p_user_id: user.id, p_kind: "escrito" });
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
        jurisdiccion: datosSanitizados.jurisdiccion || template.jurisdiccion?.[0] || "nacional",
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
    await usageClient.rpc("decrement_usage", { p_user_id: user.id, p_kind: "escrito" });
    const errMsg = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: `Error al generar el escrito: ${errMsg}` }, { status: 502 });
  }
}
