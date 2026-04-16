CREATE TABLE casos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  caratula TEXT NOT NULL,
  expediente TEXT,
  fuero TEXT NOT NULL,
  jurisdiccion TEXT NOT NULL,
  juzgado TEXT,
  estado TEXT NOT NULL DEFAULT 'activo',
  cliente_nombre TEXT,
  contraparte_nombre TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER casos_updated_at
  BEFORE UPDATE ON casos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
