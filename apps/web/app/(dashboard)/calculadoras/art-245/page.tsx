"use client";

import { useState } from "react";
import Link from "next/link";
import { calcularIndemnizacionArt245, formatCurrency } from "@/lib/legal/calculadoras";
import type { IndemnizacionResult } from "@/lib/legal/calculadoras";

export default function Art245Page() {
  const [mejorRemuneracion, setMejorRemuneracion] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [fechaDespido, setFechaDespido] = useState("");
  const [topeCct, setTopeCct] = useState("");
  const [aplicaVizzoti, setAplicaVizzoti] = useState(false);
  const [result, setResult] = useState<IndemnizacionResult | null>(null);

  function handleCalcular(e: React.FormEvent) {
    e.preventDefault();
    const r = calcularIndemnizacionArt245({
      mejor_remuneracion: parseFloat(mejorRemuneracion),
      fecha_ingreso: fechaIngreso,
      fecha_despido: fechaDespido,
      tope_cct: topeCct ? parseFloat(topeCct) : undefined,
      aplica_vizzoti: aplicaVizzoti,
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

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={aplicaVizzoti}
                onChange={(e) => setAplicaVizzoti(e.target.checked)}
                className="h-4 w-4 rounded border-border text-[var(--brand-gold)] focus:ring-[var(--brand-gold)]"
              />
              <span className="text-[13px] text-[var(--brand-ink-2)]">Aplicar doctrina Vizzoti (67% minimo)</span>
            </label>

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
                    <Row label="Antiguedad" sublabel={`${result.antiguedad_anios} año${result.antiguedad_anios > 1 ? "s" : ""} × ${formatCurrency(result.base_calculo)}`} value={result.indemnizacion_antiguedad} />
                    <Row label="Preaviso" sublabel={`${result.preaviso_meses} mes${result.preaviso_meses > 1 ? "es" : ""}`} value={result.preaviso} />
                    <Row label="Integracion mes despido" sublabel={`${result.integracion_dias} dias`} value={result.integracion} />
                    <Row label="SAC s/preaviso e integracion" value={result.sac_preaviso} />
                    <Row label="Vacaciones proporcionales" value={result.vacaciones_proporcionales} />
                    <Row label="SAC proporcional" value={result.sac_proporcional} />
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
                  <Link
                    href="/escritos"
                    className="inline-flex items-center gap-2 rounded bg-[var(--brand-gold)] px-4 py-2.5 text-[13px] font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-gold)]/80"
                  >
                    Generar demanda con estos datos →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
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
