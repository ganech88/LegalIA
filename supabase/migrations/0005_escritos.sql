CREATE TABLE escritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES escrito_templates(id),
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  datos_caso JSONB NOT NULL DEFAULT '{}',
  contenido_generado TEXT NOT NULL DEFAULT '',
  contenido_editado TEXT,
  jurisdiccion TEXT NOT NULL,
  fuero TEXT NOT NULL,
  tokens_input INT,
  tokens_output INT,
  modelo_usado TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER escritos_updated_at
  BEFORE UPDATE ON escritos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
