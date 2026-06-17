import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/ai/provider";

const PROMPTS: Record<string, string> = {
  redaccion:
    "Mejorá la CLARIDAD, el estilo procesal argentino y la ortografía del escrito, sin alterar el fondo ni los datos. Devolvé observaciones breves y luego la versión corregida completa.",
  errores:
    "Revisá el escrito y detectá posibles ERRORES: citas legales incorrectas o dudosas, inconsistencias, contradicciones, rubros u omisiones procesales. Listá cada observación con su ubicación. NO reescribas; señalá qué verificar. Nunca inventes jurisprudencia.",
  argumentacion:
    "Reforzá la FUNDAMENTACIÓN jurídica: sugerí artículos aplicables y líneas argumentales más sólidas. Si mencionás jurisprudencia, aclará que el abogado debe verificar la cita; nunca inventes fallos. Devolvé sugerencias y, si corresponde, párrafos mejorados.",
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { texto, modo } = await request.json();
  if (typeof texto !== "string" || texto.trim().length < 30) {
    return NextResponse.json({ error: "Pegá un escrito de al menos 30 caracteres." }, { status: 400 });
  }
  if (texto.length > 20000) {
    return NextResponse.json({ error: "El texto es demasiado largo (máx. 20.000 caracteres)." }, { status: 400 });
  }
  const instruccion = PROMPTS[modo as string] ?? PROMPTS.redaccion;

  // Rate limit + cuota (cuenta como consulta).
  const { data: rlOk } = await supabase.rpc("check_rate_limit", {
    p_user_id: user.id, p_action: "consulta", p_max: 20, p_window_seconds: 60,
  });
  if (rlOk === false) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Esperá un momento." }, { status: 429 });
  }
  const { data: canUse } = await supabase.rpc("check_and_increment_usage", {
    p_user_id: user.id, p_kind: "consulta",
  });
  if (!canUse) {
    return NextResponse.json({ error: "Alcanzaste el límite de tu plan. Actualizá para continuar." }, { status: 429 });
  }

  const systemPrompt =
    `Sos un abogado argentino senior que revisa escritos judiciales de colegas. ${instruccion}\n\n` +
    `Reglas: usá lenguaje técnico-jurídico argentino; nunca inventes jurisprudencia ni artículos; ` +
    `aclará siempre lo que el abogado debe verificar antes de presentar. Estructurá la respuesta con ` +
    `"OBSERVACIONES" y, si corresponde, "VERSIÓN SUGERIDA".`;

  try {
    const { content } = await generateWithFallback(systemPrompt, texto, { temperature: 0.3, maxTokens: 4096 });
    if (!content?.trim()) {
      await supabase.rpc("decrement_usage", { p_user_id: user.id, p_kind: "consulta" });
      return NextResponse.json({ error: "No se pudo generar la revisión. Intentá de nuevo." }, { status: 502 });
    }
    return NextResponse.json({ revision: content });
  } catch (error: unknown) {
    await supabase.rpc("decrement_usage", { p_user_id: user.id, p_kind: "consulta" });
    const msg = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: `Error al revisar: ${msg}` }, { status: 502 });
  }
}
