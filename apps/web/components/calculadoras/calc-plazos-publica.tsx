"use client";

import { useState } from "react";
import Link from "next/link";
import { calcularVencimiento, PRESETS_PLAZO, type VencimientoResult } from "@/lib/legal/plazos";

const inputCls =
  "w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]";
const fmtLargo = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** Calculadora pública de plazos procesales en días hábiles judiciales. */
export function CalcPlazosPublica() {
  const [desde, setDesde] = useState("");
  const [dias, setDias] = useState("");
  const [preset, setPreset] = useState("");
  const [jurisdiccion, setJurisdiccion] = useState<"nacional" | "pba">("nacional");
  const [r, setR] = useState<VencimientoResult | null>(null);

  function calcular(e: React.FormEvent) {
    e.preventDefault();
    const n = parseInt(dias, 10);
    if (!desde || !n) return;
    setR(calcularVencimiento({ desde, diasHabiles: n, jurisdiccion }));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
      <form onSubmit={calcular} className="card-editorial p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="t-overline text-[var(--brand-navy)] block">Fecha de notificación *</label>
          <input type="date" required value={desde} onChange={(e) => setDesde(e.target.value)} className={inputCls} />
          <p className="text-[11px] text-[var(--brand-mute)]">No se cuenta el día de la notificación (art. 156 CPCCN).</p>
        </div>
        <div className="space-y-1.5">
          <label className="t-overline text-[var(--brand-navy)] block">Plazo frecuente</label>
          <select value={preset} onChange={(e) => { setPreset(e.target.value); const p = PRESETS_PLAZO.find((x) => x.id === e.target.value); if (p) setDias(String(p.dias)); }} className={inputCls}>
            <option value="">— Elegir o ingresar días —</option>
            {PRESETS_PLAZO.map((p) => <option key={p.id} value={p.id}>{p.label} ({p.dias} días — {p.fundamento})</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="t-overline text-[var(--brand-navy)] block">Jurisdicción (plazo de gracia)</label>
          <select value={jurisdiccion} onChange={(e) => setJurisdiccion(e.target.value as "nacional" | "pba")} className={inputCls}>
            <option value="nacional">Nacional / CABA — 2 primeras horas (art. 124 CPCCN)</option>
            <option value="pba">Provincia de Buenos Aires — 4 primeras horas (art. 124 CPCC PBA)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="t-overline text-[var(--brand-navy)] block">Días hábiles *</label>
          <input type="number" min={1} required value={dias} onChange={(e) => { setDias(e.target.value); setPreset(""); }} placeholder="5" className={inputCls} />
        </div>
        <button type="submit" className="w-full rounded bg-[var(--brand-navy)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)]">
          Calcular vencimiento
        </button>
      </form>

      <div className="card-editorial p-6">
        {!r ? (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 font-[var(--font-display)] text-6xl italic text-[var(--brand-gold)] opacity-40">§</div>
            <p className="text-[13px] text-[var(--brand-mute)]">
              Se excluyen fines de semana, feriados nacionales (incluidos los trasladables 2026) y la feria judicial de enero y de invierno (Acordada CSJN 11/2026).
            </p>
          </div>
        ) : (
          <div>
            <div className="rounded border-2 border-[var(--brand-navy)] p-4">
              <div className="t-overline text-[var(--brand-gold)] mb-1">Vence el</div>
              <div className="font-[var(--font-display)] text-2xl font-semibold capitalize text-[var(--brand-navy)]">{fmtLargo(r.vencimiento)}</div>
              <div className="mt-2 text-[12px] text-[var(--brand-ink-2)]">
                Plazo de gracia: hasta las <strong>{r.horasGracia} primeras horas</strong> hábiles del <strong className="capitalize">{fmtLargo(r.diaGracia)}</strong>.
              </div>
              <div className="mt-1 font-mono text-[11px] text-[var(--brand-mute)]">{r.diasCorridos} días corridos · {r.excluidos.length} días no hábiles excluidos</div>
              {r.advertencias.map((a) => <div key={a} className="mt-2 rounded border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-900">{a}</div>)}
            </div>
            {r.excluidos.length > 0 && (
              <div className="mt-4">
                <div className="t-overline text-[var(--brand-navy)] mb-2">Días excluidos del cómputo</div>
                <div className="max-h-[220px] divide-y divide-border overflow-y-auto rounded border border-border">
                  {r.excluidos.map((d) => (
                    <div key={d.fecha} className="flex items-center justify-between px-3 py-1.5 text-[12px]">
                      <span className="font-mono text-[var(--brand-ink-2)]">{d.fecha.split("-").reverse().join("/")}</span>
                      <span className="text-[var(--brand-mute)]">{d.motivo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-4">
              <Link href="/register" className="rounded bg-[var(--brand-gold)] px-4 py-2.5 text-[13px] font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-gold)]/80">
                Agendarlo con alerta por email — gratis →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
