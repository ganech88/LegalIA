import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Cuota + rate limit por usuario en UN solo lugar.
 *
 * Antes cada ruta de IA repetía (con variaciones) el mismo bloque, y dos de
 * ellas seguían llamando a las funciones de uso con el cliente de sesión —
 * revocadas a `authenticated` en la migración 0019 → 429 siempre. Este helper
 * usa siempre el service role cuando está disponible, distingue "error de
 * cuota" (500) de "límite alcanzado" (429) y entrega un `refund()` idempotente.
 */

export type UsageKind = "escrito" | "consulta";

interface ReservaOk {
  ok: true;
  usageClient: SupabaseClient;
  /** Devuelve el crédito. Solo actúa una vez, aunque se llame varias. */
  refund: () => Promise<void>;
}
interface ReservaError {
  ok: false;
  response: NextResponse;
}

const MSG_LIMITE: Record<UsageKind, string> = {
  escrito: "Alcanzaste el límite de escritos de tu plan. Actualizá para continuar.",
  consulta: "Alcanzaste el límite de consultas de tu plan. Actualizá para continuar.",
};

export async function reservarCuota(
  supabase: SupabaseClient,
  userId: string,
  kind: UsageKind,
  opts: { rateAction?: string; rateMax?: number; rateWindowSeconds?: number } = {},
): Promise<ReservaOk | ReservaError> {
  const admin = createAdminClient();
  const usageClient = admin ?? supabase;
  const { rateAction = kind, rateMax = kind === "escrito" ? 10 : 20, rateWindowSeconds = 60 } = opts;

  // Rate limit por usuario (la función valida que p_user_id sea el propio salvo service role).
  const { data: rlOk, error: rlErr } = await usageClient.rpc("check_rate_limit", {
    p_user_id: userId, p_action: rateAction, p_max: rateMax, p_window_seconds: rateWindowSeconds,
  });
  if (!rlErr && rlOk === false) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Demasiadas solicitudes en poco tiempo. Esperá un momento e intentá de nuevo." },
        { status: 429 },
      ),
    };
  }

  const { data: canUse, error: usageErr } = await usageClient.rpc("check_and_increment_usage", {
    p_user_id: userId,
    p_kind: kind,
  });
  if (usageErr) {
    console.error("[quota] check_and_increment_usage falló:", usageErr.message);
    return {
      ok: false,
      response: NextResponse.json(
        { error: "No pudimos verificar tu cuota. Intentá de nuevo en unos segundos." },
        { status: 500 },
      ),
    };
  }
  if (!canUse) {
    return { ok: false, response: NextResponse.json({ error: MSG_LIMITE[kind] }, { status: 429 }) };
  }

  let refunded = false;
  const refund = async () => {
    if (refunded) return;
    refunded = true;
    const { error } = await usageClient.rpc("decrement_usage", { p_user_id: userId, p_kind: kind });
    if (error) console.error("[quota] decrement_usage falló:", error.message);
  };

  return { ok: true, usageClient, refund };
}
