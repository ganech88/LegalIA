import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NORMAS_INFOLEG, prepararNorma } from "@/lib/legal/infoleg";
import { ingestChunks } from "@/lib/legal/ingest";
import { busquedaSemanticaActiva } from "@/lib/ai/embeddings";

/**
 * Carga de una norma completa desde InfoLeg a la base legal (solo administradores).
 * POST { clave, infoleg_id?, probar? }. Con probar=true descarga y parsea sin tocar la base.
 */
export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();
  if (!user || !admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { data: yo } = await admin.from("profiles").select("es_admin").eq("id", user.id).maybeSingle();
  if (!(yo as { es_admin?: boolean } | null)?.es_admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const norma = NORMAS_INFOLEG.find((n) => n.clave === body?.clave);
  if (!norma) {
    return NextResponse.json({ error: "Norma desconocida", claves: NORMAS_INFOLEG.map((n) => n.clave) }, { status: 400 });
  }
  const infolegId = Number.isInteger(body?.infoleg_id) && body.infoleg_id > 0 ? (body.infoleg_id as number) : undefined;

  try {
    const { chunks, ...resumen } = await prepararNorma(norma, infolegId);
    if (body?.probar || !resumen.valido) {
      return NextResponse.json({ ...resumen, cargado: 0 }, { status: resumen.valido ? 200 : 422 });
    }
    const cargado = await ingestChunks(admin, chunks, { sinEmbeddings: !busquedaSemanticaActiva() });
    return NextResponse.json({ ...resumen, cargado, fuente: norma.source_name });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error al cargar la norma" }, { status: 502 });
  }
}
