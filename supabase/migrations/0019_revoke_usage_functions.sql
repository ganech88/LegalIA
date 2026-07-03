-- 0019: Endurecimiento de las funciones de cuota.
-- Evita que un usuario autenticado manipule su cuota llamando los RPC directo:
-- las rutas API ya las invocan con service role (lib/supabase/admin.ts).
-- APLICADA en remoto el 2026-07-01 vía MCP (verificado antes que
-- SUPABASE_SERVICE_ROLE_KEY está en Vercel para Production y Preview).

REVOKE EXECUTE ON FUNCTION check_and_increment_usage(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION check_and_increment_usage(UUID, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION check_and_increment_usage(UUID, TEXT) FROM authenticated;

REVOKE EXECUTE ON FUNCTION decrement_usage(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION decrement_usage(UUID, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION decrement_usage(UUID, TEXT) FROM authenticated;

-- El backend (service role) conserva acceso explícito.
GRANT EXECUTE ON FUNCTION check_and_increment_usage(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION decrement_usage(UUID, TEXT) TO service_role;
