-- 0031: mejor orden en la búsqueda de texto completo de la base legal.
-- El orden anterior (solo densidad de coincidencias) traía artículos cortos
-- del Código Civil antes que el artículo laboral pertinente. Ahora combina:
--   1) cuántos términos de la consulta aparecen, pesando más los raros;
--   2) la densidad de coincidencias;
--   3) una preferencia leve por las normas que no son el Código Civil y
--      Comercial (2.667 de los 3.149 artículos son del CCCN).
CREATE OR REPLACE FUNCTION public.search_legal_knowledge_texto(p_query text, match_count int DEFAULT 5)
RETURNS TABLE (id uuid, source_type text, source_name text, article_number text, title text, content text, jurisdiction text, similarity float)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH total AS (SELECT count(*)::float AS n FROM legal_knowledge),
  lex AS (
    SELECT l.lexeme, to_tsquery('spanish', quote_literal(l.lexeme)) AS tq
    FROM unnest(to_tsvector('spanish', left(p_query, 600))) l
  ),
  df AS (
    SELECT lex.lexeme, lex.tq, (SELECT count(*) FROM legal_knowledge k WHERE k.fts @@ lex.tq) AS n
    FROM lex
  ),
  util AS (SELECT * FROM df WHERE n > 0),
  agg AS (
    SELECT sum(ln(total.n / util.n)) AS t,
           to_tsquery('spanish', string_agg(quote_literal(util.lexeme), ' | ')) AS tqall
    FROM util, total
  ),
  sc AS (
    SELECT k.id, sum(ln(total.n / util.n)) AS s
    FROM util JOIN legal_knowledge k ON k.fts @@ util.tq, total
    GROUP BY k.id
  )
  SELECT k.id, k.source_type, k.source_name, k.article_number, k.title, k.content, k.jurisdiction,
         (sc.s / NULLIF(agg.t, 0)
          + 1.5 * ts_rank_cd(k.fts, agg.tqall, 32)
          + CASE WHEN k.source_name ILIKE 'CCCN%' THEN 0 ELSE 0.2 END)::float AS similarity
  FROM sc JOIN legal_knowledge k ON k.id = sc.id, agg
  WHERE agg.t > 0
  ORDER BY similarity DESC
  LIMIT LEAST(GREATEST(match_count, 1), 20);
$$;
