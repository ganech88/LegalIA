"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, calcularActualizacion27802 } from "@/lib/legal/calculadoras";

interface ApiResult {
  coeficiente: number;
  valor_desde: number;
  fecha_dato_desde: string;
  valor_hasta: number;
  fecha_dato_hasta: string;
  dato_parcial: boolean;
  fuente: string;
}

const fmtFecha = (iso: string) => iso.split("-").reverse().join("/");
const inputCls =
  "w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]";

/**
 * Calculadora pública: actualización de créditos laborales según la ley 27.802
 * (art. 276 LCT: IPC + 3 % anual) y banda del art. 55 para juicios en trámite.
 * Consume el IPC oficial (INDEC vía datos.gob.ar) a través de /api/indices.
 */
export function CalcActualizacionPublica() {
  const [capital, setCapital] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [api, setApi] = useState<ApiResult | null>(null);

  async function calcular(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setApi(null);
    try {
      const res = await fetch(`/api/indices?indice=ipc&desde=${desde}&hasta=${hasta}`);
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "No se pudo consultar el IPC oficial.");
      else setApi(data as ApiResult);
    } catch {
      setError("No se pudo conectar con el servicio de índices.");
    }
    setLoading(false);
  }

  const cap = parseFloat(capital) || 0;
  const r = api ? calcularActualizacion27802({ capital: cap, coeficiente_ipc: api.coeficiente, fecha_desde: desde, fecha_hasta: hasta }) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
      <form onSubmit={calcular} className="card-editorial p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="t-overline text-[var(--brand-navy)] block">Capital a actualizar *</label>
          <input type="number" min={1} required value={capital} onChange={(e) => setCapital(e.target.value)} placeholder="5000000" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="t-overline text-[var(--brand-navy)] block">Desde (fecha en que se debió) *</label>
            <input type="date" required value={desde} onChange={(e) => setDesde(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="t-overline text-[var(--brand-navy)] block">Hasta *</label>
            <input type="date" required value={hasta} onChange={(e) => setHasta(e.target.value)} className={inputCls} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full rounded bg-[var(--brand-navy)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)] disabled:opacity-60">
          {loading ? "Consultando el IPC oficial…" : "Actualizar por IPC + 3 %"}
        </button>
        {error && <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p>}
      </form>

      <div className="card-editorial p-6">
        {!r || !api ? (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 font-[var(--font-display)] text-6xl italic text-[var(--brand-gold)] opacity-40">§</div>
            <p className="text-[13px] text-[var(--brand-mute)]">
              Cargá el capital y las fechas. El coeficiente se calcula con la serie oficial del INDEC, con valor y fecha de cada dato.
            </p>
          </div>
        ) : (
          <div>
            <h3 className="mb-1 font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)]">Actualización según la ley 27.802</h3>
            <p className="mb-4 text-[11px] text-[var(--brand-mute)]">Fuente: {api.fuente}</p>
            <table className="w-full text-[13px]">
              <tbody className="divide-y divide-border">
                <tr><td className="py-2.5">Capital original</td><td className="py-2.5 text-right font-mono font-medium text-[var(--brand-navy)]">{formatCurrency(cap)}</td></tr>
                <tr><td className="py-2.5">IPC al inicio <span className="block text-[11px] text-[var(--brand-mute)]">dato del {fmtFecha(api.fecha_dato_desde)}</span></td><td className="py-2.5 text-right font-mono">{api.valor_desde.toLocaleString("es-AR")}</td></tr>
                <tr><td className="py-2.5">IPC al final <span className="block text-[11px] text-[var(--brand-mute)]">dato del {fmtFecha(api.fecha_dato_hasta)}</span></td><td className="py-2.5 text-right font-mono">{api.valor_hasta.toLocaleString("es-AR")}</td></tr>
                <tr><td className="py-2.5">Coeficiente IPC</td><td className="py-2.5 text-right font-mono">{api.coeficiente.toFixed(4)}</td></tr>
                <tr><td className="py-2.5">Capital actualizado por IPC</td><td className="py-2.5 text-right font-mono font-medium text-[var(--brand-navy)]">{formatCurrency(r.capital_ipc)}</td></tr>
                <tr><td className="py-2.5">Interés puro 3 % anual <span className="block text-[11px] text-[var(--brand-mute)]">{r.dias} días</span></td><td className="py-2.5 text-right font-mono">{formatCurrency(r.interes_3)}</td></tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--brand-navy)]">
                  <td className="py-3 text-[15px] font-semibold text-[var(--brand-navy)]">TOTAL ART. 276 LCT</td>
                  <td className="py-3 text-right text-[17px] font-semibold text-[var(--brand-navy)]">{formatCurrency(r.total_art_276)}</td>
                </tr>
              </tfoot>
            </table>
            <div className="mt-4 rounded border border-[var(--brand-navy)]/20 bg-[var(--brand-navy)]/5 px-4 py-3 text-[12px] text-[var(--brand-ink-2)]">
              <strong className="text-[var(--brand-navy)]">Juicio en trámite (art. 55 ley 27.802):</strong> tasa pasiva BCRA con techo{" "}
              <strong>{formatCurrency(r.art_55.techo_total)}</strong> y piso <strong>{formatCurrency(r.art_55.piso_total)}</strong> (67 % del techo).
              La CSJN ordenó aplicarlo en juicios en trámite («Cabana Opanasiuk», 05/11/2026):{" "}
              <Link href="/herramientas/reliquidacion-art-55" className="font-semibold underline underline-offset-2">reliquidar con la tasa pasiva →</Link>
            </div>
            {api.dato_parcial && (
              <p className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
                El último IPC publicado es del {fmtFecha(api.fecha_dato_hasta)}: el coeficiente llega hasta ese dato.
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-4">
              <Link href="/register" className="rounded bg-[var(--brand-gold)] px-4 py-2.5 text-[13px] font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-gold)]/80">
                Liquidar la demanda completa — gratis →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
