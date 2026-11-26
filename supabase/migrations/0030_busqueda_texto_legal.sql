-- 0030: búsqueda de texto completo sobre la base legal.
-- Red de seguridad de la búsqueda semántica: si los embeddings no responden
-- (clave, cuota o crédito del proveedor), el asistente igual recibe los
-- artículos pertinentes en vez de responder sin base.

ALTER TABLE legal_knowledge ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (to_tsvector('spanish', coalesce(title, '') || ' ' || content)) STORED;
CREATE INDEX IF NOT EXISTS idx_legal_knowledge_fts ON legal_knowledge USING gin (fts);

CREATE OR REPLACE FUNCTION public.search_legal_knowledge_texto(p_query text, match_count int DEFAULT 5)
RETURNS TABLE (id uuid, source_type text, source_name text, article_number text, title text, content text, jurisdiction text, similarity float)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH q AS (
    SELECT to_tsquery('spanish', array_to_string(ARRAY(
      SELECT lexeme FROM unnest(to_tsvector('spanish', left(p_query, 600)))
    ), ' | ')) AS tq
  )
  SELECT lk.id, lk.source_type, lk.source_name, lk.article_number, lk.title, lk.content, lk.jurisdiction,
         ts_rank_cd(lk.fts, q.tq, 32)::float AS similarity
  FROM legal_knowledge lk, q
  WHERE q.tq IS NOT NULL AND lk.fts @@ q.tq
  ORDER BY ts_rank_cd(lk.fts, q.tq, 32) DESC
  LIMIT LEAST(GREATEST(match_count, 1), 20);
$$;
