"use client";

import { useState } from "react";
import Link from "next/link";
import { calcularIntereses, formatCurrency } from "@/lib/legal/calculadoras";

/**
 * Referencias HONESTAS: la tasa activa BNA no tiene API pública y cambia cada
 * mes; los valores son un punto de partida editable. Las actas de la CNAT se
 * citan con lo que realmente dispusieron:
 * - Acta 2601 (21/05/2014): tasa activa BNA para préstamos personales libre destino.
 * - Acta 2630 (27/04/2016) y 2658 (08/11/2017): tasa activa efectiva anual vencida,
 *   cartera general, del BNA.
 * - Acta 2764 (07/09/2022): capitalización anual — descalificada por la CSJN en
 *   "Oliva c/ Coma" (29/02/2024); no la ofrecemos.
 * - Ley 27.802 (2026): créditos laborales nuevos se actualizan por IPC + 3% anual
 *   (usá la calculadora de Actualización, modo "Ley 27.802").
 */
const TASAS = [
  { label: "Tasa activa BNA cartera general — Actas CNAT 2630/2658 (referencia, editable)", value: 40 },
  { label: "Tasa activa BNA préstamos personales — Acta CNAT 2601 (referencia, editable)", value: 60 },
  { label: "Tasa pasiva BCRA/BNA — art. 55 ley 27.802 (juicios en trámite) y doctrina SCBA (referencia, editable)", value: 30 },
  { label: "Tasa pura 3% anual (sobre capital ya actualizado por IPC — art. 276 LCT)", value: 3 },
  { label: "Personalizada", value: 0 },
];

export default function InteresesPage() {
  const [capital, setCapital] = useState("");
  const [tasaSeleccionada, setTasaSeleccionada] = useState(TASAS[0].value);
  const [tasaCustom, setTasaCustom] = useState(String(TASAS[0].value));
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [result, setResult] = useState<{ dias: number; intereses: number; total: number; tasa_diaria: number } | null>(null);

  function handleSelectTasa(value: number) {
    setTasaSeleccionada(value);
    // La tasa de referencia precarga el campo, pero SIEMPRE es editable:
    // el abogado debe poder cargar la tasa vigente exacta del período.
    if (value !== 0) setTasaCustom(String(value));
    else setTasaCustom("");
  }

  function handleCalcular(e: React.FormEvent) {
    e.preventDefault();
    const r = calcularIntereses({
      capital: parseFloat(capital),
      tasa_anual: parseFloat(tasaCustom),
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
                onChange={(e) => handleSelectTasa(Number(e.target.value))}
                className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
              >
                {TASAS.map((t) => (
                  <option key={t.label} value={t.value}>
                    {t.label}{t.value > 0 ? ` (ref. ${t.value}% anual)` : ""}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={tasaCustom}
                onChange={(e) => setTasaCustom(e.target.value)}
                required
                step="0.01"
                placeholder="Tasa anual % (editable)"
                className="mt-2 w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
              />
              <p className="text-[11px] text-[var(--brand-mute)]">
                Los valores del listado son de <strong>referencia</strong> y seguramente estén desactualizados: la tasa
                activa BNA no tiene API pública. Editá el campo con la tasa vigente exacta (bna.com.ar / actas CNAT)
                antes de usar el cálculo en una liquidación. Para créditos laborales posteriores al 06/03/2026
                (ley 27.802, art. 276 LCT) la regla es IPC + 3% anual: usá la calculadora de{" "}
                <Link href="/calculadoras/actualizacion" className="underline">Actualización</Link>.
              </p>
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
                  <strong>Nota:</strong> Interés simple sobre 365 días. Verificar con el sitio oficial del BNA o la CNAT la tasa vigente al momento del cálculo.
                  La capitalización del Acta CNAT 2764 fue descalificada por la CSJN en &ldquo;Oliva c/ Coma&rdquo; (29/02/2024); para juicios laborales en trámite rige el art. 55 de la ley 27.802 (tasa pasiva con techo IPC+3% y piso 67%), con impugnaciones de constitucionalidad en curso.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
