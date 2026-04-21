"use client";

import { useState } from "react";
import Link from "next/link";
import { calcularIntereses, formatCurrency } from "@/lib/legal/calculadoras";

const TASAS = [
  { label: "Tasa activa BNA (cartera general)", value: 97 },
  { label: "Acta CNAT 2601 (tasa activa)", value: 97 },
  { label: "Acta CNAT 2658 (tasa activa × 1.5)", value: 145.5 },
  { label: "Acta CNAT 2764 (tasa activa × 2)", value: 194 },
  { label: "Tasa pasiva BNA", value: 75 },
  { label: "Personalizada", value: 0 },
];

export default function InteresesPage() {
  const [capital, setCapital] = useState("");
  const [tasaSeleccionada, setTasaSeleccionada] = useState(TASAS[0].value);
  const [tasaCustom, setTasaCustom] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [result, setResult] = useState<{ dias: number; intereses: number; total: number; tasa_diaria: number } | null>(null);

  function handleCalcular(e: React.FormEvent) {
    e.preventDefault();
    const tasa = tasaSeleccionada === 0 ? parseFloat(tasaCustom) : tasaSeleccionada;
    const r = calcularIntereses({
      capital: parseFloat(capital),
      tasa_anual: tasa,
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
    });
    setResult(r);
  }

  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="sticky top-0 z-20 flex items-center border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <Link href="/calculadoras" className="hover:text-[var(--brand-navy)]">Calculadoras</Link>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Intereses</span>
        </nav>
      </header>

      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
        <header className="mb-8 pb-6 border-b border-[var(--brand-navy)]">
          <div className="masthead-meta mb-2"><span>CALCULADORA III</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
            Intereses — Tasa activa BNA / Actas CNAT
          </h1>
          <p className="mt-2 text-[14px] text-[var(--brand-ink-2)] max-w-[600px]">
            Calculo de intereses moratorios segun tasa activa BNA y actas de la Camara Nacional de Apelaciones del Trabajo.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
          <form onSubmit={handleCalcular} className="card-editorial p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="t-overline text-[var(--brand-navy)] block">Capital adeudado *</label>
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                required
                min={1}
                placeholder="1500000"
                className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="t-overline text-[var(--brand-navy)] block">Tasa de interes *</label>
              <select
                value={tasaSeleccionada}
                onChange={(e) => setTasaSeleccionada(Number(e.target.value))}
                className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
              >
                {TASAS.map((t) => (
                  <option key={t.label} value={t.value}>{t.label} ({t.value}% anual)</option>
                ))}
              </select>
              {tasaSeleccionada === 0 && (
                <input
                  type="number"
                  value={tasaCustom}
                  onChange={(e) => setTasaCustom(e.target.value)}
                  required
                  step="0.01"
                  placeholder="Tasa anual %"
                  className="mt-2 w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="t-overline text-[var(--brand-navy)] block">Fecha desde *</label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  required
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="t-overline text-[var(--brand-navy)] block">Fecha hasta *</label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  required
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded bg-[var(--brand-navy)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)]"
            >
              Calcular intereses
            </button>
          </form>

          <div className="card-editorial p-6">
            {!result ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="font-[var(--font-display)] text-6xl italic text-[var(--brand-gold)] opacity-40 mb-4">III</div>
                <p className="text-[13px] text-[var(--brand-mute)]">Complete los datos y presione calcular para ver el resultado.</p>
              </div>
            ) : (
              <div>
                <div className="masthead-meta mb-3"><span>RESULTADO</span></div>
                <h3 className="font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)] mb-4">
                  Liquidacion de intereses
                </h3>

                <table className="w-full text-[13px]">
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-2.5 text-[var(--brand-ink)]">Capital</td>
                      <td className="py-2.5 text-right font-mono text-[var(--brand-navy)] font-medium">{formatCurrency(parseFloat(capital))}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-[var(--brand-ink)]">Periodo</td>
                      <td className="py-2.5 text-right font-mono text-[var(--brand-navy)] font-medium">{result.dias} dias</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-[var(--brand-ink)]">Tasa diaria</td>
                      <td className="py-2.5 text-right font-mono text-[var(--brand-navy)] font-medium">{result.tasa_diaria.toFixed(4)}%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-[var(--brand-ink)]">Intereses</td>
                      <td className="py-2.5 text-right font-mono text-[var(--brand-gold)] font-medium">{formatCurrency(result.intereses)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[var(--brand-navy)]">
                      <td className="py-3 font-[var(--font-display)] font-semibold text-[var(--brand-navy)] text-[15px]">TOTAL (capital + intereses)</td>
                      <td className="py-3 text-right font-[var(--font-display)] font-semibold text-[var(--brand-navy)] text-[17px]">
                        {formatCurrency(result.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                <div className="mt-6 p-4 rounded bg-[var(--brand-paper-2)] text-[11px] text-[var(--brand-mute)] leading-relaxed">
                  <strong>Nota:</strong> Las tasas de referencia pueden variar. Verificar con el sitio oficial del BNA o la CNAT la tasa vigente al momento del calculo.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
