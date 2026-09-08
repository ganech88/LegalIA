import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendEmail, isEmailConfigured, escapeHtml } from "@/lib/email/resend";

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action : "";
  const email = (user.email ?? "").toLowerCase();
  const tieneServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  // ── Crear estudio ─────────────────────────────────────────────
  if (action === "create") {
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
    if (!name) return NextResponse.json({ error: "Indicá un nombre para el estudio." }, { status: 400 });
    if (!tieneServiceRole) return NextResponse.json({ error: "Servicio no disponible." }, { status: 503 });

    const { data: prof } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
    if (prof?.plan !== "estudio") {
      return NextResponse.json({ error: "Necesitás el plan Estudio para crear un equipo." }, { status: 403 });
    }
    const { data: yaTiene } = await supabase.from("organizations").select("id").eq("owner_id", user.id).maybeSingle();
    if (yaTiene) return NextResponse.json({ error: "Ya tenés un estudio creado." }, { status: 409 });

    // La creación pasa por service role: `authenticated` ya no puede insertar
    // organizaciones por PostgREST (migración 0025).
    const admin = adminClient();
    const { data: org, error } = await admin
      .from("organizations").insert({ name, owner_id: user.id, plan: "estudio", max_miembros: 5 }).select("id").single();
    if (error) return NextResponse.json({ error: "No se pudo crear el estudio." }, { status: 500 });

    await admin.from("organization_members").insert({
      organization_id: org.id, user_id: user.id, invited_email: email, role: "owner", status: "active",
    });
    return NextResponse.json({ id: org.id });
  }

  // ── Invitar miembro ───────────────────────────────────────────
  if (action === "invite") {
    const invitado = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
    if (!invitado || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invitado)) {
      return NextResponse.json({ error: "Ingresá un email válido." }, { status: 400 });
    }
    // Verificamos el plan del dueño en cada invitación (no solo al crear el estudio).
    const { data: profInv } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
    if (profInv?.plan !== "estudio") {
      return NextResponse.json({ error: "Necesitás el plan Estudio activo para invitar integrantes." }, { status: 403 });
    }
    // Máximo 10 invitaciones por hora por dueño (anti-spam con marca LegalIA).
    const { data: rlOk } = await supabase.rpc("check_rate_limit", {
      p_user_id: user.id, p_action: "invitar", p_max: 10, p_window_seconds: 3600,
    });
    if (rlOk === false) {
      return NextResponse.json({ error: "Demasiadas invitaciones seguidas. Probá en un rato." }, { status: 429 });
    }
    const { data: org } = await supabase
      .from("organizations").select("id, name, max_miembros").eq("owner_id", user.id).maybeSingle();
    if (!org) return NextResponse.json({ error: "No tenés un estudio. Creá uno primero." }, { status: 404 });

    const { count } = await supabase
      .from("organization_members").select("id", { count: "exact", head: true }).eq("organization_id", org.id);
    if ((count ?? 0) >= org.max_miembros) {
      return NextResponse.json({ error: `Alcanzaste el máximo de ${org.max_miembros} integrantes.` }, { status: 409 });
    }

    const { error } = await supabase.from("organization_members").insert({
      organization_id: org.id, invited_email: invitado, role: "member", status: "invited",
    });
    if (error) {
      const dup = error.code === "23505";
      return NextResponse.json({ error: dup ? "Ese email ya fue invitado." : "No se pudo invitar." }, { status: dup ? 409 : 500 });
    }

    if (isEmailConfigured()) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";
      await sendEmail({
        to: invitado,
        subject: `Te invitaron al estudio "${org.name.slice(0, 80)}" en LegalIA`,
        html: `<p>Te invitaron a unirte al estudio <strong>${escapeHtml(org.name)}</strong> en LegalIA.</p>
               <p>Ingresá o registrate con este email y aceptá la invitación desde <a href="${appUrl}/equipo">Equipo</a>.</p>`,
      });
    }
    return NextResponse.json({ ok: true });
  }

  // ── Aceptar invitación ────────────────────────────────────────
  if (action === "accept") {
    const { data: invitaciones } = await supabase
      .from("organization_members").select("id").eq("invited_email", email).eq("status", "invited");
    if (!invitaciones || invitaciones.length === 0) {
      return NextResponse.json({ error: "No tenés invitaciones pendientes." }, { status: 404 });
    }
    for (const inv of invitaciones) {
      await supabase.from("organization_members")
        .update({ user_id: user.id, status: "active" }).eq("id", inv.id);
    }
    // Los límites del plan Estudio se heredan por membresía activa
    // (plan_efectivo() en la base, migración 0025): no tocamos profiles.plan,
    // así una suscripción propia del miembro nunca se pisa.
    return NextResponse.json({ ok: true, aceptadas: invitaciones.length });
  }

  // ── Quitar miembro (solo dueño) ───────────────────────────────
  if (action === "remove") {
    const memberId = typeof body.memberId === "string" ? body.memberId : "";
    if (!memberId) return NextResponse.json({ error: "Falta el miembro." }, { status: 400 });

    const { data: org } = await supabase.from("organizations").select("id").eq("owner_id", user.id).maybeSingle();
    if (!org) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

    const { data: miembro } = await supabase
      .from("organization_members").select("id, user_id, role, organization_id").eq("id", memberId).maybeSingle();
    if (!miembro || miembro.organization_id !== org.id) {
      return NextResponse.json({ error: "Miembro no encontrado." }, { status: 404 });
    }
    if (miembro.role === "owner") {
      return NextResponse.json({ error: "No podés quitarte a vos mismo como dueño." }, { status: 400 });
    }

    await supabase.from("organization_members").delete().eq("id", memberId);
    // Al dejar el estudio, el miembro vuelve automáticamente a su propio plan
    // (plan_efectivo() deja de verlo como integrante). Nada que revertir.
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
}
