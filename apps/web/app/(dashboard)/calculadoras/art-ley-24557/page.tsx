"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/legal/calculadoras";

interface ARTResult {
  tipo: string;
  porcentaje_incapacidad: number;
  ingreso_base: number;
  indemnizacion: number;
  piso_minimo: number;
  aplica_piso: boolean;
  adicional_gran_invalidez?: number;
  total: number;
}

function calcularART(params: {
  ingreso_base_mensual: number;
  porcentaje_incapacidad: number;
  edad: number;
  tipo: "ilp" | "ilt" | "gran_invalidez" | "muerte";
  dias_ilt?: number;
}): ARTResult {
  const { ingreso_base_mensual, porcentaje_incapacidad, edad, tipo, dias_ilt } = params;
  const ibm = ingreso_base_mensual;
  const coef_edad = 65 / edad;

  let indemnizacion = 0;
  let piso_minimo = 0;
  const aplica_piso = false;
  let adicional_gran_invalidez: number | undefined;

  switch (tipo) {
    case "ilt":
      indemnizacion = (ibm / 30) * (dias_ilt ?? 0);
      break;
    case "ilp":
      if (porcentaje_incapacidad <= 50) {
        indemnizacion = 53 * ibm * (porcentaje_incapacidad / 100) * coef_edad;
      } else {
        indemnizacion = 53 * ibm * (porcentaje_incapacidad / 100) * coef_edad;
      }
      piso_minimo = ibm * 3 * (porcentaje_incapacidad / 100);
      break;
    case "gran_invalidez":
      indemnizacion = 53 * ibm * coef_edad;
      adicional_gran_invalidez = ibm * 3;
      piso_minimo = ibm * 5;
      break;
    case "muerte":
      indemnizacion = 53 * ibm * coef_edad;
      piso_minimo = ibm * 5;
      break;
  }

  const base = Math.max(indemnizacion, piso_minimo);
  const total = base + (adicional_gran_invalidez ?? 0);

  return {
    tipo,
    porcentaje_incapacidad,
    ingreso_base: ibm,
    indemnizacion,
    piso_minimo,
    aplica_piso: piso_minimo > indemnizacion,
    adicional_gran_invalidez,
    total,
  };
}

const TIPOS = [
  { value: "ilp", label: "Incapacidad Laboral Permanente (ILP)" },
  { value: "ilt", label: "Incapacidad Laboral Temporaria (ILT)" },
  { value: "gran_invalidez", label: "Gran Invalidez" },
  { value: "muerte", label: "Fallecimiento" },
] as const;

