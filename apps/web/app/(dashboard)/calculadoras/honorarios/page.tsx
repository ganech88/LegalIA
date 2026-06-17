"use client";

import { useState } from "react";
import Link from "next/link";
import {
  calcularHonorarios,
  calcularTasaJusticia,
  calcularCuotaAlimentaria,
  VALOR_UMA_DEFAULT,
  RANGOS_CUOTA,
} from "@/lib/legal/honorarios";
import { formatCurrency } from "@/lib/legal/calculadoras";

type Tab = "honorarios" | "tasa" | "cuota";

export default function HonorariosPage() {
  const [tab, setTab] = useState<Tab>("honorarios");

  // Honorarios
  const [base, setBase] = useState("");
  const [porc, setPorc] = useState("16");
  const [etapas, setEtapas] = useState("3");
  const [uma, setUma] = useState(String(VALOR_UMA_DEFAULT));
  const honor = base ? calcularHonorarios({
    baseRegulatoria: parseFloat(base) || 0,
    porcentaje: parseFloat(porc) || 0,
    etapasCumplidas: parseInt(etapas, 10) || 0,
    valorUMA: parseFloat(uma) || VALOR_UMA_DEFAULT,
  }) : null;

  // Tasa
  const [montoTasa, setMontoTasa] = useState("");
  const [alicuota, setAlicuota] = useState("3");
  const tasa = montoTasa ? calcularTasaJusticia({ monto: parseFloat(montoTasa) || 0, alicuota: parseFloat(alicuota) || 3 }) : null;

  // Cuota
  const [ingreso, setIngreso] = useState("");
  const [porcCuota, setPorcCuota] = useState("20");
  const cuota = ingreso ? calcularCuotaAlimentaria({ ingresoNeto: parseFloat(ingreso) || 0, porcentaje: parseFloat(porcCuota) || 0 }) : null;

  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="sticky top-0 z-20 flex items-center border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <Link href="/calculadoras" className="hover:text-[var(--brand-navy)]">Calculadoras</Link>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Honorarios y tasas</span>
        </nav>
      </header>

      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8 max-w-[900px]">
        <header className="mb-6 pb-6 border-b border-[var(--brand-navy)]">
          <div className="masthead-meta mb-2"><span>CALCULADORA VI</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
            Honorarios, tasa de justicia y alimentos
          </h1>
        </header>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {([["honorarios", "Honorarios (Ley 27.423)"], ["tasa", "Tasa de justicia"], ["cuota", "Cuota alimentaria"]] as [Tab, string][]).map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`rounded border px-3.5 py-2 text-[12px] font-semibold transition-all ${tab === v ? "border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white" : "border-border bg-white text-[var(--brand-ink-2)] hover:border-[var(--brand-gold)]"}`}>
              {l}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tab === "honorarios" && (
            <>
              <div className="card-editorial p-6 space-y-4">
                <Field label="Base regulatoria (monto del proceso) *" value={base} onChange={setBase} placeholder="1000000" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Porcentaje de regulación (%)" value={porc} onChange={setPorc} hint="1ª inst. conocimiento: 11–20%" />
                  <div className="space-y-1.5">
                    <label className="t-overline text-[var(--brand-navy)] block">Etapas cumplidas (de 3)</label>
                    <select value={etapas} onChange={(e) => setEtapas(e.target.value)} className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px]">
                      <option value="1">1 de 3</option><option value="2">2 de 3</option><option value="3">3 de 3 (completo)</option>
                    </select>
                  </div>
                </div>
                <Field label="Valor UMA (ARS)" value={uma} onChange={setUma} hint="Actualizar según última acordada CSJN" />
              </div>
              <ResultCard>
                {honor ? (
                  <>
                    <Big label="Honorario estimado" value={formatCurrency(honor.honorario)} />
                    <Line k="Honorario pleno (3 etapas)" v={formatCurrency(honor.honorarioPleno)} />
                    <Line k="Por etapa" v={formatCurrency(honor.honorarioPorEtapa)} />
                    <Line k="Equivalente en UMA" v={`${honor.enUMA.toFixed(2)} UMA`} />
                    <Disc>Estimación según base × porcentaje × etapas. La regulación efectiva la fija el juez (Ley 27.423). Verificá el valor de la UMA vigente.</Disc>
                  </>
                ) : <Empty />}
              </ResultCard>
            </>
          )}

          {tab === "tasa" && (
            <>
              <div className="card-editorial p-6 space-y-4">
                <Field label="Monto del juicio *" value={montoTasa} onChange={setMontoTasa} placeholder="1000000" />
                <Field label="Alícuota (%)" value={alicuota} onChange={setAlicuota} hint="Nacional: 3% (Ley 23.898). Provincias varían." />
              </div>
              <ResultCard>
                {tasa ? (
                  <>
                    <Big label="Tasa de justicia" value={formatCurrency(tasa.tasa)} />
                    <Line k="Alícuota aplicada" v={`${tasa.alicuota}%`} />
                    <Disc>Algunos procesos tienen alícuota reducida o exención. Verificá la ley de la jurisdicción.</Disc>
                  </>
                ) : <Empty />}
              </ResultCard>
            </>
          )}

          {tab === "cuota" && (
            <>
              <div className="card-editorial p-6 space-y-4">
                <Field label="Ingreso neto mensual del alimentante *" value={ingreso} onChange={setIngreso} placeholder="500000" />
                <Field label="Porcentaje (%)" value={porcCuota} onChange={setPorcCuota} hint="Orientativo según cantidad de hijos" />
                <div className="rounded border border-border bg-[var(--brand-paper)] p-3 text-[11px] text-[var(--brand-ink-2)]">
                  Rangos orientativos: {RANGOS_CUOTA.map((r) => `${r.hijos} hijo${r.hijos > 1 ? "s" : ""}: ${r.rango}`).join(" · ")}
                </div>
              </div>
              <ResultCard>
                {cuota ? (
                  <>
                    <Big label="Cuota alimentaria (orientativa)" value={formatCurrency(cuota.cuota)} />
                    <Disc>No existe fórmula legal: la cuota la fija el juez según las necesidades del alimentado y la capacidad del alimentante (art. 658 CCCN). Valor meramente indicativo.</Disc>
                  </>
                ) : <Empty />}
              </ResultCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, hint }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="t-overline text-[var(--brand-navy)] block">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]" />
      {hint && <p className="text-[11px] text-[var(--brand-mute)]">{hint}</p>}
    </div>
  );
}
function ResultCard({ children }: { children: React.ReactNode }) {
  return <div className="card-editorial p-6">{children}</div>;
}
function Big({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border-2 border-[var(--brand-navy)] p-4 mb-4">
      <div className="t-overline text-[var(--brand-gold)] mb-1">{label}</div>
      <div className="font-[var(--font-display)] text-3xl font-semibold text-[var(--brand-navy)]">{value}</div>
    </div>
  );
}
function Line({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between border-b border-border py-2 text-[13px]"><span className="text-[var(--brand-ink-2)]">{k}</span><span className="font-mono font-medium text-[var(--brand-navy)]">{v}</span></div>;
}
function Disc({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 rounded border border-amber-500/40 bg-amber-50 px-3 py-2.5 text-[11px] text-amber-800 leading-relaxed">{children}</div>;
}
function Empty() {
  return <div className="flex flex-col items-center justify-center h-full text-center py-12"><div className="font-[var(--font-display)] text-6xl italic text-[var(--brand-gold)] opacity-40 mb-4">§</div><p className="text-[13px] text-[var(--brand-mute)]">Completá los datos para ver el resultado.</p></div>;
}
