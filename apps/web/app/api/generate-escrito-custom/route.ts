import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateWithFallback, providerModelName } from "@/lib/ai/provider";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { tipo_escrito, fuero, jurisdiccion, descripcion, datos_caso } =
    await request.json();

  if (!tipo_escrito || !fuero || !jurisdiccion || !descripcion || !datos_caso) {
    return NextResponse.json(
      { error: "Todos los campos son obligatorios." },
      { status: 400 }
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

  const systemPrompt =
    `Sos un experto en derecho argentino con amplia experiencia en redacción de escritos judiciales y extrajudiciales. ` +
    `El abogado necesita que generes un escrito de tipo: ${tipo_escrito}.\n\n` +
    `Jurisdicción: ${jurisdiccion}\n` +
    `Fuero: ${fuero}\n\n` +
    `Descripción de lo que necesita:\n${descripcion}\n\n` +
    `Datos del caso:\n${datos_caso}\n\n` +
    `Generá un documento legal completo, formal, con formato procesal argentino, listo para presentar ante el tribunal correspondiente. ` +
    `Incluí todos los apartados necesarios según el tipo de escrito (encabezado, objeto, hechos, derecho, prueba, petitorio, etc.). ` +
    `Citá artículos de ley vigentes que correspondan. ` +
    `Usá el estilo procesal argentino estándar.`;

  try {
    const { content, provider } = await generateWithFallback(
      systemPrompt,
      "Generá el escrito completo basándote en los datos proporcionados. Seguí la estructura adecuada para este tipo de escrito.",
      { temperature: 0.3, maxTokens: 4096 },
    );

    const titulo = `${tipo_escrito} — ${new Date().toLocaleDateString("es-AR")}`;

    const { data: escrito, error: insertError } = await supabase
      .from("escritos")
      .insert({
        user_id: user.id,
        template_id: null,
        tipo: "personalizado",
        titulo,
        datos_caso: { tipo_escrito, fuero, jurisdiccion, descripcion, datos_caso },
        contenido_generado: content || "[No se pudo generar el escrito. Intentá de nuevo.]",
        jurisdiccion,
        fuero,
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
