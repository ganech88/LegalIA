"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESPECIALIDADES, JURISDICCIONES, COLEGIOS_ABOGADOS, PLAN_LIMITS } from "@/types";
import type { Profile, Especialidad, Jurisdiccion, Plan } from "@/types";

export default function ConfigPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [matricula, setMatricula] = useState("");
  const [colegioAbogados, setColegioAbogados] = useState("");
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [jurisdiccion, setJurisdiccion] = useState<Jurisdiccion | "">("");
  const [estudioNombre, setEstudioNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        const p = data as Profile;
        setProfile(p);
        setFullName(p.full_name ?? "");
        setMatricula(p.matricula ?? "");
        setColegioAbogados(p.colegio_abogados ?? "");
        setEspecialidades(p.especialidad ?? []);
        setJurisdiccion((p.jurisdiccion_principal ?? "") as Jurisdiccion | "");
        setEstudioNombre(p.estudio_nombre ?? "");
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  function toggleEspecialidad(esp: Especialidad) {
    setEspecialidades(prev =>
      prev.includes(esp) ? prev.filter(e => e !== esp) : [...prev, esp]
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Sesion expirada."); setSaving(false); return; }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        matricula: matricula || null,
        colegio_abogados: colegioAbogados || null,
        especialidad: especialidades,
        jurisdiccion_principal: jurisdiccion || null,
        estudio_nombre: estudioNombre || null,
      })
      .eq("id", user.id);

    if (updateError) {
      setError("Error al guardar. Intenta de nuevo.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="bg-paper-rules min-h-screen flex items-center justify-center">
        <div className="text-[var(--brand-mute)] text-[14px]">Cargando...</div>
      </div>
    );
  }

  const plan = (profile?.plan ?? "free") as Plan;
  const limits = PLAN_LIMITS[plan];
  const planLabel = plan === "profesional" ? "Profesional" : plan === "estudio" ? "Estudio" : "Gratis";

  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="sticky top-0 z-20 flex items-center border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <span>Workspace</span>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Configuracion</span>
        </nav>
      </header>

      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8 max-w-[800px]">
        <header className="mb-8 pb-6 border-b border-[var(--brand-navy)]">
          <div className="masthead-meta mb-2"><span>CUENTA</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
            Configuracion
          </h1>
          <p className="mt-2 text-[14px] text-[var(--brand-ink-2)]">
            Administra tu perfil profesional, plan y preferencias.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded border border-[var(--brand-red)]/30 bg-[var(--brand-red)]/5 px-4 py-3 text-sm text-[var(--brand-red)]">{error}</div>
        )}
        {saved && (
          <div className="mb-6 rounded border border-[var(--brand-gold)]/30 bg-[var(--brand-gold)]/5 px-4 py-3 text-sm text-[var(--brand-navy)]">Cambios guardados correctamente.</div>
        )}

        {/* Plan section */}
        <section className="card-editorial p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="t-overline text-[var(--brand-gold)] mb-1">PLAN ACTUAL</div>
              <h2 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--brand-navy)]">{planLabel}</h2>
            </div>
            <div className="text-right">
              <div className="font-mono text-[11px] text-[var(--brand-mute)]">
                {profile?.escritos_generados_mes ?? 0}/{limits.escritos_mes === Infinity ? "∞" : limits.escritos_mes} escritos
              </div>
              <div className="font-mono text-[11px] text-[var(--brand-mute)]">
                {profile?.consultas_ia_mes ?? 0}/{limits.consultas_mes === Infinity ? "∞" : limits.consultas_mes} consultas
              </div>
            </div>
          </div>
          {plan === "free" && (
            <div className="rounded bg-[var(--brand-paper-2)] p-4 text-[13px] text-[var(--brand-ink-2)]">
              <strong>Actualiza a Profesional</strong> para 30 escritos/mes, consultas ilimitadas y todas las calculadoras.
              <button className="ml-2 rounded bg-[var(--brand-gold)] px-3 py-1 text-[12px] font-bold text-[var(--brand-navy)]">
                Actualizar →
              </button>
            </div>
          )}
        </section>

        {/* Profile section */}
        <section className="card-editorial p-6 mb-6">
          <div className="t-overline text-[var(--brand-gold)] mb-4">DATOS PROFESIONALES</div>
          <div className="space-y-4">
            <label className="block">
              <span className="t-overline text-[var(--brand-navy)] block mb-1.5">Nombre completo</span>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
              />
            </label>
            <label className="block">
              <span className="t-overline text-[var(--brand-navy)] block mb-1.5">Matricula</span>
              <input
                type="text"
                value={matricula}
                onChange={e => setMatricula(e.target.value)}
                placeholder="T° XX F° XXX"
                className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
              />
            </label>
            <div>
              <span className="t-overline text-[var(--brand-navy)] block mb-1.5">Colegio de Abogados</span>
              <Select value={colegioAbogados} onValueChange={v => setColegioAbogados(v ?? "")}>
                <SelectTrigger className="rounded border-border bg-white">
                  <SelectValue placeholder="Selecciona tu colegio" />
                </SelectTrigger>
                <SelectContent>
                  {COLEGIOS_ABOGADOS.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label className="block">
              <span className="t-overline text-[var(--brand-navy)] block mb-1.5">Nombre del estudio</span>
              <input
                type="text"
                value={estudioNombre}
                onChange={e => setEstudioNombre(e.target.value)}
                placeholder="Estudio Juridico Perez & Asociados"
                className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
              />
            </label>
          </div>
        </section>

        {/* Specialties */}
        <section className="card-editorial p-6 mb-6">
          <div className="t-overline text-[var(--brand-gold)] mb-4">ESPECIALIDADES</div>
          <div className="flex flex-wrap gap-2">
            {ESPECIALIDADES.map(esp => (
              <button
                key={esp.value}
                type="button"
                onClick={() => toggleEspecialidad(esp.value)}
                className={`rounded border px-4 py-2.5 text-[13px] font-medium transition-all ${
                  especialidades.includes(esp.value)
                    ? "border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white"
                    : "border-border bg-white text-[var(--brand-ink-2)] hover:border-[var(--brand-gold)]"
                }`}
              >
                {esp.label}
              </button>
            ))}
          </div>
        </section>

        {/* Jurisdiction */}
        <section className="card-editorial p-6 mb-6">
          <div className="t-overline text-[var(--brand-gold)] mb-4">JURISDICCION</div>
          <Select value={jurisdiccion} onValueChange={v => setJurisdiccion(v as Jurisdiccion)}>
            <SelectTrigger className="rounded border-border bg-white max-w-[400px]">
              <SelectValue placeholder="Selecciona tu jurisdiccion" />
            </SelectTrigger>
            <SelectContent>
              {JURISDICCIONES.map(j => (
                <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-[var(--brand-navy)] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)] disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            onClick={handleLogout}
            className="rounded border border-[var(--brand-red)]/30 px-4 py-2.5 text-[13px] font-medium text-[var(--brand-red)] hover:bg-[var(--brand-red)]/5"
          >
            Cerrar sesion
          </button>
        </div>
      </div>
    </div>
  );
}
