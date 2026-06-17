import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendEmail, isEmailConfigured } from "@/lib/email/resend";

/**
 * Cron diario (Vercel Cron — ver vercel.json) que avisa por email los
 * vencimientos pendientes que vencen dentro de los próximos DÍAS_AVISO días y
 * que todavía no fueron alertados. Se protege con CRON_SECRET.
 */
const DIAS_AVISO = 3;

function autorizado(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Falta service role" }, { status: 503 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const hoy = new Date();
  const limite = new Date(hoy.getTime() + DIAS_AVISO * 24 * 60 * 60 * 1000);
  const hoyISO = hoy.toISOString().slice(0, 10);
  const limiteISO = limite.toISOString().slice(0, 10);

  // Vencimientos pendientes, dentro de la ventana, sin alertar.
  const { data: vencimientos, error } = await admin
    .from("vencimientos")
    .select("id, user_id, titulo, fecha_vencimiento, tipo")
    .eq("estado", "pendiente")
    .is("alertado_at", null)
    .gte("fecha_vencimiento", hoyISO)
    .lte("fecha_vencimiento", limiteISO);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!vencimientos || vencimientos.length === 0) {
    return NextResponse.json({ ok: true, enviados: 0, mensaje: "Sin vencimientos próximos." });
  }

  // Agrupar por usuario.
  type Row = { id: string; user_id: string; titulo: string; fecha_vencimiento: string; tipo: string };
  const porUsuario = new Map<string, Row[]>();
  for (const v of vencimientos as Row[]) {
    const arr = porUsuario.get(v.user_id) ?? [];
    arr.push(v);
    porUsuario.set(v.user_id, arr);
  }

  let enviados = 0;
  const idsAlertados: string[] = [];

  for (const [userId, items] of porUsuario) {
    const { data: userRes } = await admin.auth.admin.getUserById(userId);
    const email = userRes?.user?.email;
    if (!email) continue;

    const filas = items
      .map((v) => `<li><strong>${v.fecha_vencimiento}</strong> — ${v.titulo} (${v.tipo})</li>`)
      .join("");
    const html = `
      <div style="font-family:Georgia,serif;color:#1a1a2e">
        <h2 style="color:#1a1a2e">Tenés ${items.length} vencimiento(s) próximo(s)</h2>
        <ul>${filas}</ul>
        <p style="font-size:13px;color:#666">Revisalos en tu agenda de LegalIA. Verificá los plazos en la fuente oficial.</p>
      </div>`;

    if (isEmailConfigured()) {
      const r = await sendEmail({ to: email, subject: `LegalIA · ${items.length} vencimiento(s) próximo(s)`, html });
      if (r.ok) {
        enviados++;
        idsAlertados.push(...items.map((v) => v.id));
      }
    }
  }

  // Marcar como alertados los que se enviaron.
  if (idsAlertados.length > 0) {
    await admin.from("vencimientos").update({ alertado_at: new Date().toISOString() }).in("id", idsAlertados);
  }

  return NextResponse.json({ ok: true, usuarios: porUsuario.size, enviados, emailConfigurado: isEmailConfigured() });
}
