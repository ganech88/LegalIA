import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { streamEscrito } from "@/lib/api/stream-escrito";
import { sanitizePromptValue, ANTI_INJECTION_GUARD } from "@/lib/ai/sanitize";
import { checkIpRateLimit, getClientIp } from "@/lib/rate-limit";
import { reservarCuota } from "@/lib/api/quota";
import { CONTEXTO_REFORMAS_2024_2026 } from "@/lib/legal/regimen";

export const maxDuration = 120;

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!checkIpRateLimit(getClientIp(request), "escrito", 15, 60)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes desde esta conexión. Esperá un momento." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const tipo_escrito = sanitizePromptValue(body.tipo_escrito).slice(0, 200);
  const fuero = sanitizePromptValue(body.fuero).slice(0, 100);
  const jurisdiccion = sanitizePromptValue(body.jurisdiccion).slice(0, 100);
  const descripcion = sanitizePromptValue(body.descripcion);
  const datos_caso = sanitizePromptValue(body.datos_caso);

  if (!tipo_escrito || !fuero || !jurisdiccion || !descripcion || !datos_caso) {
    return NextResponse.json(
      { error: "Todos los campos son obligatorios." },
      { status: 400 }
    );
  }

  const cuota = await reservarCuota(supabase, user.id, "escrito");
  if (!cuota.ok) return cuota.response;

  // Estilo de redacción personalizado del abogado (si lo configuró).
  const { data: perfil } = await supabase
    .from("profiles")
    .select("estilo_redaccion")
    .eq("id", user.id)
    .single();
  const estilo = perfil?.estilo_redaccion
    ? `\n\nEstilo de redacción del letrado (respetalo en la medida en que no contradiga el formato procesal): ${sanitizePromptValue(perfil.estilo_redaccion).slice(0, 1500)}`
    : "";

  const systemPrompt =
    `Sos un experto en derecho argentino con amplia experiencia en redacción de escritos judiciales y extrajudiciales. ` +
    `El abogado necesita que generes un escrito de tipo: ${tipo_escrito}.\n\n` +
    `Jurisdicción: ${jurisdiccion}\n` +
    `Fuero: ${fuero}\n\n` +
    `Descripción de lo que necesita:\n${descripcion}\n\n` +
    `Datos del caso:\n${datos_caso}\n\n` +
    `Generá un documento legal completo, formal, con formato procesal argentino, listo para presentar ante el tribunal correspondiente. ` +
    `Incluí todos los apartados necesarios según el tipo de escrito (encabezado, objeto, hechos, derecho, prueba, petitorio, etc.). ` +
    `Citá artículos de ley vigentes que correspondan; citá únicamente normas de cuya existencia y contenido estés seguro. ` +
    `Usá el estilo procesal argentino estándar. No cites fallos con Sala, fecha o número de sentencia de los que no estés seguro.\n\n` +
    CONTEXTO_REFORMAS_2024_2026 +
    estilo +
    ANTI_INJECTION_GUARD;

  const titulo = `${tipo_escrito} — ${new Date().toLocaleDateString("es-AR").replace(/\//g, "-")}`;

  return streamEscrito({
    systemPrompt,
    userMessage: "Generá el escrito completo basándote en los datos proporcionados. Seguí la estructura adecuada para este tipo de escrito.",
    temperature: 0.3,
    maxTokens: 4096,
    refund: cuota.refund,
    onComplete: async (content, _provider, modelo) => {
      const { data: escrito, error: insertError } = await supabase
        .from("escritos")
        .insert({
          user_id: user.id,
          template_id: null,
          tipo: "personalizado",
          titulo,
          datos_caso: { tipo_escrito, fuero, jurisdiccion, descripcion, datos_caso },
          contenido_generado: content,
          jurisdiccion,
          fuero,
          modelo_usado: modelo,
        })
        .select("id")
        .single();
      if (insertError || !escrito) throw new Error("No pudimos guardar el escrito");
      return escrito.id as string;
    },
  });
}
