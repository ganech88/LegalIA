"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Org { id: string; name: string; max_miembros: number }
interface Member { id: string; invited_email: string | null; role: string; status: string; user_id: string | null }

export default function EquipoPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<string>("free");
  const [email, setEmail] = useState("");
  const [ownedOrg, setOwnedOrg] = useState<Org | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberOf, setMemberOf] = useState<Org | null>(null);
  const [invites, setInvites] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [nombreEstudio, setNombreEstudio] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const myEmail = (user.email ?? "").toLowerCase();
    setEmail(myEmail);

    const { data: prof } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
    setPlan(prof?.plan ?? "free");

    const { data: owned } = await supabase.from("organizations").select("id, name, max_miembros").eq("owner_id", user.id).maybeSingle();
    setOwnedOrg((owned as Org) ?? null);

    if (owned) {
      const { data: mem } = await supabase.from("organization_members").select("id, invited_email, role, status, user_id").eq("organization_id", owned.id).order("created_at");
      setMembers((mem as Member[]) ?? []);
    } else {
      // ¿Soy miembro de alguna org?
      const { data: myMem } = await supabase.from("organization_members").select("organization_id").eq("user_id", user.id).eq("status", "active").maybeSingle();
      if (myMem) {
        const { data: org } = await supabase.from("organizations").select("id, name, max_miembros").eq("id", myMem.organization_id).maybeSingle();
        setMemberOf((org as Org) ?? null);
      }
    }

    const { data: inv } = await supabase.from("organization_members").select("id, invited_email, role, status, user_id").eq("invited_email", myEmail).eq("status", "invited");
    setInvites((inv as Member[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function call(payload: Record<string, unknown>) {
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/equipo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error."); return false; }
      return true;
    } catch { setError("Error de conexión."); return false; }
    finally { setBusy(false); }
  }

  if (loading) return <div className="bg-paper-rules min-h-screen flex items-center justify-center text-[var(--brand-mute)] text-[14px]">Cargando…</div>;

  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="sticky top-0 z-20 flex items-center border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <span>Workspace</span><span className="opacity-40">/</span><span className="font-medium text-[var(--brand-ink)]">Equipo</span>
        </nav>
      </header>

      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8 max-w-[760px]">
        <header className="mb-6 pb-6 border-b border-[var(--brand-navy)]">
          <div className="masthead-meta mb-2"><span>PLAN ESTUDIO</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">Tu estudio</h1>
          <p className="mt-2 text-[14px] text-[var(--brand-ink-2)] max-w-[560px]">Invitá hasta 5 integrantes. Los casos que marques como compartidos los ve todo el equipo.</p>
        </header>

        {error && <div className="mb-4 rounded border border-[var(--brand-red)]/30 bg-[var(--brand-red)]/5 px-4 py-2.5 text-[13px] text-[var(--brand-red)]">{error}</div>}

        {/* Invitaciones pendientes */}
        {invites.length > 0 && (
          <section className="card-editorial p-6 mb-6">
            <div className="t-overline text-[var(--brand-gold)] mb-2">INVITACIÓN PENDIENTE</div>
            <p className="text-[13px] text-[var(--brand-ink-2)] mb-3">Te invitaron a un estudio. Al aceptar, obtenés los beneficios del plan Estudio.</p>
            <button disabled={busy} onClick={async () => { if (await call({ action: "accept" })) load(); }}
              className="rounded bg-[var(--brand-navy)] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--brand-navy-2)] disabled:opacity-60">
              Aceptar invitación
            </button>
          </section>
        )}

        {/* Dueño: gestión */}
        {ownedOrg ? (
          <>
            <section className="card-editorial p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="t-overline text-[var(--brand-gold)] mb-1">ESTUDIO</div>
                  <h2 className="font-[var(--font-display)] text-xl font-semibold text-[var(--brand-navy)]">{ownedOrg.name}</h2>
                </div>
                <span className="font-mono text-[11px] text-[var(--brand-mute)]">{members.length}/{ownedOrg.max_miembros} integrantes</span>
              </div>
              <div className="divide-y divide-border">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <span className="text-[13px] text-[var(--brand-ink)]">{m.invited_email}</span>
                      <span className="ml-2 font-mono text-[10px] uppercase text-[var(--brand-mute)]">
                        {m.role === "owner" ? "dueño" : m.status === "invited" ? "invitado" : "activo"}
                      </span>
                    </div>
                    {m.role !== "owner" && (
                      <button disabled={busy} onClick={async () => { if (await call({ action: "remove", memberId: m.id })) load(); }}
                        className="rounded border border-border px-2.5 py-1 text-[11px] text-[var(--brand-mute)] hover:text-[var(--brand-red)] hover:border-[var(--brand-red)]/40">Quitar</button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="card-editorial p-6">
              <div className="t-overline text-[var(--brand-navy)] mb-3">Invitar integrante</div>
              <div className="flex gap-2">
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colega@estudio.com.ar"
                  className="flex-1 rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none" />
                <button disabled={busy || !inviteEmail} onClick={async () => { if (await call({ action: "invite", email: inviteEmail })) { setInviteEmail(""); load(); } }}
                  className="rounded bg-[var(--brand-navy)] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--brand-navy-2)] disabled:opacity-60">Invitar</button>
              </div>
            </section>
          </>
        ) : memberOf ? (
          <section className="card-editorial p-6">
            <div className="t-overline text-[var(--brand-gold)] mb-1">SOS PARTE DE</div>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-[var(--brand-navy)]">{memberOf.name}</h2>
            <p className="mt-2 text-[13px] text-[var(--brand-ink-2)]">Tenés acceso a los casos compartidos del estudio y a los beneficios del plan.</p>
          </section>
        ) : plan === "estudio" ? (
          <section className="card-editorial p-6">
            <div className="t-overline text-[var(--brand-navy)] mb-3">Creá tu estudio</div>
            <div className="flex gap-2">
              <input value={nombreEstudio} onChange={(e) => setNombreEstudio(e.target.value)} placeholder="Estudio Pérez & Asociados"
                className="flex-1 rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none" />
              <button disabled={busy || !nombreEstudio} onClick={async () => { if (await call({ action: "create", name: nombreEstudio })) load(); }}
                className="rounded bg-[var(--brand-navy)] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--brand-navy-2)] disabled:opacity-60">Crear estudio</button>
            </div>
          </section>
        ) : (
          <section className="card-editorial p-6 text-center">
            <p className="text-[14px] text-[var(--brand-ink-2)]">El trabajo en equipo es parte del <strong>plan Estudio</strong>.</p>
            <a href="/config" className="mt-3 inline-block rounded bg-[var(--brand-gold)] px-4 py-2 text-[13px] font-semibold text-[var(--brand-navy)]">Ver planes →</a>
          </section>
        )}
      </div>
    </div>
  );
}
