import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con service role (SOLO server-side).
 *
 * Se usa para operaciones internas que no deben depender de los permisos del
 * usuario: contabilizar/devolver cuota de uso, aplicar cambios de plan, etc.
 * Nunca importar desde componentes cliente.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
