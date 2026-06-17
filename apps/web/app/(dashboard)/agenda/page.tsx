"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Vencimiento {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_vencimiento: string;
  tipo: string;
  estado: string;
  caso_id: string | null;
}
interface CasoMin { id: string; caratula: string }

const TIPOS = [
  { value: "plazo_procesal", label: "Plazo procesal" },
  { value: "audiencia", label: "Audiencia" },
  { value: "prescripcion", label: "Prescripción" },
  { value: "otro", label: "Otro" },
];

function diasRestantes(fechaISO: string): number {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const hoy = new Date();
  const objetivo = new Date(y, m - 1, d);
  const hoy0 = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((objetivo.getTime() - hoy0.getTime()) / (1000 * 60 * 60 * 24));
}

export default function AgendaPage() {
  const supabase = createClient();
  const [vencimientos, setVencimientos] = useState<Vencimiento[]>([]);
  const [casos, setCasos] = useState<CasoMin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState("");
  const [tipo, setTipo] = useState("plazo_procesal");
  const [casoId, setCasoId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: v }, { data: c }] = await Promise.all([
      supabase.from("vencimientos").select("*").order("fecha_vencimiento", { ascending: true }),
      supabase.from("casos").select("id, caratula").order("created_at", { ascending: false }),
    ]);
    setVencimientos((v as Vencimiento[]) ?? []);
    setCasos((c as CasoMin[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo || !fecha) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    await supabase.from("vencimientos").insert({
      user_id: user.id,
      titulo,
      fecha_vencimiento: fecha,
      tipo,
      caso_id: casoId || null,
      descripcion: descripcion || null,
    });
    setTitulo(""); setFecha(""); setTipo("plazo_procesal"); setCasoId(""); setDescripcion("");
    setShowForm(false);
    setSaving(false);
    load();
  }

  async function marcarCumplido(id: string) {
    await supabase.from("vencimientos").update({ estado: "cumplido", updated_at: new Date().toISOString() }).eq("id", id);
    load();
  }
  async function eliminar(id: string) {
    await supabase.from("vencimientos").delete().eq("id", id);
    load();
  }

  const pendientes = vencimientos.filter((v) => v.estado === "pendiente");
  const cumplidos = vencimientos.filter((v) => v.estado === "cumplido");
  const casoCaratula = (id: string | null) => casos.find((c) => c.id === id)?.caratula;

  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <span>Workspace</span><span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Agenda</span>
        </nav>
        <button onClick={() => setShowForm((s) => !s)}
          className="rounded bg-[var(--brand-navy)] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[var(--brand-navy-2)]">
          {showForm ? "Cancelar" : "+ Nuevo vencimiento"}
        </button>
      </header>

      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8 max-w-[900px]">
        <header className="mb-6 pb-6 border-b border-[var(--brand-navy)]">
          <div className="masthead-meta mb-2"><span>AGENDA PROCESAL</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
            Vencimientos y plazos
          </h1>
          <p className="mt-2 text-[14px] text-[var(--brand-ink-2)] max-w-[600px]">
            Registrá tus vencimientos. Te avisamos por email los que están por vencer.
          </p>
        </header>

        {showForm && (
          <form onSubmit={crear} className="card-editorial p-6 mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="t-overline text-[var(--brand-navy)] block mb-1.5">Título *</span>
                <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required placeholder="Contestar demanda — García c/ ACME"
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none" />
              </label>
              <label className="block">
                <span className="t-overline text-[var(--brand-navy)] block mb-1.5">Fecha de vencimiento *</span>
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none" />
              </label>
              <label className="block">
                <span className="t-overline text-[var(--brand-navy)] block mb-1.5">Tipo</span>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)}
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none">
                  {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="t-overline text-[var(--brand-navy)] block mb-1.5">Caso (opcional)</span>
                <select value={casoId} onChange={(e) => setCasoId(e.target.value)}
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none">
                  <option value="">— Sin caso asociado —</option>
                  {casos.map((c) => <option key={c.id} value={c.id}>{c.caratula}</option>)}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="t-overline text-[var(--brand-navy)] block mb-1.5">Notas</span>
              <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none" />
            </label>
            <button type="submit" disabled={saving}
              className="rounded bg-[var(--brand-navy)] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--brand-navy-2)] disabled:opacity-60">
              {saving ? "Guardando…" : "Guardar vencimiento"}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-[14px] text-[var(--brand-mute)]">Cargando…</p>
        ) : (
          <>
            <div className="space-y-2 mb-8">
              {pendientes.length === 0 && (
                <div className="card-editorial px-6 py-10 text-center text-[13px] text-[var(--brand-mute)]">
                  No tenés vencimientos pendientes. Agregá uno o guardalo desde la calculadora de plazos.
                </div>
              )}
              {pendientes.map((v) => {
                const dias = diasRestantes(v.fecha_vencimiento);
                const urgente = dias <= 3;
                const vencido = dias < 0;
                return (
                  <article key={v.id} className={`card-editorial p-4 flex items-start justify-between gap-4 ${vencido ? "border-l-4 border-l-[var(--brand-red)]" : urgente ? "border-l-4 border-l-[var(--brand-gold)]" : ""}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${vencido ? "bg-[var(--brand-red)]/10 text-[var(--brand-red)]" : urgente ? "bg-[var(--brand-gold)]/15 text-[var(--brand-navy)]" : "bg-[var(--brand-navy)]/5 text-[var(--brand-navy)]"}`}>
                          {vencido ? `VENCIDO HACE ${Math.abs(dias)}D` : dias === 0 ? "VENCE HOY" : `EN ${dias} DÍA${dias !== 1 ? "S" : ""}`}
                        </span>
                        <span className="font-mono text-[10px] text-[var(--brand-mute)]">{v.fecha_vencimiento}</span>
                        <span className="font-mono text-[10px] text-[var(--brand-mute)]">· {TIPOS.find((t) => t.value === v.tipo)?.label}</span>
                      </div>
                      <h3 className="font-[var(--font-serif)] text-[14px] font-semibold text-[var(--brand-navy)]">{v.titulo}</h3>
                      {v.caso_id && casoCaratula(v.caso_id) && (
                        <p className="text-[11px] text-[var(--brand-mute)] mt-0.5">{casoCaratula(v.caso_id)}</p>
                      )}
                      {v.descripcion && <p className="text-[12px] text-[var(--brand-ink-2)] mt-1">{v.descripcion}</p>}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => marcarCumplido(v.id)} title="Marcar cumplido"
                        className="rounded border border-border bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--brand-navy)] hover:border-[var(--brand-gold)]">✓ Cumplido</button>
                      <button onClick={() => eliminar(v.id)} title="Eliminar"
                        className="rounded border border-border bg-white px-2 py-1 text-[11px] text-[var(--brand-mute)] hover:text-[var(--brand-red)]">✕</button>
                    </div>
                  </article>
                );
              })}
            </div>

            {cumplidos.length > 0 && (
              <div>
                <div className="t-overline text-[var(--brand-mute)] mb-2">Cumplidos</div>
                <div className="space-y-1.5">
                  {cumplidos.map((v) => (
                    <div key={v.id} className="flex items-center justify-between rounded border border-border bg-white/50 px-4 py-2 text-[12px]">
                      <span className="text-[var(--brand-mute)] line-through">{v.titulo}</span>
                      <button onClick={() => eliminar(v.id)} className="text-[var(--brand-mute)] hover:text-[var(--brand-red)]">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
