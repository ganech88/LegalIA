-- 0027: Detalle de caso — notas cronológicas y documentos adjuntos.

CREATE TABLE IF NOT EXISTS caso_notas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id UUID NOT NULL REFERENCES casos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL CHECK (char_length(contenido) BETWEEN 1 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_caso_notas_caso ON caso_notas (caso_id, created_at DESC);
ALTER TABLE caso_notas ENABLE ROW LEVEL SECURITY;

-- Puede ver/escribir notas quien puede ver el caso (dueño o miembro del estudio).
CREATE POLICY "notas read" ON caso_notas FOR SELECT
  USING (EXISTS (SELECT 1 FROM casos c WHERE c.id = caso_id));
CREATE POLICY "notas insert" ON caso_notas FOR INSERT
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM casos c WHERE c.id = caso_id));
CREATE POLICY "notas delete own" ON caso_notas FOR DELETE
  USING (user_id = auth.uid());

-- Documentos del caso (metadatos; el archivo vive en Storage, bucket privado "casos").
CREATE TABLE IF NOT EXISTS caso_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id UUID NOT NULL REFERENCES casos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL CHECK (char_length(nombre) BETWEEN 1 AND 200),
  storage_path TEXT NOT NULL UNIQUE,
  mime TEXT,
  bytes INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_caso_documentos_caso ON caso_documentos (caso_id, created_at DESC);
ALTER TABLE caso_documentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "docs read" ON caso_documentos FOR SELECT
  USING (EXISTS (SELECT 1 FROM casos c WHERE c.id = caso_id));
CREATE POLICY "docs insert" ON caso_documentos FOR INSERT
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM casos c WHERE c.id = caso_id));
CREATE POLICY "docs delete own" ON caso_documentos FOR DELETE
  USING (user_id = auth.uid());

-- Bucket privado. Ruta: <user_id>/<caso_id>/<uuid>-<nombre>
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('casos', 'casos', false, 10485760,
        ARRAY['application/pdf','image/jpeg','image/png','image/webp',
              'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "casos storage read" ON storage.objects;
DROP POLICY IF EXISTS "casos storage insert" ON storage.objects;
DROP POLICY IF EXISTS "casos storage delete" ON storage.objects;
CREATE POLICY "casos storage read" ON storage.objects FOR SELECT
  USING (bucket_id = 'casos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "casos storage insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'casos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "casos storage delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'casos' AND (storage.foldername(name))[1] = auth.uid()::text);
