-- Facturación / suscripciones (Mercado Pago).
-- Columnas en profiles para rastrear el estado de la suscripción.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mp_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'none', -- none | pending | authorized | paused | cancelled
  ADD COLUMN IF NOT EXISTS plan_period_end TIMESTAMPTZ;

-- Registro de eventos de webhook para idempotencia y auditoría.
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'mercadopago',
  event_id TEXT,                 -- id de notificación del proveedor (idempotencia)
  event_type TEXT,
  subscription_id TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  new_plan TEXT,
  new_status TEXT,
  raw JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (provider, event_id)
);

ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
-- Solo el service role (webhook) escribe/lee; sin políticas públicas.

-- Aplica un cambio de plan/suscripción de forma atómica. La llama el webhook
-- (service role). SECURITY DEFINER para poder escribir saltando RLS de forma
-- controlada.
CREATE OR REPLACE FUNCTION apply_subscription_change(
  p_user_id UUID,
  p_plan TEXT,
  p_subscription_id TEXT,
  p_status TEXT,
  p_period_end TIMESTAMPTZ
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET plan = p_plan,
      mp_subscription_id = COALESCE(p_subscription_id, mp_subscription_id),
      subscription_status = p_status,
      plan_period_end = p_period_end,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$;
