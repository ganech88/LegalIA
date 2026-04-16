CREATE TABLE legal_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,
  source_name TEXT NOT NULL,
  article_number TEXT,
  title TEXT,
  content TEXT NOT NULL,
  jurisdiction TEXT,
  area_derecho TEXT[] DEFAULT '{}',
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON legal_knowledge USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
