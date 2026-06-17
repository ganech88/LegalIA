import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getPlan, precioAnual } from "@/lib/billing/plans";
import { createSubscription, isMercadoPagoConfigured } from "@/lib/billing/mercadopago";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { plan: planId, ciclo: cicloRaw } = await request.json();
  const plan = getPlan(planId);
  const ciclo = cicloRaw === "anual" ? "anual" : "mensual";

  if (!plan.checkout || plan.priceARS <= 0) {
    return NextResponse.json({ error: "Plan inválido para checkout." }, { status: 400 });
  }

  const amount = ciclo === "anual" ? precioAnual(plan) : plan.priceARS;
  const frequencyMonths = ciclo === "anual" ? 12 : 1;

  if (!isMercadoPagoConfigured()) {
    return NextResponse.json(
      { error: "El cobro todavía no está habilitado. Configurá MP_ACCESS_TOKEN para activarlo." },
      { status: 503 },
    );
  }

  try {
    const sub = await createSubscription({
      planName: `${plan.name} (${ciclo})`,
      priceARS: amount,
      payerEmail: user.email ?? "",
      userId: user.id,
      frequencyMonths,
    });

    // Guardamos el id de la suscripción en estado "pending" hasta que el webhook
    // confirme la autorización del pago.
    await supabase
      .from("profiles")
      .update({ mp_subscription_id: sub.id, subscription_status: "pending" })
      .eq("id", user.id);

    return NextResponse.json({ init_point: sub.init_point, subscription_id: sub.id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: `No se pudo iniciar el pago: ${msg}` }, { status: 502 });
  }
}
