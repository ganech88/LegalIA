-- 0021: Reemplaza el índice ivfflat de legal_knowledge por HNSW.
-- APLICADA en remoto el 2026-07-04 vía MCP.
--
-- Motivo: el índice ivfflat original (migración inicial) se creó con la tabla
-- VACÍA, por lo que sus centroides no representaban los datos: las búsquedas
-- aproximadas con vectores nuevos devolvían 0 resultados (la auto-similitud
-- funcionaba de casualidad). HNSW no requiere entrenamiento previo y se
-- mantiene correcto con las re-ingestiones semanales del cron.

DROP INDEX IF EXISTS legal_knowledge_embedding_idx;
CREATE INDEX IF NOT EXISTS legal_knowledge_embedding_hnsw
  ON legal_knowledge USING hnsw (embedding vector_cosine_ops);
