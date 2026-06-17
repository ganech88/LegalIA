/**
 * Cliente mínimo de Mercado Pago (suscripciones "preapproval") usando la API
 * REST directamente, sin SDK. Maneja la creación de una suscripción mensual de
 * monto fijo y la consulta de su estado.
 *
 * Variables de entorno requeridas:
 *   MP_ACCESS_TOKEN        Access token de la app de Mercado Pago (privado, server-only).
 *   NEXT_PUBLIC_APP_URL    URL pública del sitio (para back_url y webhook).
 */

const MP_API = "https://api.mercadopago.com";

export function isMercadoPagoConfigured(): boolean {
  return Boolean(process.env.MP_ACCESS_TOKEN);
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export interface CreateSubscriptionInput {
  planName: string;
  priceARS: number; // monto por ciclo de cobro
  payerEmail: string;
  userId: string; // se guarda como external_reference para identificar al usuario en el webhook
  frequencyMonths?: number; // 1 = mensual (default), 12 = anual
}

export interface CreateSubscriptionResult {
  id: string;
  init_point: string;
  status: string;
}

/** Crea una suscripción (preapproval) y devuelve el init_point para redirigir al pago. */
export async function createSubscription(
  input: CreateSubscriptionInput,
): Promise<CreateSubscriptionResult> {
  if (!isMercadoPagoConfigured()) {
    throw new Error("Mercado Pago no está configurado (falta MP_ACCESS_TOKEN).");
  }

  const body = {
    reason: `LegalIA ${input.planName}`,
    external_reference: input.userId,
    payer_email: input.payerEmail,
    back_url: `${appUrl()}/config?subscription=success`,
    status: "pending",
    auto_recurring: {
      frequency: input.frequencyMonths ?? 1,
      frequency_type: "months",
      transaction_amount: input.priceARS,
      currency_id: "ARS",
    },
  };

  const res = await fetch(`${MP_API}/preapproval`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Mercado Pago error ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as { id: string; init_point?: string; sandbox_init_point?: string; status: string };
  const init_point = data.init_point || data.sandbox_init_point;
  if (!init_point) throw new Error("Mercado Pago no devolvió init_point.");

  return { id: data.id, init_point, status: data.status };
}

export interface PreapprovalStatus {
  id: string;
  status: string; // pending | authorized | paused | cancelled
  external_reference: string | null;
  next_payment_date: string | null;
  reason: string | null;
}

/** Consulta el estado de una suscripción por id. */
export async function getSubscription(id: string): Promise<PreapprovalStatus> {
  if (!isMercadoPagoConfigured()) {
    throw new Error("Mercado Pago no está configurado (falta MP_ACCESS_TOKEN).");
  }

  const res = await fetch(`${MP_API}/preapproval/${id}`, { headers: authHeaders() });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Mercado Pago error ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    id: string;
    status: string;
    external_reference: string | null;
    next_payment_date: string | null;
    reason: string | null;
  };
  return {
    id: data.id,
    status: data.status,
    external_reference: data.external_reference,
    next_payment_date: data.next_payment_date,
    reason: data.reason,
  };
}

/** Deriva el PlanId a partir del campo "reason" de la suscripción. */
export function planFromReason(reason: string | null): "profesional" | "estudio" | null {
  if (!reason) return null;
  const r = reason.toLowerCase();
  if (r.includes("estudio")) return "estudio";
  if (r.includes("profesional")) return "profesional";
  return null;
}
