CREATE OR REPLACE FUNCTION check_and_increment_usage(
  p_user_id UUID,
  p_kind TEXT -- 'escrito' or 'consulta'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_plan TEXT;
  v_current INT;
  v_limit INT;
  v_period_start DATE;
BEGIN
  SELECT plan, escritos_generados_mes, consultas_ia_mes, usage_period_start
  INTO v_plan, v_current, v_current, v_period_start
  FROM public.profiles WHERE id = p_user_id;

  -- Reset counters if new month
  IF v_period_start < date_trunc('month', CURRENT_DATE)::DATE THEN
    UPDATE public.profiles
    SET escritos_generados_mes = 0,
        consultas_ia_mes = 0,
        usage_period_start = CURRENT_DATE
    WHERE id = p_user_id;
    v_current := 0;
  END IF;

  -- Get current value and limit
  IF p_kind = 'escrito' THEN
    SELECT escritos_generados_mes INTO v_current FROM public.profiles WHERE id = p_user_id;
    v_limit := CASE v_plan WHEN 'free' THEN 3 WHEN 'profesional' THEN 30 ELSE 999999 END;
  ELSE
    SELECT consultas_ia_mes INTO v_current FROM public.profiles WHERE id = p_user_id;
    v_limit := CASE v_plan WHEN 'free' THEN 20 WHEN 'profesional' THEN 999999 ELSE 999999 END;
  END IF;

  IF v_current >= v_limit THEN
    RETURN FALSE;
  END IF;

  -- Increment
  IF p_kind = 'escrito' THEN
    UPDATE public.profiles SET escritos_generados_mes = escritos_generados_mes + 1 WHERE id = p_user_id;
  ELSE
    UPDATE public.profiles SET consultas_ia_mes = consultas_ia_mes + 1 WHERE id = p_user_id;
  END IF;

  RETURN TRUE;
END;
$$;
