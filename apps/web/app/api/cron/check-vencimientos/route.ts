import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendEmail, isEmailConfigured, escapeHtml } from "@/lib/email/resend";
import { pendientesDeVigilancia, type ChequeoVigencia } from "@/lib/legal/vigencias";
import { checkIpRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Cron diario (Vercel Cron — ver vercel.json) que avisa por email los
 * vencimientos pendientes que vencen dentro de los próximos DÍAS_AVISO días y
 * que todavía no fueron alertados. Se protege con CRON_SECRET.
 */
const DIAS_AVISO = 3;

function autorizado(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const provisto = request.headers.get("authorization") ?? "";
  const a = Buffer.from(provisto);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Lectura mínima con la clave pública: mantiene activo el proyecto de Supabase
 * (el plan free se pausa tras 7 días sin actividad) aunque el cron no esté
 * autorizado. No expone datos.
 */
async function latido(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return false;
  try {
    const { error } = await createClient(url, anon, { auth: { persistSession: false } })
      .from("escrito_templates")
      .select("id")
      .limit(1);
    return !error;
  } catch {
    return false;
  }
}

/** Aviso semanal (lunes) al administrador con los datos legales por vencer. */
async function vigilancia(forzar: boolean): Promise<{ pendientes: ChequeoVigencia[]; enviado: boolean }> {
  const pendientes = pendientesDeVigilancia();
  const esLunes = new Date().getUTCDay() === 1;
  // Casilla de contacto pública de DSF como destino por defecto.
  const admin = process.env.ADMIN_EMAIL ?? "hola@desarrollosinfronteras.com";
  if (pendientes.length === 0 || !admin || !isEmailConfigured() || !(esLunes || forzar)) {
    return { pendientes, enviado: false };
  }
  const filas = pendientes
    .map((c) => `<li><strong>${escapeHtml(c.nombre)}</strong> (${c.estado === "vencido" ? "VENCIDO" : "por vencer"}) — ${escapeHtml(c.detalle)} <a href="${escapeHtml(c.fuente)}">fuente</a></li>`)
    .join("");
  const r = await sendEmail({
    to: admin,
    subject: `LegalIA · ${pendientes.length} dato(s) legal(es) para actualizar`,
    html: `<div style="font-family:Georgia,serif;color:#1a1a2e"><h2>Vigilancia normativa</h2><ul>${filas}</ul></div>`,
  });
  return { pendientes, enviado: r.ok };
}

export async function GET(request: Request) {
  if (!checkIpRateLimit(getClientIp(request), "cron-latido", 6, 60)) {
    return NextResponse.json({ error: "Demasiadas consultas." }, { status: 429 });
  }
  const vivo = await latido();
  if (!autorizado(request)) {
    return NextResponse.json({ error: "No autorizado", latido: vivo }, { status: 401 });
  }
  const vig = await vigilancia(new URL(request.url).searchParams.get("vigilancia") === "1");
  const vigResumen = { pendientes: vig.pendientes.map((c) => c.id), enviado: vig.enviado };
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
    return NextResponse.json({ ok: true, enviados: 0, mensaje: "Sin vencimientos próximos.", vigilancia: vigResumen });
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
      .map((v) => `<li><strong>${escapeHtml(v.fecha_vencimiento)}</strong> — ${escapeHtml(v.titulo)} (${escapeHtml(v.tipo)})</li>`)
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

  return NextResponse.json({ ok: true, usuarios: porUsuario.size, enviados, emailConfigurado: isEmailConfigured(), vigilancia: vigResumen });
}
