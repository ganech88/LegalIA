-- Búsqueda semántica con bge-m3 (Cloudflare Workers AI, multilingüe, 1024 dimensiones).
-- Columna nueva: la anterior (embedding, 1536, Gemini) queda intacta.
ALTER TABLE legal_knowledge ADD COLUMN IF NOT EXISTS embedding_m3 vector(1024);

CREATE INDEX IF NOT EXISTS legal_knowledge_embedding_m3_idx
  ON legal_knowledge USING hnsw (embedding_m3 vector_cosine_ops);

CREATE OR REPLACE FUNCTION search_legal_knowledge_m3(
  query_embedding vector(1024),
  match_threshold float DEFAULT 0.35,
  match_count int DEFAULT 8
)
RETURNS TABLE (id uuid, source_type text, source_name text, article_number text, title text, content text, jurisdiction text, similarity float)
LANGUAGE sql STABLE
SET search_path = public, extensions
AS $$
  SELECT k.id, k.source_type, k.source_name, k.article_number, k.title, k.content, k.jurisdiction,
         (1 - (k.embedding_m3 <=> query_embedding))::float AS similarity
  FROM legal_knowledge k
  WHERE k.embedding_m3 IS NOT NULL
    AND 1 - (k.embedding_m3 <=> query_embedding) > match_threshold
  ORDER BY k.embedding_m3 <=> query_embedding
  LIMIT LEAST(GREATEST(match_count, 1), 20);
$$;

REVOKE ALL ON FUNCTION search_legal_knowledge_m3(vector, float, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION search_legal_knowledge_m3(vector, float, int) TO service_role;
