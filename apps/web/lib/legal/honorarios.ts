/**
 * Estimadores de honorarios, tasa de justicia y cuota alimentaria.
 *
 * ⚠️ Son ESTIMACIONES orientativas y transparentes (muestran la cuenta). Los
 * porcentajes, el valor de la UMA y las alícuotas cambian y dependen de la
 * jurisdicción, el tipo de proceso y el criterio judicial. Verificá siempre la
 * normativa vigente y la regulación concreta antes de usarlas.
 */

/**
 * Valor de la UMA (Unidad de Medida Arancelaria, ley 27.423) en ARS, según las
 * resoluciones de la CSJN publicadas por el CPACF. Cada fila: [vigencia desde,
 * valor, resolución]. Agregar la nueva fila cuando salga la acordada mensual.
 */
export const UMA_VALORES: { desde: string; valor: number; resolucion: string }[] = [
  { desde: "2025-01-01", valor: 67632, resolucion: "Res. CSJN 237/25" },
  { desde: "2025-02-01", valor: 68985, resolucion: "Res. CSJN 580/25" },
  { desde: "2025-03-01", valor: 70709, resolucion: "Res. CSJN 936/25" },
  { desde: "2025-04-01", valor: 72265, resolucion: "Res. CSJN 1236/25" },
  { desde: "2025-05-01", valor: 73204, resolucion: "Res. CSJN 1432/25" },
  { desde: "2025-06-01", valor: 74376, resolucion: "Res. CSJN 1687/25" },
  { desde: "2025-07-01", valor: 75789, resolucion: "Res. CSJN 1860/25" },
  { desde: "2025-08-01", valor: 77229, resolucion: "Res. CSJN 2226/25" },
  { desde: "2025-09-01", valor: 78850, resolucion: "Res. CSJN 2533/25" },
  { desde: "2025-10-01", valor: 80664, resolucion: "Res. CSJN 2996/25" },
  { desde: "2025-11-01", valor: 84963, resolucion: "Res. CSJN 3160/25" },
  { desde: "2025-12-01", valor: 87342, resolucion: "Res. CSJN 36/26" },
  { desde: "2026-01-01", valor: 89875, resolucion: "Res. CSJN 235/26" },
  { desde: "2026-02-01", valor: 92482, resolucion: "Res. CSJN 538/26" },
  { desde: "2026-03-01", valor: 95626, resolucion: "Res. CSJN 1076/26" },
  { desde: "2026-04-01", valor: 98112, resolucion: "Res. CSJN 1352/26" },
  { desde: "2026-05-01", valor: 100173, resolucion: "Res. CSJN 1718/26" },
  { desde: "2026-06-01", valor: 102076, resolucion: "Res. CSJN 1785/26" },
  { desde: "2026-07-01", valor: 104220, resolucion: "Res. CSJN 1930/26" },
  { desde: "2026-08-01", valor: 105991, resolucion: "Res. CSJN 2372/26" },
  { desde: "2026-09-01", valor: 108005, resolucion: "Res. CSJN 2622/26" },
];

/** UMA vigente a una fecha (o la última conocida). */
export function umaVigente(fechaISO?: string): { desde: string; valor: number; resolucion: string } {
  const f = (fechaISO ?? "").slice(0, 10);
  let hit = UMA_VALORES[UMA_VALORES.length - 1];
  if (f) {
    for (const u of UMA_VALORES) if (u.desde <= f) hit = u;
  }
  return hit;
}

/** Última UMA conocida (ver UMA_VALORES). */
export const VALOR_UMA_DEFAULT = UMA_VALORES[UMA_VALORES.length - 1].valor;

/**
 * Tope de costas en juicios laborales: 25% del monto de la sentencia o
 * transacción (art. 277 LCT según ley 24.432; ratificado por la ley 27.802).
 */
export function aplicarTopeCostasLaboral(p: { montoSentencia: number; totalCostas: number }): {
  tope: number;
  excede: boolean;
  costasAjustadas: number;
} {
  const tope = p.montoSentencia * 0.25;
  const excede = p.totalCostas > tope;
  return { tope, excede, costasAjustadas: excede ? tope : p.totalCostas };
}

export interface HonorariosResult {
  honorarioPleno: number; // por todas las etapas
  honorario: number; // proporcional a las etapas cumplidas
  honorarioPorEtapa: number;
  enUMA: number;
}

/**
 * Honorarios (Ley 27.423). honorario = base × porcentaje × (etapas cumplidas / total).
 * El porcentaje se ingresa según la escala aplicable (p. ej. 1ª instancia, proceso
 * de conocimiento: rango legal orientativo 11%–20%).
 */
export function calcularHonorarios(p: {
  baseRegulatoria: number;
  porcentaje: number;
  etapasCumplidas: number;
  totalEtapas?: number;
  valorUMA?: number;
}): HonorariosResult {
  const totalEtapas = p.totalEtapas ?? 3;
  const proporcion = Math.min(1, Math.max(0, p.etapasCumplidas / totalEtapas));
  const honorarioPleno = p.baseRegulatoria * (p.porcentaje / 100);
  const honorario = honorarioPleno * proporcion;
  const valorUMA = p.valorUMA ?? VALOR_UMA_DEFAULT;
  return {
    honorarioPleno,
    honorario,
    honorarioPorEtapa: honorarioPleno / totalEtapas,
    enUMA: valorUMA > 0 ? honorario / valorUMA : 0,
  };
}

/** Tasa de justicia. Nacional: 3% del monto del juicio (Ley 23.898). */
export function calcularTasaJusticia(p: { monto: number; alicuota?: number }): {
  tasa: number;
  alicuota: number;
} {
  const alicuota = p.alicuota ?? 3;
  return { tasa: p.monto * (alicuota / 100), alicuota };
}

/**
 * Cuota alimentaria orientativa = ingreso neto × porcentaje. NO es una fórmula
 * legal: la fija el juez según necesidades del alimentado y capacidad del
 * alimentante (arts. 658 y conc. CCCN). Valor meramente indicativo.
 */
export function calcularCuotaAlimentaria(p: { ingresoNeto: number; porcentaje: number }): {
  cuota: number;
} {
  return { cuota: p.ingresoNeto * (p.porcentaje / 100) };
}

/** Rangos orientativos de cuota alimentaria por cantidad de hijos (referencia). */
export const RANGOS_CUOTA = [
  { hijos: 1, rango: "20% – 30%" },
  { hijos: 2, rango: "30% – 40%" },
  { hijos: 3, rango: "40% – 50%" },
];
