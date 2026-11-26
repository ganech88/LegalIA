-- 0028: Ficha del letrado para el asistente + medición de uso de IA por usuario.

-- Notas de trabajo del letrado (texto corto, con tope) que acompañan cada consulta.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS perfil_ia TEXT
  CHECK (perfil_ia IS NULL OR char_length(perfil_ia) <= 700);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS perfil_ia_actualizado TIMESTAMPTZ;

-- El usuario puede ver y editar su ficha (los grants de profiles son por columna desde la 0025).
GRANT UPDATE (perfil_ia) ON profiles TO authenticated;

-- Uso por consulta: tokens estimados, caso asociado y proveedores que fallaron antes de responder.
ALTER TABLE consultas_ia ADD COLUMN IF NOT EXISTS tokens_input INT;
ALTER TABLE consultas_ia ADD COLUMN IF NOT EXISTS tokens_output INT;
ALTER TABLE consultas_ia ADD COLUMN IF NOT EXISTS caso_id UUID REFERENCES casos(id) ON DELETE SET NULL;
ALTER TABLE consultas_ia ADD COLUMN IF NOT EXISTS proveedores_fallidos JSONB;

-- Tope diario por usuario: se suma el uso del día.
CREATE INDEX IF NOT EXISTS idx_consultas_ia_user_fecha ON consultas_ia (user_id, created_at DESC);
