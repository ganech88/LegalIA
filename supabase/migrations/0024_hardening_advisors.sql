-- Hardening según el linter de seguridad de Supabase (advisors 2026-07-11).

-- 1) handle_new_user es un trigger: nadie debería poder llamarlo por RPC.
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM PUBLIC, anon, authenticated;

-- 2) check_rate_limit lo llaman las rutas API con el cliente del usuario:
--    authenticated se mantiene; anon no tiene por qué ejecutarlo.
REVOKE EXECUTE ON FUNCTION check_rate_limit(uuid, text, integer, integer) FROM PUBLIC, anon;

-- 3) Helpers de organizaciones: se usan dentro de políticas RLS (corren como
--    authenticated); anon no las necesita.
REVOKE EXECUTE ON FUNCTION is_org_owner(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION current_user_org_ids() FROM PUBLIC, anon;

-- 4) search_path fijo en funciones (evita hijacking por search_path mutable).
ALTER FUNCTION update_updated_at() SET search_path = public;
ALTER FUNCTION search_legal_knowledge(vector, double precision, integer, text, text) SET search_path = public;
