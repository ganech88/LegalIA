-- Vencimientos y alertas (agenda procesal).
CREATE TABLE IF NOT EXISTS vencimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  caso_id UUID REFERENCES casos(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_vencimiento DATE NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'plazo_procesal', -- plazo_procesal | audiencia | prescripcion | otro
  estado TEXT NOT NULL DEFAULT 'pendiente',    -- pendiente | cumplido
  alertado_at TIMESTAMPTZ,                      -- cuándo se envió la alerta por email
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vencimientos_user_fecha
  ON vencimientos (user_id, fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_vencimientos_pendientes
  ON vencimientos (estado, fecha_vencimiento) WHERE estado = 'pendiente';

ALTER TABLE vencimientos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own vencimientos only" ON vencimientos FOR ALL USING (auth.uid() = user_id);
