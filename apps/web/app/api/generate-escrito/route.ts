import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateWithFallback, providerModelName } from "@/lib/ai/provider";
import { sanitizePromptValue, ANTI_INJECTION_GUARD } from "@/lib/ai/sanitize";
import { checkIpRateLimit, getClientIp } from "@/lib/rate-limit";
import { reservarCuota } from "@/lib/api/quota";
import { tituloDesdeDatos } from "@/lib/api/titulo";
import { CONTEXTO_REFORMAS_2024_2026 } from "@/lib/legal/regimen";

// La generación con Sonnet y 4.096 tokens de salida tarda 40-90 s: sin esto,
// Vercel corta la función antes del catch y el crédito se pierde.
export const maxDuration = 120;

const MAX_DATOS_JSON = 40_000; // caracteres serializados
const MAX_CAMPOS = 60;

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

  const body = await request.json().catch(() => null);
  const template_id = body?.template_id;
  const datos_caso = body?.datos_caso;
  const caso_id = typeof body?.caso_id === "string" && /^[0-9a-f-]{36}$/i.test(body.caso_id) ? body.caso_id : null;
  if (!template_id || typeof template_id !== "string") {
    return NextResponse.json({ error: "Falta el identificador del template" }, { status: 400 });
  }
  if (!datos_caso || typeof datos_caso !== "object" || Array.isArray(datos_caso)) {
    return NextResponse.json({ error: "Datos del caso inválidos" }, { status: 400 });
  }
  if (Object.keys(datos_caso).length > MAX_CAMPOS || JSON.stringify(datos_caso).length > MAX_DATOS_JSON) {
    return NextResponse.json({ error: "Los datos del caso son demasiado extensos." }, { status: 413 });
  }

  const { data: template } = await supabase
    .from("escrito_templates")
    .select("*")
    .eq("id", template_id)
    .single();

  if (!template) {
    return NextResponse.json({ error: "Template no encontrado" }, { status: 404 });
  }

  const cuota = await reservarCuota(supabase, user.id, "escrito");
  if (!cuota.ok) return cuota.response;

  // Interpolación con datos SANITIZADOS (defensa contra prompt injection).
  let prompt = template.template_prompt as string;
  const datosSanitizados: Record<string, string> = {};
  for (const [key, value] of Object.entries(datos_caso)) {
    if (key === "anexo_liquidacion") continue; // se inyecta aparte, sin recorte
    const strValue = sanitizePromptValue(value);
    datosSanitizados[key] = strValue;
    prompt = prompt.replaceAll(`{${key}}`, strValue);
  }

  // Anexo de liquidación auditable (viene de la calculadora): el modelo lo
  // transcribe, no lo recalcula. Es la diferencia entre un número defendible y
  // uno improvisado por el LLM.
  const anexo = typeof datos_caso.anexo_liquidacion === "string" ? datos_caso.anexo_liquidacion.slice(0, 8000) : "";
  const bloqueAnexo = anexo
    ? `\n\nANEXO DE LIQUIDACIÓN CALCULADO POR LA HERRAMIENTA (fuente de verdad para los montos): transcribilo como anexo al final del escrito y usá sus importes en la liquidación del reclamo. NO recalcules ni modifiques los importes.\n<anexo_liquidacion>\n${anexo.replace(/<\/?anexo_liquidacion>/g, "")}\n</anexo_liquidacion>`
    : "";

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
      prompt + "\n\n" + CONTEXTO_REFORMAS_2024_2026 + bloqueAnexo + estilo + ANTI_INJECTION_GUARD,
      "Generá el escrito completo basándote en los datos proporcionados. Seguí la estructura indicada. Citá únicamente artículos de leyes argentinas de cuya existencia y contenido estés seguro; si no estás seguro de una cita, omitila o indicá que debe verificarse. No cites fallos con Sala, fecha o número de sentencia que no estén en el contexto provisto.",
      { temperature: 0.3, maxTokens: 4096 },
    );

    // Si no se generó contenido, devolvemos el crédito de uso al usuario.
    if (!content?.trim()) {
      await cuota.refund();
      return NextResponse.json(
        { error: "No se pudo generar el escrito. No se descontó de tu cuota; intentá de nuevo." },
        { status: 502 }
      );
    }

    const titulo = tituloDesdeDatos(template.nombre_display as string, datosSanitizados);

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
        ...(caso_id ? { caso_id } : {}),
      })
      .select("id")
      .single();

    if (insertError) {
      // El escrito existe pero no se pudo guardar: devolvemos crédito y contenido.
      await cuota.refund();
      return NextResponse.json(
        { error: "Se generó el escrito pero no pudimos guardarlo. Copialo desde acá; no se descontó de tu cuota.", contenido: content },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: escrito.id });
  } catch (error: unknown) {
    // La generación falló: devolvemos el crédito de uso.
    await cuota.refund();
    const errMsg = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: `Error al generar el escrito: ${errMsg}` }, { status: 502 });
  }
}
