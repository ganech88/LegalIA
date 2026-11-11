/**
 * Art. 55 de la ley 27.802 — juicios laborales en trámite sin sentencia
 * definitiva al 06/03/2026 (CSJN, "Cabana Opanasiuk c/ Unir S.A.", 05/11/2026).
 *
 * Tres números:
 *   a) capital con la tasa pasiva que publica el BCRA (serie "Tasa pasiva
 *      Ley 27.802, art. 55 inc. a", Res. Directorio 45/26);
 *   b) techo: capital actualizado por IPC + 3 % anual;
 *   c) piso: 67 % del cálculo del inciso b.
 *
 * El inciso c admite dos lecturas y por eso se informan las dos:
 *   - "total":  67 % del importe total del inciso b (capital incluido);
 *   - "ajuste": capital + 67 % del ajuste del inciso b (criterio de la
 *               calculadora oficial del BCRA).
 * Función pura: los coeficientes vienen de las series oficiales.
 */
import { calcularActualizacion27802 } from "./calculadoras";

export type RigeArt55 = "pasiva" | "techo" | "piso";
export type CriterioPiso = "total" | "ajuste";

export interface ResultadoCriterio {
  piso: number;
  resultado: number;
  rige: RigeArt55;
}

export interface Art55Result {
  dias: number;
  capital: number;
  /** Inciso a: capital × coeficiente de tasa pasiva. */
  pasiva_total: number;
  /** Inciso b: capital × coeficiente IPC + 3 % anual. */
  techo_total: number;
  capital_ipc: number;
  interes_3: number;
  criterios: Record<CriterioPiso, ResultadoCriterio>;
  /** true si las dos lecturas del piso llevan a importes distintos. */
  criterios_difieren: boolean;
}

function resolver(pasiva: number, techo: number, piso: number): ResultadoCriterio {
  if (pasiva > techo) return { piso, resultado: techo, rige: "techo" };
  if (pasiva < piso) return { piso, resultado: piso, rige: "piso" };
  return { piso, resultado: pasiva, rige: "pasiva" };
}

export function calcularArt55(params: {
  capital: number;
  coeficiente_ipc: number;
  coeficiente_pasiva: number;
  fecha_desde: string;
  fecha_hasta: string;
}): Art55Result {
  const { capital, coeficiente_ipc, coeficiente_pasiva, fecha_desde, fecha_hasta } = params;
  const base = calcularActualizacion27802({ capital, coeficiente_ipc, fecha_desde, fecha_hasta });
  const techo = base.total_art_276;
  const pasiva = capital * coeficiente_pasiva;
  const total = resolver(pasiva, techo, techo * 0.67);
  const ajuste = resolver(pasiva, techo, capital + (techo - capital) * 0.67);
  return {
    dias: base.dias,
    capital,
    pasiva_total: pasiva,
    techo_total: techo,
    capital_ipc: base.capital_ipc,
    interes_3: base.interes_3,
    criterios: { total, ajuste },
    criterios_difieren: Math.abs(total.resultado - ajuste.resultado) > 0.005,
  };
}

export const ETIQUETA_RIGE: Record<RigeArt55, string> = {
  pasiva: "rige la tasa pasiva (inc. a)",
  techo: "rige el techo (inc. b)",
  piso: "rige el piso (inc. c)",
};

const ars = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 }).format(n);
const fecha = (iso: string) => iso.slice(0, 10).split("-").reverse().join("/");

/** Anexo auditable en texto plano, para acompañar el escrito de liquidación. */
export function generarAnexoArt55(
  r: Art55Result,
  d: {
    fecha_desde: string;
    fecha_hasta: string;
    coeficiente_ipc: number;
    coeficiente_pasiva: number;
    fuente_ipc: string;
    fuente_pasiva: string;
  },
): string {
  const L: string[] = [];
  L.push("ANEXO — LIQUIDACIÓN SEGÚN ART. 55 DE LA LEY 27.802");
  L.push(`Período: ${fecha(d.fecha_desde)} al ${fecha(d.fecha_hasta)} (${r.dias} días).`);
  L.push(`Capital histórico: ${ars(r.capital)}.`);
  L.push("");
  L.push(`a) Tasa pasiva BCRA (art. 55 inc. a): capital × ${d.coeficiente_pasiva.toFixed(6)} = ${ars(r.pasiva_total)}. Fuente: ${d.fuente_pasiva}.`);
  L.push(`b) Techo (art. 55 inc. b): capital × coeficiente IPC ${d.coeficiente_ipc.toFixed(6)} = ${ars(r.capital_ipc)}, más 3 % anual por ${r.dias} días (${ars(r.interes_3)}) = ${ars(r.techo_total)}. Fuente: ${d.fuente_ipc}.`);
  L.push(`c) Piso (art. 55 inc. c): 67 % del importe total del inciso b = ${ars(r.criterios.total.piso)}; o capital más 67 % del ajuste del inciso b (criterio de la calculadora del BCRA) = ${ars(r.criterios.ajuste.piso)}.`);
  L.push("");
  L.push(`RESULTADO (piso sobre el total): ${ars(r.criterios.total.resultado)} — ${ETIQUETA_RIGE[r.criterios.total.rige]}.`);
  if (r.criterios_difieren) {
    L.push(`RESULTADO (piso sobre el ajuste): ${ars(r.criterios.ajuste.resultado)} — ${ETIQUETA_RIGE[r.criterios.ajuste.rige]}.`);
  }
  L.push("");
  L.push("Norma: art. 55 ley 27.802 (B.O. 06/03/2026). CSJN, \"Cabana Opanasiuk, Leonardo c/ Unir S.A. y otros s/ despido\", 05/11/2026.");
  return L.join("\n");
}
