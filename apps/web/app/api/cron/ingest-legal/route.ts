import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { embeddingsDisponibles } from "@/lib/ai/embeddings";
import { chunksFromCorpus, chunksFromInfolegLCT, ingestChunks } from "@/lib/legal/ingest";

/**
 * Ingestión de la base RAG (legal_knowledge, pgvector).
 *
 * - GET: lo ejecuta Vercel Cron semanalmente (Authorization: Bearer CRON_SECRET,
 *   que Vercel agrega automáticamente si la env var CRON_SECRET está definida).
 * - Manual: curl -X GET -H "Authorization: Bearer $CRON_SECRET" .../api/cron/ingest-legal
 *
 * Reingesta el corpus curado + la LCT completa desde InfoLeg. Es idempotente.
 */

export const maxDuration = 60;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!embeddingsDisponibles()) {
    return NextResponse.json(
      { error: "GOOGLE_AI_API_KEY no configurada: no se pueden generar embeddings." },
      { status: 500 },
    );
  }
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY no configurada." }, { status: 500 });
  }

  const resultado: Record<string, unknown> = {};

  // 1) Corpus curado (garantizado).
  try {
    const corpus = chunksFromCorpus();
    resultado.corpus_ingestado = await ingestChunks(admin, corpus);
  } catch (e) {
    resultado.corpus_error = e instanceof Error ? e.message : String(e);
  }

  // 2) LCT completa desde InfoLeg (best-effort: si falla, el corpus ya quedó).
  try {
    const { chunks, parseInfo } = await chunksFromInfolegLCT();
    resultado.lct_info = parseInfo;
    // Los artículos de InfoLeg reemplazan a los curados de la LCT solo si el
    // parseo trajo un volumen razonable (evita degradar la base con un parseo roto).
    if (chunks.length >= 150) {
      resultado.lct_ingestado = await ingestChunks(admin, chunks);
    } else {
      resultado.lct_omitido = `Solo ${chunks.length} artículos parseados (<150): se conserva el corpus curado como fuente de la LCT.`;
    }
  } catch (e) {
    resultado.lct_error = e instanceof Error ? e.message : String(e);
  }

  const { count } = await admin
    .from("legal_knowledge")
    .select("id", { count: "exact", head: true });
  resultado.total_filas_legal_knowledge = count;

  return NextResponse.json(resultado);
}
