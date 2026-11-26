import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { embedDocuments, embeddingsDisponibles } from "@/lib/ai/embeddings";

/**
 * Genera los vectores de búsqueda semántica que falten en la base legal (solo administradores).
 * POST { cantidad? } procesa una tanda y devuelve cuántos quedan: se llama en bucle hasta 0.
 */
export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();
  if (!user || !admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { data: yo } = await admin.from("profiles").select("es_admin").eq("id", user.id).maybeSingle();
  if (!(yo as { es_admin?: boolean } | null)?.es_admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  if (!embeddingsDisponibles()) {
    return NextResponse.json({ error: "Faltan CLOUDFLARE_ACCOUNT_ID o CLOUDFLARE_AI_TOKEN en el servidor." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const cantidad = Math.min(Math.max(Number(body?.cantidad) || 96, 1), 192);

  try {
    const { data: filas, error } = await admin
      .from("legal_knowledge")
      .select("id, content")
      .is("embedding_m3", null)
      .limit(cantidad);
    if (error) throw new Error(error.message);
    const lote = (filas ?? []) as { id: string; content: string }[];
    if (lote.length > 0) {
      const vectores = await embedDocuments(lote.map((f) => f.content));
      for (let i = 0; i < lote.length; i += 16) {
        const res = await Promise.all(
          lote.slice(i, i + 16).map((f, j) =>
            admin.from("legal_knowledge").update({ embedding_m3: JSON.stringify(vectores[i + j]) }).eq("id", f.id),
          ),
        );
        const fallo = res.find((r) => r.error);
        if (fallo?.error) throw new Error(fallo.error.message);
      }
    }
    const { count } = await admin.from("legal_knowledge").select("id", { count: "exact", head: true }).is("embedding_m3", null);
    return NextResponse.json({ indexados: lote.length, pendientes: count ?? 0 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error al indexar" }, { status: 502 });
  }
}
