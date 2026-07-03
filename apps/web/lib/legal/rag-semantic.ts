/**
 * RAG semántico: embedding de la consulta + búsqueda vectorial en
 * legal_knowledge (RPC search_legal_knowledge, pgvector coseno).
 *
 * Devuelve el contexto formateado + las fuentes para auditoría. Si algo
 * falla (sin API key, base vacía, error de red), devuelve null y el caller
 * usa el fallback por keywords (lib/legal/rag.ts).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { embedQuery, embeddingsDisponibles } from "@/lib/ai/embeddings";

export interface FuenteRag {
  source_name: string;
  article_number: string | null;
  title: string | null;
  similarity: number;
}

export interface SemanticContext {
  contexto: string;
  fuentes: FuenteRag[];
}

interface FilaRag {
  source_type: string;
  source_name: string;
  article_number: string | null;
  title: string | null;
  content: string;
  similarity: number;
}

export async function buildSemanticContext(
  admin: SupabaseClient,
  query: string,
  opts: { matchCount?: number; threshold?: number; maxChars?: number } = {},
): Promise<SemanticContext | null> {
  const { matchCount = 6, threshold = 0.45, maxChars = 5000 } = opts;
  if (!embeddingsDisponibles()) return null;

  try {
    const embedding = await embedQuery(query);
    const { data, error } = await admin.rpc("search_legal_knowledge", {
      query_embedding: JSON.stringify(embedding),
      match_threshold: threshold,
      match_count: matchCount,
    });
    if (error || !data || (data as FilaRag[]).length === 0) return null;

    const filas = data as FilaRag[];
    const chunks: string[] = [];
    let total = 0;
    for (const f of filas) {
      const encabezado = f.article_number
        ? `[${f.source_name} — Art. ${f.article_number}${f.title ? `: ${f.title}` : ""}]`
        : `[${f.source_name}${f.title ? ` — ${f.title}` : ""}]`;
      const chunk = `${encabezado}\n${f.content}`;
      if (total + chunk.length > maxChars) break;
      chunks.push(chunk);
      total += chunk.length;
    }
    if (chunks.length === 0) return null;

    return {
      contexto: chunks.join("\n\n---\n\n"),
      fuentes: filas.slice(0, chunks.length).map((f) => ({
        source_name: f.source_name,
        article_number: f.article_number,
        title: f.title,
        similarity: Math.round(f.similarity * 1000) / 1000,
      })),
    };
  } catch {
    return null;
  }
}