export default function ArtLey24557Page() {
  const [ingresoBase, setIngresoBase] = useState("");
  const [porcentaje, setPorcentaje] = useState("");
  const [edad, setEdad] = useState("");
  const [tipo, setTipo] = useState<"ilp" | "ilt" | "gran_invalidez" | "muerte">("ilp");
  const [diasIlt, setDiasIlt] = useState("");
  const [result, setResult] = useState<ARTResult | null>(null);

  function handleCalcular(e: React.FormEvent) {
    e.preventDefault();
    const r = calcularART({
      ingreso_base_mensual: parseFloat(ingresoBase),
      porcentaje_incapacidad: parseFloat(porcentaje || "0"),
      edad: parseInt(edad),
      tipo,
      dias_ilt: diasIlt ? parseInt(diasIlt) : undefined,
    });
    setResult(r);
  }

  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="sticky top-0 z-20 flex items-center border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <Link href="/calculadoras" className="hover:text-[var(--brand-navy)]">Calculadoras</Link>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Ley 24.557</span>
        </nav>
      </header>

      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
        <header className="mb-8 pb-6 border-b border-[var(--brand-navy)]">
          <div className="masthead-meta mb-2"><span>CALCULADORA II</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
            Accidente laboral — Ley 24.557
          </h1>
          <p className="mt-2 text-[14px] text-[var(--brand-ink-2)] max-w-[600px]">
            Calculo de prestaciones dinerarias por incapacidad laboral (ILP, ILT, gran invalidez, muerte) segun Ley de Riesgos del Trabajo.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
          <form onSubmit={handleCalcular} className="card-editorial p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="t-overline text-[var(--brand-navy)] block">Tipo de prestacion *</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as typeof tipo)}
                className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="t-overline text-[var(--brand-navy)] block">Ingreso base mensual (IBM) *</label>
              <input
                type="number"
                value={ingresoBase}
                onChange={(e) => setIngresoBase(e.target.value)}
                required
                min={1}
                placeholder="850000"
                className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="t-overline text-[var(--brand-navy)] block">Edad del trabajador *</label>
              <input
                type="number"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                required
                min={18}
                max={65}
                placeholder="35"
                className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
              />
            </div>

            {tipo === "ilp" && (
              <div className="space-y-1.5">
                <label className="t-overline text-[var(--brand-navy)] block">Porcentaje de incapacidad (%) *</label>
                <input
                  type="number"
                  value={porcentaje}
                  onChange={(e) => setPorcentaje(e.target.value)}
                  required
                  min={1}
                  max={100}
                  placeholder="25"
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
                />
              </div>
            )}

            {tipo === "ilt" && (
              <div className="space-y-1.5">
                <label className="t-overline text-[var(--brand-navy)] block">Dias de ILT *</label>
                <input
                  type="number"
                  value={diasIlt}
                  onChange={(e) => setDiasIlt(e.target.value)}
                  required
                  min={1}
                  placeholder="60"
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded bg-[var(--brand-navy)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)]"
            >
              Calcular prestacion
            </button>
          </form>

          <div className="card-editorial p-6">
            {!result ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="font-[var(--font-display)] text-6xl italic text-[var(--brand-gold)] opacity-40 mb-4">II</div>
                <p className="text-[13px] text-[var(--brand-mute)]">Complete los datos y presione calcular para ver la prestacion.</p>
              </div>
            ) : (
              <div>
                <div className="masthead-meta mb-3"><span>RESULTADO</span></div>
                <h3 className="font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)] mb-4">
                  Prestacion dineraria — {TIPOS.find(t => t.value === result.tipo)?.label}
                </h3>

                {result.aplica_piso && (
                  <div className="mb-4 rounded border border-[var(--brand-gold)]/30 bg-[var(--brand-gold)]/5 px-4 py-2.5 text-[12px] text-[var(--brand-ink-2)]">
                    <strong>Piso minimo aplicado.</strong> La formula arroja un valor menor al piso establecido por la ley.
                  </div>
                )}

                <table className="w-full text-[13px]">
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-2.5 text-[var(--brand-ink)]">Ingreso Base Mensual</td>
                      <td className="py-2.5 text-right font-mono text-[var(--brand-navy)] font-medium">{formatCurrency(result.ingreso_base)}</td>
                    </tr>
                    {result.tipo !== "ilt" && (
                      <tr>
                        <td className="py-2.5 text-[var(--brand-ink)]">Incapacidad</td>
                        <td className="py-2.5 text-right font-mono text-[var(--brand-navy)] font-medium">{result.porcentaje_incapacidad}%</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-2.5 text-[var(--brand-ink)]">Indemnizacion (formula)</td>
                      <td className="py-2.5 text-right font-mono text-[var(--brand-navy)] font-medium">{formatCurrency(result.indemnizacion)}</td>
                    </tr>
                    {result.tipo !== "ilt" && (
                      <tr>
                        <td className="py-2.5 text-[var(--brand-ink)]">Piso minimo legal</td>
                        <td className="py-2.5 text-right font-mono text-[var(--brand-navy)] font-medium">{formatCurrency(result.piso_minimo)}</td>
                      </tr>
                    )}
                    {result.adicional_gran_invalidez && (
                      <tr>
                        <td className="py-2.5 text-[var(--brand-ink)]">Adicional gran invalidez</td>
                        <td className="py-2.5 text-right font-mono text-[var(--brand-gold)] font-medium">{formatCurrency(result.adicional_gran_invalidez)}</td>
                      </tr>
                    )}
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

                <div className="mt-6 p-4 rounded bg-[var(--brand-paper-2)] text-[11px] text-[var(--brand-mute)] leading-relaxed">
                  <strong>Formula aplicada:</strong> 53 × IBM × (% incapacidad) × (65/edad). Pisos y adicionales segun Dec. 1694/09 y actualizaciones MTESS.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
