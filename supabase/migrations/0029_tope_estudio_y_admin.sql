-- 0029: tope de escritos del plan Estudio + marca de administrador.

-- El plan Estudio tenía escritos ilimitados: era el único plan en el que un
-- usuario podía costar más de lo que paga. Tope: 60 escritos por usuario y mes.
CREATE OR REPLACE FUNCTION public.check_and_increment_usage(p_user_id uuid, p_kind text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_plan TEXT;
  v_limit INT;
  v_ok BOOLEAN := FALSE;
BEGIN
  UPDATE public.profiles
  SET escritos_generados_mes = 0,
      consultas_ia_mes = 0,
      usage_period_start = CURRENT_DATE
  WHERE id = p_user_id
    AND usage_period_start < date_trunc('month', CURRENT_DATE)::DATE;

  v_plan := public.plan_efectivo(p_user_id);
  IF v_plan IS NULL THEN
    RETURN FALSE;
  END IF;

  IF p_kind = 'escrito' THEN
    v_limit := CASE v_plan WHEN 'free' THEN 3 WHEN 'profesional' THEN 30 WHEN 'estudio' THEN 60 ELSE 3 END;
    UPDATE public.profiles
    SET escritos_generados_mes = escritos_generados_mes + 1
    WHERE id = p_user_id AND escritos_generados_mes < v_limit
    RETURNING TRUE INTO v_ok;
  ELSE
    v_limit := CASE v_plan WHEN 'free' THEN 20 ELSE 999999 END;
    UPDATE public.profiles
    SET consultas_ia_mes = consultas_ia_mes + 1
    WHERE id = p_user_id AND consultas_ia_mes < v_limit
    RETURNING TRUE INTO v_ok;
  END IF;

  RETURN COALESCE(v_ok, FALSE);
END;
$function$;

-- Administrador de la plataforma (panel /admin/consumo). No está entre las
-- columnas que el usuario puede modificar: se asigna a mano desde SQL.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS es_admin BOOLEAN NOT NULL DEFAULT FALSE;
