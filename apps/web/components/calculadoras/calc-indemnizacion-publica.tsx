"use client";

import { useState } from "react";
import Link from "next/link";
import {
  calcularIndemnizacionArt245,
  generarAnexoLiquidacion,
  formatCurrency,
  type IndemnizacionResult,
} from "@/lib/legal/calculadoras";
import { regimenPorFecha, etiquetaRegimen } from "@/lib/legal/regimen";

/**
 * Calculadora pública de indemnización por despido (art. 245 LCT).
 * Landing de adquisición: sin login, con CTA a registro para generar la demanda.
 */
export function CalcIndemnizacionPublica() {
  const [mejorRemuneracion, setMejorRemuneracion] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [fechaDespido, setFechaDespido] = useState("");
  const [ley25323art2, setLey25323art2] = useState(false);
  const [enPrueba, setEnPrueba] = useState(false);
  const [result, setResult] = useState<IndemnizacionResult | null>(null);
  const [copiado, setCopiado] = useState(false);
  const regimen = regimenPorFecha(fechaDespido);

  function handleCalcular(e: React.FormEvent) {
    e.preventDefault();
    setResult(
      calcularIndemnizacionArt245({
        mejor_remuneracion: parseFloat(mejorRemuneracion),
        fecha_ingreso: fechaIngreso,
        fecha_despido: fechaDespido,
        ley_25323_art2: ley25323art2,
        en_periodo_prueba: enPrueba,
      }),
    );
  }

  async function copiarAnexo() {
    if (!result) return;
    await navigator.clipboard.writeText(
      generarAnexoLiquidacion(result, {
        mejor_remuneracion: parseFloat(mejorRemuneracion),
        fecha_ingreso: fechaIngreso,
        fecha_despido: fechaDespido,
      }),
    );
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  const inputCls =
    "w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
      <form onSubmit={handleCalcular} className="card-editorial p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="t-overline text-[var(--brand-navy)] block">Mejor remuneración mensual (bruta) *</label>
          <input type="number" value={mejorRemuneracion} onChange={(e) => setMejorRemuneracion(e.target.value)} required min={1} placeholder="850000" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="t-overline text-[var(--brand-navy)] block">Fecha ingreso *</label>
            <input type="date" value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} required className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="t-overline text-[var(--brand-navy)] block">Fecha despido *</label>
            <input type="date" value={fechaDespido} onChange={(e) => setFechaDespido(e.target.value)} required className={inputCls} />
          </div>
        </div>
        <div className="space-y-2.5 rounded border border-border p-3.5">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={ley25323art2} onChange={(e) => setLey25323art2(e.target.checked)} className="h-4 w-4" />
            <span className="text-[13px] text-[var(--brand-ink-2)]">Hubo intimación y no pagaron (Ley 25.323 art. 2, +50%)</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={enPrueba} onChange={(e) => setEnPrueba(e.target.checked)} className="h-4 w-4" />
            <span className="text-[13px] text-[var(--brand-ink-2)]">Estaba en período de prueba ({regimen.periodo_prueba_meses} meses)</span>
          </label>
        </div>
        {fechaDespido && (
          <p className="rounded border border-[var(--brand-navy)]/20 bg-[var(--brand-navy)]/5 px-3 py-2 text-[12px] text-[var(--brand-ink-2)]">
            <strong className="text-[var(--brand-navy)]">Régimen según la fecha: {etiquetaRegimen(regimen)}.</strong>{" "}
            {regimen.multa_art_80
              ? "Las multas de las leyes 24.013, 25.323 (art. 1) y 25.345 estaban vigentes; consultá con un abogado para incluirlas."
              : "Las multas por falta de registración y por certificados (leyes 24.013, 25.323 art. 1 y art. 80 LCT) fueron derogadas por la ley 27.742 y no se incluyen."}
          </p>
        )}
        <button type="submit" className="w-full rounded bg-[var(--brand-navy)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)]">
          Calcular indemnización
        </button>
      </form>

      <div className="card-editorial p-6">
        {!result ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="font-[var(--font-display)] text-6xl italic text-[var(--brand-gold)] opacity-40 mb-4">§</div>
            <p className="text-[13px] text-[var(--brand-mute)]">
              Completá los datos para ver la liquidación completa rubro por rubro, con la norma y la fórmula de cada uno.
            </p>
          </div>
        ) : (
          <div>
            <h3 className="font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)] mb-1">
              Liquidación estimada
            </h3>
            <p className="mb-4 text-[11px] text-[var(--brand-mute)]">Régimen aplicado: {etiquetaRegimen(result.regimen)}</p>
            {result.advertencias.length > 0 && (
              <ul className="mb-3 space-y-1 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
                {result.advertencias.map((a) => <li key={a}>• {a}</li>)}
              </ul>
            )}
            <table className="w-full text-[13px]">
              <tbody className="divide-y divide-border">
                {result.rubros.map((r) => (
                  <tr key={r.label}>
                    <td className="py-2.5">
                      <span className="text-[var(--brand-ink)]">{r.label}</span>
                      {r.detalle && <span className="block text-[11px] text-[var(--brand-mute)]">{r.detalle}</span>}
                    </td>
                    <td className="py-2.5 text-right font-mono font-medium text-[var(--brand-navy)]">{formatCurrency(r.monto)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--brand-navy)]">
                  <td className="py-3 font-semibold text-[var(--brand-navy)] text-[15px]">TOTAL</td>
                  <td className="py-3 text-right font-semibold text-[var(--brand-navy)] text-[17px]">{formatCurrency(result.total)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-4">
              <button onClick={copiarAnexo} className="rounded border border-[var(--brand-navy)] px-4 py-2.5 text-[13px] font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-navy)]/5">
                {copiado ? "✓ Copiado" : "Copiar liquidación detallada"}
              </button>
              <Link href="/register" className="rounded bg-[var(--brand-gold)] px-4 py-2.5 text-[13px] font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-gold)]/80">
                Generar la demanda con estos datos — gratis →
              </Link>
            </div>
            <p className="mt-3 text-[11px] leading-snug text-[var(--brand-mute)]">
              Cálculo orientativo a valores nominales, sin intereses ni tope CCT. Creando una cuenta gratis podés aplicar
              tope convencional, doctrina Vizzoti, intereses y generar la demanda laboral completa con citas verificadas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
