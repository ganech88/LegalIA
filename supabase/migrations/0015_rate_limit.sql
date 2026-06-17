-- Rate limiting con ventana deslizante en base de datos (sirve en serverless,
-- donde no hay estado en memoria entre invocaciones).
CREATE TABLE IF NOT EXISTS rate_limit_hits (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_hits_lookup
  ON rate_limit_hits (user_id, action, created_at);

ALTER TABLE rate_limit_hits ENABLE ROW LEVEL SECURITY;
-- Sin políticas públicas: solo la función SECURITY DEFINER accede.

-- Devuelve TRUE si la solicitud está permitida (y la registra), FALSE si superó
-- el límite p_max en la ventana de p_window_seconds.
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_action TEXT,
  p_max INT,
  p_window_seconds INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count INT;
  v_cutoff TIMESTAMPTZ := now() - make_interval(secs => p_window_seconds);
BEGIN
  -- Limpieza oportunista de registros viejos de este usuario/acción.
  DELETE FROM public.rate_limit_hits
  WHERE user_id = p_user_id AND action = p_action AND created_at < v_cutoff;

  SELECT count(*) INTO v_count
  FROM public.rate_limit_hits
  WHERE user_id = p_user_id AND action = p_action AND created_at >= v_cutoff;

  IF v_count >= p_max THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.rate_limit_hits (user_id, action) VALUES (p_user_id, p_action);
  RETURN TRUE;
END;
$$;
