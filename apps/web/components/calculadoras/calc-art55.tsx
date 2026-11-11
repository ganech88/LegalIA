"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/legal/calculadoras";
import { calcularArt55, generarAnexoArt55, ETIQUETA_RIGE, type CriterioPiso } from "@/lib/legal/art55";

interface Serie {
  coeficiente: number;
  valor_desde: number;
  fecha_dato_desde: string;
  valor_hasta: number;
  fecha_dato_hasta: string;
  dato_parcial: boolean;
  fuente: string;
}

const fmtFecha = (iso: string) => iso.slice(0, 10).split("-").reverse().join("/");
const inputCls =
  "w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]";

async function pedirSerie(indice: string, desde: string, hasta: string): Promise<Serie> {
  const res = await fetch(`/api/indices?indice=${indice}&desde=${desde}&hasta=${hasta}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "No se pudo consultar la serie oficial.");
  return data as Serie;
}

/**
 * Reliquidador del art. 55 de la ley 27.802 (juicios laborales en trámite):
 * tasa pasiva BCRA, techo IPC + 3 % y piso del 67 %, con las dos lecturas del
 * piso y el anexo auditable. `variante="app"` agrega el pase al generador.
 */
export function CalcArt55({ variante = "publica" }: { variante?: "publica" | "app" }) {
  const router = useRouter();
  const [capital, setCapital] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState(() => new Date().toISOString().slice(0, 10));
  const [coefManual, setCoefManual] = useState("");
  const [pedirManual, setPedirManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ipc, setIpc] = useState<Serie | null>(null);
  const [pasiva, setPasiva] = useState<{ coeficiente: number; fuente: string; detalle?: Serie } | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function calcular(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIpc(null);
    setPasiva(null);
    setCopiado(false);
    const manual = parseFloat(coefManual.replace(",", "."));
    try {
      const serieIpc = await pedirSerie("ipc", desde, hasta);
      if (manual > 0) {
        setPasiva({ coeficiente: manual, fuente: "coeficiente cargado a mano (calculadora del BCRA)" });
      } else {
        try {
          const s = await pedirSerie("pasiva55", desde, hasta);
          setPasiva({ coeficiente: s.coeficiente, fuente: s.fuente, detalle: s });
        } catch (err) {
          setPedirManual(true);
          setError(
            `${err instanceof Error ? err.message : "La serie del BCRA no respondió."} Cargá el coeficiente de la calculadora oficial del BCRA (monto final ÷ capital) y volvé a calcular.`,
          );
          setLoading(false);
          return;
        }
      }
      setIpc(serieIpc);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo conectar con el servicio de índices.");
    }
    setLoading(false);
  }

  const cap = parseFloat(capital) || 0;
  const r =
    ipc && pasiva
      ? calcularArt55({ capital: cap, coeficiente_ipc: ipc.coeficiente, coeficiente_pasiva: pasiva.coeficiente, fecha_desde: desde, fecha_hasta: hasta })
      : null;
  const anexo =
    r && ipc && pasiva
      ? generarAnexoArt55(r, {
          fecha_desde: desde,
          fecha_hasta: hasta,
          coeficiente_ipc: ipc.coeficiente,
          coeficiente_pasiva: pasiva.coeficiente,
          fuente_ipc: `${ipc.fuente} (datos del ${fmtFecha(ipc.fecha_dato_desde)} y del ${fmtFecha(ipc.fecha_dato_hasta)})`,
          fuente_pasiva: pasiva.detalle
            ? `${pasiva.fuente} (índices del ${fmtFecha(pasiva.detalle.fecha_dato_desde)} y del ${fmtFecha(pasiva.detalle.fecha_dato_hasta)})`
            : pasiva.fuente,
        })
      : "";

  async function copiar() {
    try {
      await navigator.clipboard.writeText(anexo);
      setCopiado(true);
    } catch { /* portapapeles no disponible */ }
  }

  function generarEscrito() {
    if (!r) return;
    try {
      sessionStorage.setItem(
        "legalia:prefill-custom",
        JSON.stringify({
          tipo_escrito: "Practica liquidación conforme art. 55 de la ley 27.802",
          descripcion:
            "Escrito por el que se practica liquidación del crédito laboral en un juicio en trámite, aplicando el art. 55 de la ley 27.802 conforme lo resuelto por la CSJN en \"Cabana Opanasiuk c/ Unir S.A.\" (05/11/2026). Transcribir la liquidación del anexo sin alterar los importes, pedir su aprobación y el traslado a la contraria, y hacer reserva del caso federal.",
          datos_caso: anexo,
        }),
      );
    } catch { /* sessionStorage no disponible */ }
    router.push("/escritos/personalizado");
  }

  const fila = (c: CriterioPiso, titulo: string, nota: string) =>
    r && (
      <tr>
        <td className="py-2.5">
          {titulo}
          <span className="block text-[11px] text-[var(--brand-mute)]">{nota} · piso {formatCurrency(r.criterios[c].piso)}</span>
        </td>
        <td className="py-2.5 text-right">
          <span className="font-mono text-[15px] font-semibold text-[var(--brand-navy)]">{formatCurrency(r.criterios[c].resultado)}</span>
          <span className="block text-[11px] text-[var(--brand-mute)]">{ETIQUETA_RIGE[r.criterios[c].rige]}</span>
        </td>
      </tr>
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-6">
      <form onSubmit={calcular} className="card-editorial p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="t-overline text-[var(--brand-navy)] block">Capital histórico *</label>
          <input type="number" min={1} step="0.01" required value={capital} onChange={(e) => setCapital(e.target.value)} placeholder="5000000" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="t-overline text-[var(--brand-navy)] block">Desde (fecha en que se debió) *</label>
            <input type="date" required min="2017-01-01" value={desde} onChange={(e) => setDesde(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="t-overline text-[var(--brand-navy)] block">Hasta *</label>
            <input type="date" required value={hasta} onChange={(e) => setHasta(e.target.value)} className={inputCls} />
          </div>
        </div>
        {pedirManual ? (
          <div className="space-y-1.5">
            <label className="t-overline text-[var(--brand-navy)] block">Coeficiente de tasa pasiva (BCRA)</label>
            <input type="text" inputMode="decimal" value={coefManual} onChange={(e) => setCoefManual(e.target.value)} placeholder="2,2041" className={inputCls} />
            <p className="text-[11px] text-[var(--brand-mute)]">Monto final ÷ capital según la calculadora oficial del BCRA para el mismo período.</p>
          </div>
        ) : (
          <button type="button" onClick={() => setPedirManual(true)} className="text-[11px] text-[var(--brand-mute)] underline underline-offset-2">
            Cargar a mano el coeficiente de tasa pasiva
          </button>
        )}
        <button type="submit" disabled={loading} className="w-full rounded bg-[var(--brand-navy)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)] disabled:opacity-60">
          {loading ? "Consultando BCRA e INDEC…" : "Reliquidar por art. 55"}
        </button>
        {error && <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p>}
        <p className="text-[11px] leading-relaxed text-[var(--brand-mute)]">
          Aplica a juicios laborales en trámite y sin sentencia definitiva al 06/03/2026. Un cálculo por cada suma con fecha de mora distinta.
        </p>
      </form>

      <div className="card-editorial p-6">
        {!r || !ipc || !pasiva ? (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 font-[var(--font-display)] text-6xl italic text-[var(--brand-gold)] opacity-40">§</div>
            <p className="text-[13px] text-[var(--brand-mute)]">
              Cargá el capital y las fechas. Vas a ver los tres números del art. 55 —tasa pasiva, techo y piso— y cuál rige.
            </p>
          </div>
        ) : (
          <div>
            <h3 className="mb-1 font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)]">Liquidación art. 55 ley 27.802</h3>
            <p className="mb-4 text-[11px] text-[var(--brand-mute)]">{r.dias} días · {fmtFecha(desde)} al {fmtFecha(hasta)}</p>
            <table className="w-full text-[13px]">
              <tbody className="divide-y divide-border">
                <tr><td className="py-2.5">Capital histórico</td><td className="py-2.5 text-right font-mono">{formatCurrency(cap)}</td></tr>
                <tr>
                  <td className="py-2.5">a) Tasa pasiva BCRA
                    <span className="block text-[11px] text-[var(--brand-mute)]">
                      coef. {pasiva.coeficiente.toFixed(4)}
                      {pasiva.detalle ? ` · índices del ${fmtFecha(pasiva.detalle.fecha_dato_desde)} y ${fmtFecha(pasiva.detalle.fecha_dato_hasta)}` : " · cargado a mano"}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono font-medium text-[var(--brand-navy)]">{formatCurrency(r.pasiva_total)}</td>
                </tr>
                <tr>
                  <td className="py-2.5">b) Techo: IPC + 3 % anual
                    <span className="block text-[11px] text-[var(--brand-mute)]">coef. IPC {ipc.coeficiente.toFixed(4)} · datos del {fmtFecha(ipc.fecha_dato_desde)} y {fmtFecha(ipc.fecha_dato_hasta)}</span>
                  </td>
                  <td className="py-2.5 text-right font-mono font-medium text-[var(--brand-navy)]">{formatCurrency(r.techo_total)}</td>
                </tr>
              </tbody>
            </table>

            <h4 className="mt-5 mb-1 t-overline text-[var(--brand-navy)]">Resultado</h4>
            <table className="w-full text-[13px] border-t-2 border-[var(--brand-navy)]">
              <tbody className="divide-y divide-border">
                {fila("total", "Piso = 67 % del total del inciso b", "lectura literal")}
                {r.criterios_difieren && fila("ajuste", "Piso = capital + 67 % del ajuste", "criterio de la calculadora del BCRA")}
              </tbody>
            </table>
            {r.criterios_difieren && (
              <p className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
                Las dos lecturas del inciso c dan importes distintos. Liquidá por la que te favorece y dejá planteada la otra en subsidio.
              </p>
            )}
            {(ipc.dato_parcial || pasiva.detalle?.dato_parcial) && (
              <p className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
                El último dato publicado es anterior a la fecha final: el cálculo llega hasta ese dato.
              </p>
            )}
            <p className="mt-3 text-[11px] leading-relaxed text-[var(--brand-mute)]">
              CSJN, «Cabana Opanasiuk c/ Unir S.A.», 05/11/2026. Fuentes: {pasiva.fuente}; {ipc.fuente}. Verificá los valores antes de presentar.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-4">
              <button type="button" onClick={copiar} className="rounded border border-[var(--brand-navy)] px-4 py-2.5 text-[13px] font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-navy)] hover:text-white">
                {copiado ? "Anexo copiado ✓" : "Copiar anexo de liquidación"}
              </button>
              {variante === "app" ? (
                <button type="button" onClick={generarEscrito} className="rounded bg-[var(--brand-gold)] px-4 py-2.5 text-[13px] font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-gold)]/80">
                  Generar el escrito de liquidación →
                </button>
              ) : (
                <Link href="/register" className="rounded bg-[var(--brand-gold)] px-4 py-2.5 text-[13px] font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-gold)]/80">
                  Generar el escrito con esta liquidación — gratis →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
