CREATE TABLE escrito_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  subtipo TEXT,
  nombre_display TEXT NOT NULL,
  fuero TEXT NOT NULL,
  jurisdiccion TEXT[] DEFAULT '{}',
  campos_requeridos JSONB NOT NULL DEFAULT '{}',
  template_prompt TEXT NOT NULL DEFAULT '',
  template_estructura TEXT NOT NULL DEFAULT '',
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
