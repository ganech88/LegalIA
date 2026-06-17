/**
 * Estimadores de honorarios, tasa de justicia y cuota alimentaria.
 *
 * ⚠️ Son ESTIMACIONES orientativas y transparentes (muestran la cuenta). Los
 * porcentajes, el valor de la UMA y las alícuotas cambian y dependen de la
 * jurisdicción, el tipo de proceso y el criterio judicial. Verificá siempre la
 * normativa vigente y la regulación concreta antes de usarlas.
 */

/**
 * Valor de la UMA (Unidad de Medida Arancelaria, Ley 27.423) en ARS.
 * ⚠️ ACTUALIZAR según la última acordada de la CSJN. Valor de referencia.
 */
export const VALOR_UMA_DEFAULT = 38000;

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
