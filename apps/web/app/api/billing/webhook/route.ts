import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSubscription, planFromReason } from "@/lib/billing/mercadopago";

/**
 * Webhook de Mercado Pago para suscripciones (preapproval).
 *
 * Configurar la URL `${NEXT_PUBLIC_APP_URL}/api/billing/webhook` en el panel de
 * Mercado Pago (Notificaciones IPN/Webhooks) para los eventos de suscripción.
 *
 * Requiere SUPABASE_SERVICE_ROLE_KEY (server-only) para actualizar el plan del
 * usuario saltando RLS de forma controlada.
 */

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

function extractPreapprovalId(url: URL, body: Record<string, unknown> | null): string | null {
  // Formatos posibles: ?data.id=, ?id=, o body { data: { id } }.
  const fromQuery = url.searchParams.get("data.id") || url.searchParams.get("id");
  if (fromQuery) return fromQuery;
  const data = body?.data as { id?: string } | undefined;
  return data?.id ?? null;
}

export async function POST(request: Request) {
  const url = new URL(request.url);

  let body: Record<string, unknown> | null = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const type =
    url.searchParams.get("type") ||
    url.searchParams.get("topic") ||
    (typeof body?.type === "string" ? (body.type as string) : null);

  // Solo nos interesan eventos de suscripción.
  if (type && !type.includes("preapproval") && !type.includes("subscription")) {
    return NextResponse.json({ ignored: true });
  }

  const preapprovalId = extractPreapprovalId(url, body);
  if (!preapprovalId) {
    return NextResponse.json({ error: "Sin id de suscripción" }, { status: 200 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Sin service role no podemos aplicar el cambio; respondemos 500 para que MP reintente.
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 500 });
  }

  try {
    const supabase = serviceClient();

    // Idempotencia: la notificación trae un id propio en el body.
    const eventId = (typeof body?.id === "string" || typeof body?.id === "number")
      ? String(body.id)
      : `${preapprovalId}:${Date.now()}`;

    const sub = await getSubscription(preapprovalId);
    const userId = sub.external_reference;
    if (!userId) {
      return NextResponse.json({ error: "Suscripción sin external_reference" }, { status: 200 });
    }

    // Estado autorizado → activa el plan contratado. Pausado/cancelado → baja a free.
    let newPlan: string;
    let newStatus = sub.status;
    if (sub.status === "authorized") {
      newPlan = planFromReason(sub.reason) ?? "profesional";
    } else if (sub.status === "paused" || sub.status === "cancelled") {
      newPlan = "free";
    } else {
      newPlan = "free";
      newStatus = sub.status; // pending u otros: no se activa todavía
    }

    const periodEnd = sub.next_payment_date ? new Date(sub.next_payment_date).toISOString() : null;

    // Aplicar el cambio de plan es idempotente (fija el plan al valor calculado),
    // así que lo hacemos primero. Si falla, el catch devuelve 500 y MP reintenta.
    if (sub.status === "authorized" || sub.status === "paused" || sub.status === "cancelled") {
      const { error: rpcErr } = await supabase.rpc("apply_subscription_change", {
        p_user_id: userId,
        p_plan: newPlan,
        p_subscription_id: preapprovalId,
        p_status: newStatus,
        p_period_end: periodEnd,
      });
      if (rpcErr) throw new Error(rpcErr.message);
    }

    // Registro de auditoría (idempotente por UNIQUE(provider, event_id)).
    await supabase.from("billing_events").insert({
      provider: "mercadopago",
      event_id: eventId,
      event_type: type ?? "preapproval",
      subscription_id: preapprovalId,
      user_id: userId,
      new_plan: newPlan,
      new_status: newStatus,
      raw: body ?? {},
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error";
    // 500 para que Mercado Pago reintente la notificación.
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
