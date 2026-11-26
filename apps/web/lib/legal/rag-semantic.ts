/**
 * RAG semántico: embedding de la consulta + búsqueda vectorial en
 * legal_knowledge (RPC search_legal_knowledge, pgvector coseno).
 *
 * Devuelve el contexto formateado + las fuentes para auditoría. Si algo
 * falla (sin API key, base vacía, error de red), devuelve null y el caller
 * usa el fallback por keywords (lib/legal/rag.ts).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { embedQuery, busquedaSemanticaActiva } from "@/lib/ai/embeddings";
import { articulosCitados, reformularConsulta } from "./busqueda-dirigida";

export interface FuenteRag {
  source_name: string;
  article_number: string | null;
  title: string | null;
  similarity: number;
}

export interface SemanticContext {
  contexto: string;
  fuentes: FuenteRag[];
  /** "semantica": embeddings + pgvector. "texto": búsqueda de texto completo de Postgres. */
  modo?: "semantica" | "texto";
  /** Por qué no se pudo usar la búsqueda semántica, si se cayó a texto. */
  aviso?: string;
}

interface FilaRag {
  source_type: string;
  source_name: string;
  article_number: string | null;
  title: string | null;
  content: string;
  similarity: number;
}

function armar(filas: FilaRag[], maxChars: number, modo: "semantica" | "texto"): SemanticContext | null {
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
    modo,
  };
}

/** Búsqueda semántica. Lanza si los embeddings o la base fallan (para poder registrar el motivo). */
async function semantica(
  admin: SupabaseClient,
  query: string,
  matchCount: number,
  threshold: number,
  maxChars: number,
): Promise<SemanticContext | null> {
  const embedding = await embedQuery(query);
  const { data, error } = await admin.rpc("search_legal_knowledge", {
    query_embedding: JSON.stringify(embedding),
    match_threshold: threshold,
    match_count: matchCount,
  });
  if (error) throw new Error(error.message);
  return armar((data ?? []) as FilaRag[], maxChars, "semantica");
}

/**
 * Búsqueda de texto completo sobre la misma base (función
 * search_legal_knowledge_texto). No depende de ningún proveedor externo: es la
 * red de seguridad cuando los embeddings no responden.
 */
export async function buildTextContext(
  admin: SupabaseClient,
  query: string,
  opts: { matchCount?: number; maxChars?: number } = {},
): Promise<SemanticContext | null> {
  const { matchCount = 5, maxChars = 4000 } = opts;
  const buscar = async (q: string): Promise<FilaRag[]> => {
    const { data, error } = await admin.rpc("search_legal_knowledge_texto", { p_query: q, match_count: matchCount });
    return error || !data ? [] : (data as FilaRag[]);
  };
  try {
    const [directos, original, reformulada] = await Promise.all([
      // Artículos que la consulta nombra: se traen tal cual, sin depender del ranking.
      Promise.all(
        articulosCitados(query).map(async (a) => {
          const { data } = await admin
            .from("legal_knowledge")
            .select("source_type, source_name, article_number, title, content")
            .eq("article_number", a.numero)
            .ilike("source_name", a.fuente)
            .limit(2);
          return ((data ?? []) as Omit<FilaRag, "similarity">[]).map((f) => ({ ...f, similarity: 1 }));
        }),
      ).then((x) => x.flat()),
      buscar(query),
      // La misma pregunta en palabras de la ley: rescata el artículo que una pregunta larga tapa.
      reformularConsulta(query).then((q) => (q ? buscar(q) : [])),
    ]);
    const filas: FilaRag[] = [];
    const vistos = new Set<string>();
    const sumar = (f?: FilaRag) => {
      if (!f) return;
      const clave = `${f.source_name}|${f.article_number}|${f.title}`;
      if (vistos.has(clave)) return;
      vistos.add(clave);
      filas.push(f);
    };
    directos.forEach(sumar);
    for (let i = 0; i < matchCount; i++) {
      sumar(reformulada[i]);
      sumar(original[i]);
    }
    return armar(filas.slice(0, matchCount + directos.length), maxChars, "texto");
  } catch {
    return null;
  }
}

/**
 * Contexto legal para una consulta: texto completo de Postgres y, solo si la
 * búsqueda semántica está activada (RAG_SEMANTICO=1), semántica primero con
 * texto completo como respaldo. Devuelve null solo
 * si ninguna de las dos encuentra nada.
 */
export async function buildSemanticContext(
  admin: SupabaseClient,
  query: string,
  opts: { matchCount?: number; threshold?: number; maxChars?: number } = {},
): Promise<SemanticContext | null> {
  const { matchCount = 6, threshold = 0.45, maxChars = 5000 } = opts;
  let aviso: string | undefined;
  if (busquedaSemanticaActiva()) {
    try {
      const r = await semantica(admin, query, matchCount, threshold, maxChars);
      if (r) return r;
    } catch (err) {
      aviso = (err instanceof Error ? err.message : String(err)).slice(0, 300);
      console.warn(`[rag] búsqueda semántica caída, se usa texto completo: ${aviso}`);
    }
  }
  const texto = await buildTextContext(admin, query, { matchCount, maxChars });
  return texto ? { ...texto, aviso } : null;
}
