import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendEmail, isEmailConfigured } from "@/lib/email/resend";

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

  const body = await request.json();
  const action = body.action as string;
  const email = (user.email ?? "").toLowerCase();

  // ── Crear estudio ─────────────────────────────────────────────
  if (action === "create") {
    const name = (body.name as string)?.trim();
    if (!name) return NextResponse.json({ error: "Indicá un nombre para el estudio." }, { status: 400 });

    const { data: prof } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
    if (prof?.plan !== "estudio") {
      return NextResponse.json({ error: "Necesitás el plan Estudio para crear un equipo." }, { status: 403 });
    }
    const { data: yaTiene } = await supabase.from("organizations").select("id").eq("owner_id", user.id).maybeSingle();
    if (yaTiene) return NextResponse.json({ error: "Ya tenés un estudio creado." }, { status: 409 });

    const { data: org, error } = await supabase
      .from("organizations").insert({ name, owner_id: user.id }).select("id").single();
    if (error) return NextResponse.json({ error: "No se pudo crear el estudio." }, { status: 500 });

    await supabase.from("organization_members").insert({
      organization_id: org.id, user_id: user.id, invited_email: email, role: "owner", status: "active",
    });
    return NextResponse.json({ id: org.id });
  }

  // ── Invitar miembro ───────────────────────────────────────────
  if (action === "invite") {
    const invitado = (body.email as string)?.trim().toLowerCase();
    if (!invitado || !invitado.includes("@")) {
      return NextResponse.json({ error: "Ingresá un email válido." }, { status: 400 });
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
        subject: `Te invitaron al estudio "${org.name}" en LegalIA`,
        html: `<p>Te invitaron a unirte al estudio <strong>${org.name}</strong> en LegalIA.</p>
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
    // El miembro obtiene los límites del plan Estudio mientras pertenezca al equipo.
    await supabase.from("profiles").update({ plan: "estudio" }).eq("id", user.id);
    return NextResponse.json({ ok: true, aceptadas: invitaciones.length });
  }

  // ── Quitar miembro (solo dueño) ───────────────────────────────
  if (action === "remove") {
    const memberId = body.memberId as string;
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

    // Revertir el plan del miembro (requiere service role).
    if (miembro.user_id && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      await adminClient().from("profiles").update({ plan: "free" }).eq("id", miembro.user_id);
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
}
