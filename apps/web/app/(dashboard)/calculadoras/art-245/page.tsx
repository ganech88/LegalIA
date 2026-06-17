"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { calcularIndemnizacionArt245, formatCurrency } from "@/lib/legal/calculadoras";
import type { IndemnizacionResult } from "@/lib/legal/calculadoras";

export default function Art245Page() {
  const [mejorRemuneracion, setMejorRemuneracion] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [fechaDespido, setFechaDespido] = useState("");
  const [topeCct, setTopeCct] = useState("");
  const [aplicaVizzoti, setAplicaVizzoti] = useState(false);
  const [enPeriodoPrueba, setEnPeriodoPrueba] = useState(false);
  const [ley25323art1, setLey25323art1] = useState(false);
  const [ley25323art2, setLey25323art2] = useState(false);
  const [multaArt80, setMultaArt80] = useState(false);
  const [result, setResult] = useState<IndemnizacionResult | null>(null);
  const router = useRouter();

  function generarDemanda() {
    if (!result) return;
    const rubrosTexto = result.rubros
      .map((r) => `${r.label}: ${formatCurrency(r.monto)}`)
      .join("; ");
    const prefill = {
      fecha_ingreso: fechaIngreso,
      fecha_despido: fechaDespido,
      mejor_remuneracion: mejorRemuneracion,
      monto_reclamado: String(Math.round(result.total)),
      rubros_reclamados: rubrosTexto,
    };
    try {
      sessionStorage.setItem("legalia:prefill", JSON.stringify(prefill));
    } catch { /* sessionStorage no disponible */ }
    router.push("/escritos");
  }

  function handleCalcular(e: React.FormEvent) {
    e.preventDefault();
    const r = calcularIndemnizacionArt245({
      mejor_remuneracion: parseFloat(mejorRemuneracion),
      fecha_ingreso: fechaIngreso,
      fecha_despido: fechaDespido,
      tope_cct: topeCct ? parseFloat(topeCct) : undefined,
      aplica_vizzoti: aplicaVizzoti,
      en_periodo_prueba: enPeriodoPrueba,
      ley_25323_art1: ley25323art1,
      ley_25323_art2: ley25323art2,
      multa_art_80: multaArt80,
    });
    setResult(r);
  }

  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="sticky top-0 z-20 flex items-center border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <Link href="/calculadoras" className="hover:text-[var(--brand-navy)]">Calculadoras</Link>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Art. 245 LCT</span>
        </nav>
      </header>

      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
        <header className="mb-8 pb-6 border-b border-[var(--brand-navy)]">
          <div className="masthead-meta mb-2"><span>CALCULADORA I</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
            Indemnizacion por despido — Art. 245 LCT
          </h1>
          <p className="mt-2 text-[14px] text-[var(--brand-ink-2)] max-w-[600px]">
            Calcula indemnizacion por antiguedad, preaviso, integracion mes de despido, SAC proporcional y vacaciones.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
          {/* Form */}
          <form onSubmit={handleCalcular} className="card-editorial p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="t-overline text-[var(--brand-navy)] block">Mejor remuneracion mensual *</label>
              <input
                type="number"
                value={mejorRemuneracion}
                onChange={(e) => setMejorRemuneracion(e.target.value)}
                required
                min={1}
                placeholder="850000"
                className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="t-overline text-[var(--brand-navy)] block">Fecha ingreso *</label>
                <input
                  type="date"
                  value={fechaIngreso}
                  onChange={(e) => setFechaIngreso(e.target.value)}
                  required
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="t-overline text-[var(--brand-navy)] block">Fecha despido *</label>
                <input
                  type="date"
                  value={fechaDespido}
                  onChange={(e) => setFechaDespido(e.target.value)}
                  required
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="t-overline text-[var(--brand-navy)] block">Tope CCT (promedio convenio)</label>
              <input
                type="number"
                value={topeCct}
                onChange={(e) => setTopeCct(e.target.value)}
                placeholder="Dejar vacio si no aplica"
                className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
              />
            </div>

            <div className="space-y-2.5 rounded border border-border bg-[var(--brand-paper,#faf7f0)]/40 p-3.5">
              <span className="t-overline text-[var(--brand-navy)] block mb-1">Opciones de cálculo</span>
              <Check checked={aplicaVizzoti} onChange={setAplicaVizzoti} label="Aplicar doctrina Vizzoti (67% mínimo sobre el tope)" />
              <Check checked={enPeriodoPrueba} onChange={setEnPeriodoPrueba} label="En período de prueba (preaviso 15 días)" />
              <Check checked={ley25323art1} onChange={setLey25323art1} label="Duplicación Ley 25.323 art. 1 (relación no registrada)" />
              <Check checked={ley25323art2} onChange={setLey25323art2} label="Incremento Ley 25.323 art. 2 (50% por falta de pago)" />
              <Check checked={multaArt80} onChange={setMultaArt80} label="Multa art. 80 LCT (3 remuneraciones)" />
            </div>

            <button
              type="submit"
              className="w-full rounded bg-[var(--brand-navy)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)]"
            >
              Calcular liquidacion
            </button>
          </form>

          {/* Results */}
          <div className="card-editorial p-6">
            {!result ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="font-[var(--font-display)] text-6xl italic text-[var(--brand-gold)] opacity-40 mb-4">I</div>
                <p className="text-[13px] text-[var(--brand-mute)]">Complete los datos y presione calcular para ver la liquidacion.</p>
              </div>
            ) : (
              <div>
                <div className="masthead-meta mb-3"><span>LIQUIDACION</span></div>
                <h3 className="font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)] mb-4">
                  Detalle de rubros indemnizatorios
                </h3>

                {result.tope_aplicado && (
                  <div className="mb-4 rounded border border-[var(--brand-gold)]/30 bg-[var(--brand-gold)]/5 px-4 py-2.5 text-[12px] text-[var(--brand-ink-2)]">
                    <strong>Tope aplicado.</strong> Base de calculo ajustada a {formatCurrency(result.base_calculo)}
                    {aplicaVizzoti && " (doctrina Vizzoti — 67% minimo)"}
                  </div>
                )}

                <table className="w-full text-[13px]">
                  <tbody className="divide-y divide-border">
                    {result.rubros.map((rubro) => (
                      <Row key={rubro.label} label={rubro.label} sublabel={rubro.detalle} value={rubro.monto} />
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[var(--brand-navy)]">
                      <td className="py-3 font-[var(--font-display)] font-semibold text-[var(--brand-navy)] text-[15px]">TOTAL</td>
                      <td className="py-3 text-right font-[var(--font-display)] font-semibold text-[var(--brand-navy)] text-[17px]">
                        {formatCurrency(result.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                <div className="mt-6 pt-4 border-t border-border">
                  <button
                    onClick={generarDemanda}
                    className="inline-flex items-center gap-2 rounded bg-[var(--brand-gold)] px-4 py-2.5 text-[13px] font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-gold)]/80"
                  >
                    Generar demanda con estos datos →
                  </button>
                  <p className="mt-2 text-[11px] text-[var(--brand-mute)]">
                    Lleva fechas, remuneración y liquidación al formulario de demanda laboral.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border text-[var(--brand-gold)] focus:ring-[var(--brand-gold)]"
      />
      <span className="text-[13px] text-[var(--brand-ink-2)]">{label}</span>
    </label>
  );
}

function Row({ label, sublabel, value }: { label: string; sublabel?: string; value: number }) {
  return (
    <tr>
      <td className="py-2.5">
        <span className="text-[var(--brand-ink)]">{label}</span>
        {sublabel && <span className="block text-[11px] text-[var(--brand-mute)]">{sublabel}</span>}
      </td>
      <td className="py-2.5 text-right font-mono text-[var(--brand-navy)] font-medium">
        {formatCurrency(value)}
      </td>
    </tr>
  );
}
