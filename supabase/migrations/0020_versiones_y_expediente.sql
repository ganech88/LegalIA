-- 0020: Versionado de escritos + vínculo escritos ↔ casos (expediente vivo).

-- 1) Escritos vinculados a casos (vencimientos.caso_id ya existe desde 0016).
ALTER TABLE escritos ADD COLUMN IF NOT EXISTS caso_id UUID REFERENCES casos(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_escritos_caso ON escritos (caso_id) WHERE caso_id IS NOT NULL;

-- 2) Historial de versiones del contenido editado.
CREATE TABLE IF NOT EXISTS escritos_versiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrito_id UUID NOT NULL REFERENCES escritos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  origen TEXT NOT NULL DEFAULT 'manual', -- manual | auto
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_versiones_escrito
  ON escritos_versiones (escrito_id, created_at DESC);

ALTER TABLE escritos_versiones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own versiones only" ON escritos_versiones
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Retención: se limita desde la app (se conservan las últimas 30 por escrito).
