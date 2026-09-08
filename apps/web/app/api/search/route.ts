import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { buscarEnCorpus } from "@/lib/legal/corpus";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const query = typeof body?.query === "string" ? body.query : "";
  if (!query.trim()) {
    return NextResponse.json({ results: { leyes: [], fallos: [], casos: [], escritos: [] } });
  }

  const q = query.trim().slice(0, 100);
  // Escapamos la gramática del filtro de PostgREST y los comodines de ILIKE.
  const qLike = q.replace(/[%_\\]/g, (m: string) => `\\${m}`).replace(/[,()."]/g, " ");

  const corpusResults = buscarEnCorpus(q);

  const { data: casos } = await supabase
    .from("casos")
    .select("id, caratula, expediente, fuero, estado")
    .or(`caratula.ilike.%${qLike}%,expediente.ilike.%${qLike}%`)
    .limit(5);

  const { data: escritos } = await supabase
    .from("escritos")
    .select("id, titulo, tipo, created_at")
    .ilike("titulo", `%${qLike}%`)
    .limit(5);

  return NextResponse.json({
    results: {
      leyes: corpusResults.leyes.map(l => ({
        nombre_corto: l.nombre_corto,
        numero: l.numero,
        matches: l.matches.map(m => ({ numero: m.numero, titulo: m.titulo })),
      })),
      fallos: corpusResults.fallos.map(f => ({
        id: f.id,
        caratula: f.caratula,
        tribunal: f.tribunal,
        tema: f.tema,
      })),
      casos: casos ?? [],
      escritos: escritos ?? [],
    },
  });
}
