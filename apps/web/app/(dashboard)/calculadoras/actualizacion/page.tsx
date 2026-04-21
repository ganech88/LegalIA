"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/legal/calculadoras";

const INDICES = [
  { value: "ipc", label: "IPC (INDEC)" },
  { value: "ripte", label: "RIPTE (MTEySS)" },
  { value: "cer", label: "CER (BCRA)" },
  { value: "ucai", label: "UCA inflacion (privado)" },
];

const IPC_MENSUAL_EJEMPLO: Record<string, number> = {
  "2024-01": 20.6, "2024-02": 13.2, "2024-03": 11.0, "2024-04": 8.8,
  "2024-05": 4.2, "2024-06": 4.6, "2024-07": 4.0, "2024-08": 4.2,
  "2024-09": 3.5, "2024-10": 2.7, "2024-11": 2.4, "2024-12": 2.7,
  "2025-01": 2.2, "2025-02": 2.4, "2025-03": 3.7, "2025-04": 3.1,
};

function calcularActualizacion(params: {
  capital: number;
  fecha_desde: string;
  fecha_hasta: string;
  indice: string;
}): { capital_original: number; coeficiente: number; capital_actualizado: number; variacion_porcentual: number; meses: number } {
  const { capital, fecha_desde, fecha_hasta } = params;

  const desde = new Date(fecha_desde);
  const hasta = new Date(fecha_hasta);
  const meses = (hasta.getFullYear() - desde.getFullYear()) * 12 + (hasta.getMonth() - desde.getMonth());

  let coeficiente = 1;
  const current = new Date(desde.getFullYear(), desde.getMonth(), 1);

  for (let i = 0; i < meses; i++) {
    const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
    const tasa = IPC_MENSUAL_EJEMPLO[key] ?? 3.0;
    coeficiente *= (1 + tasa / 100);
    current.setMonth(current.getMonth() + 1);
  }

  return {
    capital_original: capital,
    coeficiente,
    capital_actualizado: capital * coeficiente,
    variacion_porcentual: (coeficiente - 1) * 100,
    meses,
  };
}

export default function ActualizacionPage() {
  const [capital, setCapital] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [indice, setIndice] = useState("ipc");
  const [result, setResult] = useState<ReturnType<typeof calcularActualizacion> | null>(null);

  function handleCalcular(e: React.FormEvent) {
    e.preventDefault();
    const r = calcularActualizacion({
      capital: parseFloat(capital),
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
      indice,
    });
    setResult(r);
  }

  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="sticky top-0 z-20 flex items-center border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <Link href="/calculadoras" className="hover:text-[var(--brand-navy)]">Calculadoras</Link>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Actualizacion</span>
        </nav>
      </header>

      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
        <header className="mb-8 pb-6 border-b border-[var(--brand-navy)]">
          <div className="masthead-meta mb-2"><span>CALCULADORA IV</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
            Actualizacion por IPC / RIPTE
          </h1>
          <p className="mt-2 text-[14px] text-[var(--brand-ink-2)] max-w-[600px]">
            Indexacion de creditos laborales utilizando indices oficiales. Util para actualizar montos de sentencia o liquidaciones diferidas.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
          <form onSubmit={handleCalcular} className="card-editorial p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="t-overline text-[var(--brand-navy)] block">Capital a actualizar *</label>
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                required
                min={1}
                placeholder="500000"
                className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="t-overline text-[var(--brand-navy)] block">Indice de actualizacion *</label>
              <select
                value={indice}
                onChange={(e) => setIndice(e.target.value)}
                className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
              >
                {INDICES.map((i) => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="t-overline text-[var(--brand-navy)] block">Periodo desde *</label>
                <input
                  type="month"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  required
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="t-overline text-[var(--brand-navy)] block">Periodo hasta *</label>
                <input
                  type="month"
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
              Actualizar monto
            </button>
          </form>

          <div className="card-editorial p-6">
            {!result ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="font-[var(--font-display)] text-6xl italic text-[var(--brand-gold)] opacity-40 mb-4">IV</div>
                <p className="text-[13px] text-[var(--brand-mute)]">Complete los datos y presione actualizar para ver el resultado.</p>
              </div>
            ) : (
              <div>
                <div className="masthead-meta mb-3"><span>RESULTADO</span></div>
                <h3 className="font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)] mb-4">
                  Capital actualizado — {INDICES.find(i => i.value === indice)?.label}
                </h3>

                <table className="w-full text-[13px]">
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-2.5 text-[var(--brand-ink)]">Capital original</td>
                      <td className="py-2.5 text-right font-mono text-[var(--brand-navy)] font-medium">{formatCurrency(result.capital_original)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-[var(--brand-ink)]">Periodo</td>
                      <td className="py-2.5 text-right font-mono text-[var(--brand-navy)] font-medium">{result.meses} meses</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-[var(--brand-ink)]">Coeficiente de actualizacion</td>
                      <td className="py-2.5 text-right font-mono text-[var(--brand-navy)] font-medium">{result.coeficiente.toFixed(4)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-[var(--brand-ink)]">Variacion acumulada</td>
                      <td className="py-2.5 text-right font-mono text-[var(--brand-gold)] font-medium">+{result.variacion_porcentual.toFixed(1)}%</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[var(--brand-navy)]">
                      <td className="py-3 font-[var(--font-display)] font-semibold text-[var(--brand-navy)] text-[15px]">CAPITAL ACTUALIZADO</td>
                      <td className="py-3 text-right font-[var(--font-display)] font-semibold text-[var(--brand-navy)] text-[17px]">
                        {formatCurrency(result.capital_actualizado)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                <div className="mt-6 p-4 rounded bg-[var(--brand-paper-2)] text-[11px] text-[var(--brand-mute)] leading-relaxed">
                  <strong>Nota:</strong> Los indices utilizados son de referencia. Para periodos sin dato oficial se aplica un estimado del 3% mensual. Verificar con fuentes oficiales (INDEC, MTEySS, BCRA) para presentaciones judiciales.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
