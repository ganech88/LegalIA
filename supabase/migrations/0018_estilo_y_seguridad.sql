-- 0018: Estilo de redacción personalizado + endurecimiento de funciones de uso.

-- 1) Estilo de redacción del abogado (se inyecta en los prompts de generación).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS estilo_redaccion TEXT;

-- 2) Las funciones de cuota solo deben ejecutarse desde el backend (service role).
--    Evita que un usuario autenticado manipule su cuota vía RPC directo.
REVOKE EXECUTE ON FUNCTION check_and_increment_usage(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION check_and_increment_usage(UUID, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION check_and_increment_usage(UUID, TEXT) FROM authenticated;

REVOKE EXECUTE ON FUNCTION decrement_usage(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION decrement_usage(UUID, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION decrement_usage(UUID, TEXT) FROM authenticated;

-- NOTA: aplicar esta migración recién cuando SUPABASE_SERVICE_ROLE_KEY esté
-- configurada en Vercel, porque las rutas API pasan a llamar estas funciones
-- con el cliente admin (fallback al cliente del usuario si no hay service key).
