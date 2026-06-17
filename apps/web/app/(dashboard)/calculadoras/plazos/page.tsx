"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  calcularVencimiento,
  calcularPrescripcion,
  PRESETS_PLAZO,
  PRESETS_PRESCRIPCION,
  type VencimientoResult,
} from "@/lib/legal/plazos";

type Modo = "procesal" | "prescripcion";

function formatLargo(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PlazosPage() {
  const supabase = createClient();
  const [modo, setModo] = useState<Modo>("procesal");
  const [guardado, setGuardado] = useState(false);

  async function guardarEnAgenda(fechaISO: string, tipo: string) {
    const titulo = window.prompt("Título del vencimiento (ej: Contestar demanda — García c/ ACME):");
    if (!titulo) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("vencimientos").insert({
      user_id: user.id,
      titulo,
      fecha_vencimiento: fechaISO,
      tipo,
    });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  }

  // Procesal
  const [desde, setDesde] = useState("");
  const [dias, setDias] = useState("");
  const [presetPlazo, setPresetPlazo] = useState("");
  const [resProc, setResProc] = useState<VencimientoResult | null>(null);

  // Prescripción
  const [inicio, setInicio] = useState("");
  const [anios, setAnios] = useState("");
  const [resPresc, setResPresc] = useState<{ vencimiento: string } | null>(null);

  function calcularProcesal(e: React.FormEvent) {
    e.preventDefault();
    const n = parseInt(dias, 10);
    if (!desde || !n) return;
    setResProc(calcularVencimiento({ desde, diasHabiles: n }));
  }

  function calcularPresc(e: React.FormEvent) {
    e.preventDefault();
    const a = parseFloat(anios);
    if (!inicio || !a) return;
    setResPresc(calcularPrescripcion({ desde: inicio, anios: a }));
  }

  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="sticky top-0 z-20 flex items-center border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <Link href="/calculadoras" className="hover:text-[var(--brand-navy)]">Calculadoras</Link>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Plazos y vencimientos</span>
        </nav>
      </header>

      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
        <header className="mb-6 pb-6 border-b border-[var(--brand-navy)]">
          <div className="masthead-meta mb-2"><span>CALCULADORA V</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
            Plazos procesales y vencimientos
          </h1>
          <p className="mt-2 text-[14px] text-[var(--brand-ink-2)] max-w-[640px]">
            Cómputo en días hábiles judiciales (excluye fines de semana, feriados y feria judicial)
            y vencimientos de prescripción. CPCCN art. 156.
          </p>
        </header>

        {/* Mode toggle */}
        <div className="flex gap-1.5 mb-6">
          {(["procesal", "prescripcion"] as Modo[]).map((m) => (
            <button
              key={m}
              onClick={() => setModo(m)}
              className={`rounded border px-4 py-2 text-[12px] font-semibold transition-all ${
                modo === m
                  ? "border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white"
                  : "border-border bg-white text-[var(--brand-ink-2)] hover:border-[var(--brand-gold)]"
              }`}
            >
              {m === "procesal" ? "Plazo procesal (días hábiles)" : "Prescripción (calendario)"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
          {/* Form */}
          {modo === "procesal" ? (
            <form onSubmit={calcularProcesal} className="card-editorial p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="t-overline text-[var(--brand-navy)] block">Fecha de notificación *</label>
                <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} required
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]" />
                <p className="text-[11px] text-[var(--brand-mute)]">No se cuenta el día de la notificación (art. 156).</p>
              </div>

              <div className="space-y-1.5">
                <label className="t-overline text-[var(--brand-navy)] block">Plazo frecuente</label>
                <select
                  value={presetPlazo}
                  onChange={(e) => {
                    setPresetPlazo(e.target.value);
                    const p = PRESETS_PLAZO.find((x) => x.id === e.target.value);
                    if (p) setDias(String(p.dias));
                  }}
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none"
                >
                  <option value="">— Elegir o ingresar días manualmente —</option>
                  {PRESETS_PLAZO.map((p) => (
                    <option key={p.id} value={p.id}>{p.label} ({p.dias} días — {p.fundamento})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="t-overline text-[var(--brand-navy)] block">Días hábiles *</label>
                <input type="number" min={1} value={dias} onChange={(e) => { setDias(e.target.value); setPresetPlazo(""); }} required placeholder="5"
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]" />
              </div>

              <button type="submit" className="w-full rounded bg-[var(--brand-navy)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)]">
                Calcular vencimiento
              </button>
            </form>
          ) : (
            <form onSubmit={calcularPresc} className="card-editorial p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="t-overline text-[var(--brand-navy)] block">Fecha de inicio del cómputo *</label>
                <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} required
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]" />
              </div>

              <div className="space-y-1.5">
                <label className="t-overline text-[var(--brand-navy)] block">Plazo de prescripción</label>
                <select
                  value={anios}
                  onChange={(e) => setAnios(e.target.value)}
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none"
                >
                  <option value="">— Elegir o ingresar años —</option>
                  {PRESETS_PRESCRIPCION.map((p) => (
                    <option key={p.id} value={p.anios}>{p.label} ({p.anios} años — {p.fundamento})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="t-overline text-[var(--brand-navy)] block">Años *</label>
                <input type="number" min={1} step={1} value={anios} onChange={(e) => setAnios(e.target.value)} required placeholder="2"
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]" />
              </div>

              <button type="submit" className="w-full rounded bg-[var(--brand-navy)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)]">
                Calcular prescripción
              </button>
            </form>
          )}

          {/* Results */}
          <div className="card-editorial p-6">
            {modo === "procesal" && resProc ? (
              <div>
                <div className="masthead-meta mb-3"><span>VENCIMIENTO</span></div>
                <div className="rounded border-2 border-[var(--brand-navy)] p-4 mb-4">
                  <div className="t-overline text-[var(--brand-gold)] mb-1">Vence el</div>
                  <div className="font-[var(--font-display)] text-2xl font-semibold text-[var(--brand-navy)] capitalize">
                    {formatLargo(resProc.vencimiento)}
                  </div>
                  <div className="mt-2 text-[12px] text-[var(--brand-ink-2)]">
                    Plazo de gracia (art. 124): hasta las primeras horas hábiles del{" "}
                    <strong className="capitalize">{formatLargo(resProc.diaGracia)}</strong>.
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-[var(--brand-mute)]">
                    {resProc.diasCorridos} días corridos · {resProc.excluidos.length} días no hábiles excluidos
                  </div>
                  <button
                    onClick={() => guardarEnAgenda(resProc.vencimiento, "plazo_procesal")}
                    className="mt-3 rounded bg-[var(--brand-gold)] px-3 py-1.5 text-[12px] font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-gold)]/80"
                  >
                    + Guardar en agenda
                  </button>
                  {guardado && <span className="ml-2 text-[11px] text-emerald-700">✓ Guardado en tu agenda</span>}
                </div>

                {resProc.excluidos.length > 0 && (
                  <div className="mb-4">
                    <div className="t-overline text-[var(--brand-navy)] mb-2">Días excluidos del cómputo</div>
                    <div className="max-h-[220px] overflow-y-auto rounded border border-border divide-y divide-border">
                      {resProc.excluidos.map((d) => (
                        <div key={d.fecha} className="flex items-center justify-between px-3 py-1.5 text-[12px]">
                          <span className="font-mono text-[var(--brand-ink-2)]">{d.fecha}</span>
                          <span className="text-[11px] text-[var(--brand-mute)]">{d.motivo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Disclaimer />
              </div>
            ) : modo === "prescripcion" && resPresc ? (
              <div>
                <div className="masthead-meta mb-3"><span>PRESCRIPCIÓN</span></div>
                <div className="rounded border-2 border-[var(--brand-navy)] p-4 mb-4">
                  <div className="t-overline text-[var(--brand-gold)] mb-1">Prescribe el</div>
                  <div className="font-[var(--font-display)] text-2xl font-semibold text-[var(--brand-navy)] capitalize">
                    {formatLargo(resPresc.vencimiento)}
                  </div>
                  <button
                    onClick={() => guardarEnAgenda(resPresc.vencimiento, "prescripcion")}
                    className="mt-3 rounded bg-[var(--brand-gold)] px-3 py-1.5 text-[12px] font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-gold)]/80"
                  >
                    + Guardar en agenda
                  </button>
                  {guardado && <span className="ml-2 text-[11px] text-emerald-700">✓ Guardado</span>}
                </div>
                <Disclaimer prescripcion />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="font-[var(--font-display)] text-6xl italic text-[var(--brand-gold)] opacity-40 mb-4">V</div>
                <p className="text-[13px] text-[var(--brand-mute)]">Complete los datos y presione calcular.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Disclaimer({ prescripcion }: { prescripcion?: boolean }) {
  return (
    <div className="rounded border border-amber-500/40 bg-amber-50 px-3 py-2.5 text-[11px] text-amber-800 leading-relaxed">
      <strong>Verificá siempre el cómputo.</strong>{" "}
      {prescripcion
        ? "La prescripción puede suspenderse o interrumpirse (intimación, mediación, demanda). Confirmá la fecha de inicio y las causales aplicables."
        : "Los feriados trasladables y las ferias judiciales provinciales varían y se fijan por acordada cada año. Confirmá el calendario oficial de la jurisdicción del expediente antes de presentar."}
    </div>
  );
}
