-- 0025: Cierre de agujeros de seguridad detectados en la auditoría del 2026-09-08.
--
-- 1) profiles: el usuario podía auto-asignarse plan = 'estudio' y resetear sus
--    contadores por PostgREST (la política UPDATE no tenía WITH CHECK ni
--    privilegios por columna). Ahora `authenticated` solo puede tocar los
--    campos de perfil.
-- 2) check_and_increment_usage: era leer-comparar-escribir (carrera entre
--    requests concurrentes → se saltaba la cuota). Ahora es un UPDATE
--    condicional atómico. Además calcula el PLAN EFECTIVO: un miembro activo
--    de un estudio cuyo dueño paga plan Estudio hereda sus límites sin que
--    haya que mutar profiles.plan (que pisaba suscripciones propias).
-- 3) check_rate_limit: cualquier usuario podía llamarla con el UUID de otro y
--    bloquearlo (DoS). Ahora valida auth.uid() salvo service_role.
-- 4) organizations / organization_members: un usuario free podía crear un
--    estudio directo por PostgREST e invitar gente; un invitado podía
--    cambiarse el rol a owner o moverse de organización.
-- 5) apply_subscription_change: un evento tardío de una suscripción vieja
--    degradaba a free una suscripción vigente.
-- 6) consultas_ia: el usuario no podía borrar su historial (ley 25.326).

-- ── 1) profiles: privilegios por columna ─────────────────────────────────
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (full_name, matricula, colegio_abogados, especialidad,
              jurisdiccion_principal, estudio_nombre, estilo_redaccion, updated_at)
  ON profiles TO authenticated;

-- ── 2) cuota atómica + plan efectivo ─────────────────────────────────────
CREATE OR REPLACE FUNCTION plan_efectivo(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT CASE
    WHEN p.plan = 'estudio' THEN 'estudio'
    WHEN EXISTS (
      SELECT 1
      FROM public.organization_members m
      JOIN public.organizations o ON o.id = m.organization_id
      JOIN public.profiles owner ON owner.id = o.owner_id
      WHERE m.user_id = p_user_id AND m.status = 'active' AND owner.plan = 'estudio'
    ) THEN 'estudio'
    ELSE p.plan
  END
  FROM public.profiles p
  WHERE p.id = p_user_id;
$$;
REVOKE EXECUTE ON FUNCTION plan_efectivo(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION plan_efectivo(UUID) TO authenticated, service_role;

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
  v_limit INT;
  v_ok BOOLEAN := FALSE;
BEGIN
  -- Reset mensual (idempotente).
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
    v_limit := CASE v_plan WHEN 'free' THEN 3 WHEN 'profesional' THEN 30 ELSE 999999 END;
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
$$;

-- ── 3) check_rate_limit: solo el propio usuario (o service_role) ──────────
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
  v_window INT := LEAST(GREATEST(COALESCE(p_window_seconds, 60), 1), 3600);
  v_cutoff TIMESTAMPTZ := now() - make_interval(secs => v_window);
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' AND auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'check_rate_limit: usuario no autorizado' USING ERRCODE = '42501';
  END IF;

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
GRANT EXECUTE ON FUNCTION check_rate_limit(uuid, text, integer, integer) TO service_role;

-- ── 4) organizations: creación solo desde el backend (service role) ───────
DROP POLICY IF EXISTS "org owner manage" ON organizations;
CREATE POLICY "org owner update" ON organizations FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid() AND max_miembros <= 5 AND plan = 'estudio');
CREATE POLICY "org owner delete" ON organizations FOR DELETE
  USING (owner_id = auth.uid());
-- Sin política INSERT para authenticated: la crea /api/equipo con service role
-- después de verificar el plan.

DROP POLICY IF EXISTS "members self update" ON organization_members;
CREATE POLICY "members self update" ON organization_members FOR UPDATE
  USING (invited_email = lower(auth.jwt() ->> 'email') OR user_id = auth.uid())
  WITH CHECK (
    role = 'member'
    AND (user_id = auth.uid() OR user_id IS NULL)
    AND invited_email = lower(auth.jwt() ->> 'email')
  );

-- Un miembro no puede cambiar de organización ni de rol por su cuenta.
CREATE OR REPLACE FUNCTION protect_membership_fields()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND NOT public.is_org_owner(OLD.organization_id)
     AND (NEW.organization_id <> OLD.organization_id OR NEW.role <> OLD.role) THEN
    RAISE EXCEPTION 'No podés modificar la organización ni el rol de la membresía' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_protect_membership ON organization_members;
CREATE TRIGGER trg_protect_membership
  BEFORE UPDATE ON organization_members
  FOR EACH ROW EXECUTE FUNCTION protect_membership_fields();

-- ── 5) webhook: no degradar una suscripción distinta a la notificada ───────
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
  WHERE id = p_user_id
    AND (
      p_plan <> 'free'
      OR mp_subscription_id IS NULL
      OR p_subscription_id IS NULL
      OR mp_subscription_id = p_subscription_id
    );
END;
$$;

-- ── 6) el usuario puede borrar su historial de consultas ──────────────────
DROP POLICY IF EXISTS "Users can delete own consultas" ON consultas_ia;
CREATE POLICY "Users can delete own consultas" ON consultas_ia
  FOR DELETE USING (auth.uid() = user_id);

-- ── 7) feedback del chat: el usuario puede marcar útil / no útil ──────────
DROP POLICY IF EXISTS "Users can update own consultas" ON consultas_ia;
CREATE POLICY "Users can update own consultas" ON consultas_ia
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
REVOKE UPDATE ON consultas_ia FROM authenticated;
GRANT UPDATE (feedback) ON consultas_ia TO authenticated;
