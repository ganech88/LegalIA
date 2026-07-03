/**
 * Índices económicos oficiales EN VIVO — diferencial del producto.
 *
 * Consume la API de series de tiempo de datos.gob.ar (datos oficiales de
 * INDEC, Secretaría de Trabajo y BCRA). Server-only: se usa desde
 * /api/indices. Las respuestas se cachean 12 horas (revalidate) para no
 * depender de la disponibilidad del servicio en cada request.
 *
 * Series verificadas (2026-07):
 * - IPC Nivel General Nacional, base dic-2016, mensual: 148.3_INIVELNAL_DICI_M_26
 * - RIPTE, mensual, pesos corrientes:                    158.1_REPTE_0_0_5
 * - CER diario (base 02-02-2002 = 1):                    94.2_CD_D_0_0_10
 * - UVA diario (base 31-03-2016 = 14,05):                94.2_UVAD_D_0_0_10
 */

const API_BASE = "https://apis.datos.gob.ar/series/api/series/";
const REVALIDATE_SECONDS = 60 * 60 * 12;

export type IndiceId = "ipc" | "ripte" | "cer" | "uva";

export interface IndiceInfo {
  id: IndiceId;
  serieId: string;
  nombre: string;
  fuente: string;
  frecuencia: "mensual" | "diaria";
}

export const INDICES: Record<IndiceId, IndiceInfo> = {
  ipc: {
    id: "ipc",
    serieId: "148.3_INIVELNAL_DICI_M_26",
    nombre: "IPC Nivel General Nacional (base dic-2016)",
    fuente: "INDEC, vía datos.gob.ar",
    frecuencia: "mensual",
  },
  ripte: {
    id: "ripte",
    serieId: "158.1_REPTE_0_0_5",
    nombre: "RIPTE — Remuneración imponible promedio",
    fuente: "Secretaría de Trabajo, vía datos.gob.ar",
    frecuencia: "mensual",
  },
  cer: {
    id: "cer",
    serieId: "94.2_CD_D_0_0_10",
    nombre: "CER diario",
    fuente: "BCRA, vía datos.gob.ar",
    frecuencia: "diaria",
  },
  uva: {
    id: "uva",
    serieId: "94.2_UVAD_D_0_0_10",
    nombre: "UVA diario",
    fuente: "BCRA, vía datos.gob.ar",
    frecuencia: "diaria",
  },
};

interface PuntoSerie {
  fecha: string;
  valor: number;
}

async function fetchSerie(params: string): Promise<PuntoSerie[]> {
  const res = await fetch(`${API_BASE}?${params}`, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`API de series respondió ${res.status}`);
  const json = (await res.json()) as { data?: [string, number | null][] };
  return (json.data ?? [])
    .filter((d): d is [string, number] => typeof d[1] === "number")
    .map(([fecha, valor]) => ({ fecha, valor }));
}

/** Primer valor disponible a partir de `desde` (YYYY-MM-DD). */
async function valorDesde(serieId: string, desde: string): Promise<PuntoSerie | null> {
  const puntos = await fetchSerie(`ids=${serieId}&start_date=${desde}&limit=1&format=json`);
  return puntos[0] ?? null;
}

/** Último valor disponible hasta `hasta` (YYYY-MM-DD). */
async function valorHasta(serieId: string, hasta: string): Promise<PuntoSerie | null> {
  const puntos = await fetchSerie(`ids=${serieId}&end_date=${hasta}&sort=desc&limit=1&format=json`);
  return puntos[0] ?? null;
}

export interface CoeficienteResult {
  indice: IndiceInfo;
  coeficiente: number;
  punto_desde: PuntoSerie;
  punto_hasta: PuntoSerie;
  /** true si el último dato disponible es anterior a la fecha pedida. */
  dato_parcial: boolean;
}

/**
 * Coeficiente de actualización entre dos fechas: valor(hasta) / valor(desde),
 * la metodología estándar para indexar por índice de nivel (IPC, RIPTE, CER).
 */
export async function calcularCoeficiente(
  indiceId: IndiceId,
  desde: string,
  hasta: string,
): Promise<CoeficienteResult> {
  const info = INDICES[indiceId];
  const [pDesde, pHasta] = await Promise.all([
    valorDesde(info.serieId, desde),
    valorHasta(info.serieId, hasta),
  ]);
  if (!pDesde) throw new Error(`Sin datos de ${info.nombre} para la fecha inicial ${desde}.`);
  if (!pHasta) throw new Error(`Sin datos de ${info.nombre} hasta ${hasta}.`);
  if (pHasta.fecha < pDesde.fecha) {
    throw new Error("El período consultado no tiene datos suficientes (¿fechas invertidas?).");
  }
  return {
    indice: info,
    coeficiente: pHasta.valor / pDesde.valor,
    punto_desde: pDesde,
    punto_hasta: pHasta,
    // Si faltan más de 45 días entre el dato disponible y lo pedido, avisamos.
    dato_parcial:
      new Date(hasta).getTime() - new Date(pHasta.fecha).getTime() > 45 * 24 * 60 * 60 * 1000,
  };
}
