-- Devuelve un crédito de uso cuando la generación falla (refund).
-- Se llama desde las rutas API si el proveedor de IA no produjo contenido,
-- para no penalizar al usuario por un error del sistema.
CREATE OR REPLACE FUNCTION decrement_usage(
  p_user_id UUID,
  p_kind TEXT -- 'escrito' o 'consulta'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_kind = 'escrito' THEN
    UPDATE public.profiles
    SET escritos_generados_mes = GREATEST(0, escritos_generados_mes - 1)
    WHERE id = p_user_id;
  ELSE
    UPDATE public.profiles
    SET consultas_ia_mes = GREATEST(0, consultas_ia_mes - 1)
    WHERE id = p_user_id;
  END IF;
END;
$$;
