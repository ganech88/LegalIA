"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/legal/calculadoras";
import { calcularART, pisosVigentes, type ARTResult, type TipoPrestacion } from "@/lib/legal/art";

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
  const [tipo, setTipo] = useState<TipoPrestacion>("ilp");
  const [diasIlt, setDiasIlt] = useState("");
  const [fechaPmi, setFechaPmi] = useState("");
  const [noInItinere, setNoInItinere] = useState(true);
  const [result, setResult] = useState<ARTResult | null>(null);
  const pisos = pisosVigentes(fechaPmi || undefined);

  function handleCalcular(e: React.FormEvent) {
    e.preventDefault();
    const r = calcularART({
      ingreso_base_mensual: parseFloat(ingresoBase),
      porcentaje_incapacidad: parseFloat(porcentaje || "0"),
      edad: parseInt(edad),
      tipo,
      dias_ilt: diasIlt ? parseInt(diasIlt) : undefined,
      aplica_20_por_ciento: noInItinere,
      fecha_pmi: fechaPmi || undefined,
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
            Prestaciones dinerarias de la LRT (leyes 24.557, 26.773 y 27.348) con los pisos y compensaciones
            de la SRT vigentes a la fecha del siniestro: {pisos.fuente}.
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
                min={14}
                max={99}
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

            {tipo !== "ilt" && (
              <>
                <div className="space-y-1.5">
                  <label className="t-overline text-[var(--brand-navy)] block">Fecha de la primera manifestación invalidante</label>
                  <input
                    type="date"
                    value={fechaPmi}
                    onChange={(e) => setFechaPmi(e.target.value)}
                    className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
                  />
                  <p className="text-[11px] text-[var(--brand-mute)]">Define qué resolución de la SRT aplica: {pisos.fuente} ({pisos.vigencia_desde.split("-").reverse().join("/")} – {pisos.vigencia_hasta.split("-").reverse().join("/")}).</p>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={noInItinere} onChange={(e) => setNoInItinere(e.target.checked)} className="h-4 w-4 rounded border-border" />
                  <span className="text-[13px] text-[var(--brand-ink-2)]">El daño NO fue in itinere (+20 %, art. 3 ley 26.773)</span>
                </label>
              </>
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
                    <strong>Piso mínimo aplicado.</strong> La fórmula ({formatCurrency(result.formula)}) arroja un valor menor al piso de {result.pisos.fuente} ({formatCurrency(result.piso)}).
                  </div>
                )}

                <table className="w-full text-[13px]">
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-2.5 text-[var(--brand-ink)]">Ingreso base mensual (art. 12 LRT)</td>
                      <td className="py-2.5 text-right font-mono text-[var(--brand-navy)] font-medium">{formatCurrency(result.ingreso_base)}</td>
                    </tr>
                    {result.tipo !== "ilt" && (
                      <tr>
                        <td className="py-2.5 text-[var(--brand-ink)]">Incapacidad · coeficiente de edad</td>
                        <td className="py-2.5 text-right font-mono text-[var(--brand-navy)] font-medium">{result.porcentaje_incapacidad || (result.tipo === "muerte" ? "—" : "100")}% · {result.coef_edad.toFixed(3)}</td>
                      </tr>
                    )}
                    {result.rubros.map((r) => (
                      <tr key={r.label + r.norma}>
                        <td className="py-2.5">
                          <span className="text-[var(--brand-ink)]">{r.label}</span>
                          <span className="block text-[11px] text-[var(--brand-mute)]">{r.norma} — {r.detalle}</span>
                        </td>
                        <td className="py-2.5 text-right font-mono text-[var(--brand-navy)] font-medium align-top">{formatCurrency(r.monto)}</td>
                      </tr>
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

                <div className="mt-6 space-y-1.5 p-4 rounded bg-[var(--brand-paper-2)] text-[11px] text-[var(--brand-mute)] leading-relaxed">
                  <p><strong>Fórmula:</strong> 53 × IBM × (% incapacidad) × (65/edad) para incapacidades parciales (art. 14.2); 53 × IBM × (65/edad) sin porcentaje para incapacidad total ≥ 66 %, gran invalidez y muerte (arts. 15.2, 17 y 18). Pisos y compensaciones adicionales de pago único: {result.pisos.fuente}.</p>
                  {result.advertencias.map((a) => <p key={a}>• {a}</p>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
