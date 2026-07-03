"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/legal/calculadoras";

const INDICES = [
  { value: "ipc", label: "IPC Nacional (INDEC)" },
  { value: "ripte", label: "RIPTE (Secretaría de Trabajo)" },
  { value: "cer", label: "CER (BCRA)" },
  { value: "uva", label: "UVA (BCRA)" },
];

interface ApiResult {
  nombre: string;
  fuente: string;
  coeficiente: number;
  valor_desde: number;
  fecha_dato_desde: string;
  valor_hasta: number;
  fecha_dato_hasta: string;
  dato_parcial: boolean;
}

function fmtFecha(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function ActualizacionPage() {
  const [capital, setCapital] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [indice, setIndice] = useState("ipc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResult | null>(null);

  async function handleCalcular(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        `/api/indices?indice=${indice}&desde=${fechaDesde}&hasta=${fechaHasta}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo consultar la serie oficial.");
      } else {
        setResult(data as ApiResult);
      }
    } catch {
      setError("No se pudo conectar con el servicio de índices.");
    }
    setLoading(false);
  }

  const capitalNum = parseFloat(capital) || 0;

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
          <div className="masthead-meta mb-2"><span>CALCULADORA IV · DATOS OFICIALES EN VIVO</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
            Actualización por IPC / RIPTE / CER / UVA
          </h1>
          <p className="mt-2 text-[14px] text-[var(--brand-ink-2)] max-w-[640px]">
            Indexación con las series oficiales de INDEC, Secretaría de Trabajo y BCRA, consultadas en vivo
            desde datos.gob.ar. Cada coeficiente muestra el valor del índice y la fecha exacta del dato.
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
              <label className="t-overline text-[var(--brand-navy)] block">Índice de actualización *</label>
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
                <label className="t-overline text-[var(--brand-navy)] block">Desde *</label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  required
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="t-overline text-[var(--brand-navy)] block">Hasta *</label>
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
              disabled={loading}
              className="w-full rounded bg-[var(--brand-navy)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)] disabled:opacity-60"
            >
              {loading ? "Consultando serie oficial…" : "Actualizar monto"}
            </button>

            {error && (
              <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p>
            )}
          </form>

          <div className="card-editorial p-6">
            {!result ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="font-[var(--font-display)] text-6xl italic text-[var(--brand-gold)] opacity-40 mb-4">IV</div>
                <p className="text-[13px] text-[var(--brand-mute)]">
                  Complete los datos y presione actualizar. El coeficiente se calcula con la serie oficial en vivo.
                </p>
              </div>
            ) : (
              <div>
                <div className="masthead-meta mb-3"><span>RESULTADO · {result.fuente.toUpperCase()}</span></div>
                <h3 className="font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)] mb-4">
                  Capital actualizado — {result.nombre}
                </h3>

                <table className="w-full text-[13px]">
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-2.5 text-[var(--brand-ink)]">Capital original</td>
                      <td className="py-2.5 text-right font-mono text-[var(--brand-navy)] font-medium">{formatCurrency(capitalNum)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5">
                        <span className="text-[var(--brand-ink)]">Índice al inicio</span>
                        <span className="block text-[11px] text-[var(--brand-mute)]">dato del {fmtFecha(result.fecha_dato_desde)}</span>
                      </td>
                      <td className="py-2.5 text-right font-mono text-[var(--brand-navy)] font-medium">{result.valor_desde.toLocaleString("es-AR")}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5">
                        <span className="text-[var(--brand-ink)]">Índice al final</span>
                        <span className="block text-[11px] text-[var(--brand-mute)]">dato del {fmtFecha(result.fecha_dato_hasta)}</span>
                      </td>
                      <td className="py-2.5 text-right font-mono text-[var(--brand-navy)] font-medium">{result.valor_hasta.toLocaleString("es-AR")}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-[var(--brand-ink)]">Coeficiente (final / inicio)</td>
                      <td className="py-2.5 text-right font-mono text-[var(--brand-navy)] font-medium">{result.coeficiente.toFixed(4)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-[var(--brand-ink)]">Variación acumulada</td>
                      <td className="py-2.5 text-right font-mono text-[var(--brand-gold)] font-medium">+{((result.coeficiente - 1) * 100).toFixed(1)}%</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[var(--brand-navy)]">
                      <td className="py-3 font-[var(--font-display)] font-semibold text-[var(--brand-navy)] text-[15px]">CAPITAL ACTUALIZADO</td>
                      <td className="py-3 text-right font-[var(--font-display)] font-semibold text-[var(--brand-navy)] text-[17px]">
                        {formatCurrency(capitalNum * result.coeficiente)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {result.dato_parcial && (
                  <div className="mt-4 rounded border border-amber-200 bg-amber-50 px-4 py-2.5 text-[12px] text-amber-800">
                    El último dato oficial disponible es del {fmtFecha(result.fecha_dato_hasta)}, anterior a la
                    fecha solicitada. El coeficiente llega hasta ese dato.
                  </div>
                )}

                <div className="mt-6 p-4 rounded bg-[var(--brand-paper-2)] text-[11px] text-[var(--brand-mute)] leading-relaxed">
                  <strong>Fuente:</strong> {result.fuente} — serie oficial consultada en vivo. El detalle de valores
                  y fechas de cada punto hace que esta actualización sea auditable en sede judicial.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
