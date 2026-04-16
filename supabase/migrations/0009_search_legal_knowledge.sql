CREATE OR REPLACE FUNCTION search_legal_knowledge(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_area TEXT DEFAULT NULL,
  filter_jurisdiccion TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  source_type TEXT,
  source_name TEXT,
  article_number TEXT,
  title TEXT,
  content TEXT,
  jurisdiction TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    lk.id,
    lk.source_type,
    lk.source_name,
    lk.article_number,
    lk.title,
    lk.content,
    lk.jurisdiction,
    1 - (lk.embedding <=> query_embedding) AS similarity
  FROM legal_knowledge lk
  WHERE 1 - (lk.embedding <=> query_embedding) > match_threshold
    AND (filter_area IS NULL OR filter_area = ANY(lk.area_derecho))
    AND (filter_jurisdiccion IS NULL OR lk.jurisdiction = filter_jurisdiccion OR lk.jurisdiction = 'nacional')
  ORDER BY lk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
