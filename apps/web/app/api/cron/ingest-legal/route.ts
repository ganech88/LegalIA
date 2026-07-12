import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { embeddingsDisponibles } from "@/lib/ai/embeddings";
import { chunksFromCorpus, chunksFromInfolegLCT, chunksFromInfolegCCCN, chunksFromInfolegLey18345, CCCN_TOTAL_ARTICULOS, ingestChunks } from "@/lib/legal/ingest";

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

  // Modo tramo CCCN: ?fuente=cccn&desde=1&hasta=700 (el código completo tiene
  // 2.671 artículos y no entra en una invocación de 60s: se ingesta en tramos
  // idempotentes, borrando/insertando solo los artículos del tramo).
  const { searchParams } = new URL(request.url);
  if (searchParams.get("fuente") === "cccn") {
    const desde = Math.max(1, parseInt(searchParams.get("desde") ?? "1", 10) || 1);
    const hasta = Math.min(CCCN_TOTAL_ARTICULOS, parseInt(searchParams.get("hasta") ?? "700", 10) || 700);
    try {
      const { chunks, parseInfo } = await chunksFromInfolegCCCN(desde, hasta);
      resultado.cccn_info = parseInfo;
      if (chunks.length === 0) {
        resultado.cccn_omitido = "El parseo no devolvió artículos en el tramo: revisar formato de InfoLeg.";
      } else {
        resultado.cccn_ingestado = await ingestChunks(admin, chunks, { deleteBy: "article" });
      }
    } catch (e) {
      resultado.cccn_error = e instanceof Error ? e.message : String(e);
    }
    const { count } = await admin
      .from("legal_knowledge")
      .select("id", { count: "exact", head: true });
    resultado.total_filas_legal_knowledge = count;
    return NextResponse.json(resultado);
  }

  // Modo ley 18.345: ?fuente=ley18345 (171 arts, una sola invocación).
  if (searchParams.get("fuente") === "ley18345") {
    try {
      const { chunks, parseInfo } = await chunksFromInfolegLey18345();
      resultado.ley18345_info = parseInfo;
      if (chunks.length >= 100) {
        resultado.ley18345_ingestado = await ingestChunks(admin, chunks);
      } else {
        resultado.ley18345_omitido = `Solo ${chunks.length} artículos parseados (<100): no se ingesta.`;
      }
    } catch (e) {
      resultado.ley18345_error = e instanceof Error ? e.message : String(e);
    }
    const { count } = await admin.from("legal_knowledge").select("id", { count: "exact", head: true });
    resultado.total_filas_legal_knowledge = count;
    return NextResponse.json(resultado);
  }

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
