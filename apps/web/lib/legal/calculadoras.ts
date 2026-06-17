/**
 * Cálculo de liquidación final e indemnización por despido sin causa.
 *
 * Marco legal (LCT 20.744 y leyes complementarias):
 * - Art. 245: indemnización por antigüedad. Un (1) mes de la mejor remuneración
 *   mensual, normal y habitual por cada año de servicio o fracción MAYOR de 3 meses.
 *   Base topeada a 3× el promedio del CCT (doctrina Vizzoti: piso del 67%).
 * - Art. 231/232: preaviso. 15 días en período de prueba, 1 mes hasta 5 años de
 *   antigüedad, 2 meses si es superior a 5 años.
 * - Art. 233: integración del mes de despido (días faltantes hasta fin de mes).
 * - Art. 123: SAC sobre preaviso e integración.
 * - Art. 121/122: SAC proporcional del semestre.
 * - Art. 155/156: vacaciones proporcionales no gozadas (proporción ANUAL).
 * - Ley 25.323 art. 1: duplica la indemnización del art. 245 (relación no registrada).
 * - Ley 25.323 art. 2: incrementa un 50% arts. 232/233/245 si hubo que litigar.
 * - Art. 80 LCT: multa de 3 remuneraciones por no entregar certificados.
 *
 * IMPORTANTE: es una herramienta de asistencia. El profesional debe verificar
 * cada rubro y la vigencia de la normativa antes de presentar.
 */

import { parseLocalDate } from "./fecha";

const MS_POR_DIA = 1000 * 60 * 60 * 24;

export interface RubroLiquidacion {
  label: string;
  detalle?: string;
  monto: number;
}

export interface IndemnizacionResult {
  antiguedad_anios: number;
  antiguedad_meses: number;
  antiguedad_dias: number;
  indemnizacion_antiguedad: number;
  preaviso_meses: number;
  preaviso: number;
  integracion_dias: number;
  integracion: number;
  sac_preaviso: number;
  vacaciones_proporcionales: number;
  sac_proporcional: number;
  // Rubros opcionales
  ley_25323_art1: number;
  ley_25323_art2: number;
  multa_art_80: number;
  total: number;
  tope_aplicado: boolean;
  base_calculo: number;
  rubros: RubroLiquidacion[];
}

/** Diferencia en días entre dos fechas, inclusiva del día final. */
function diasInclusive(desde: Date, hasta: Date): number {
  return Math.floor((hasta.getTime() - desde.getTime()) / MS_POR_DIA) + 1;
}

/**
 * Calcula la antigüedad en años / meses / días completos y la cantidad de
 * "períodos" indemnizables del art. 245 (años + 1 si la fracción supera 3 meses).
 */
export function calcularAntiguedad(fechaIngreso: Date, fechaDespido: Date) {
  let anios = fechaDespido.getFullYear() - fechaIngreso.getFullYear();
  let meses = fechaDespido.getMonth() - fechaIngreso.getMonth();
  let dias = fechaDespido.getDate() - fechaIngreso.getDate();

  if (dias < 0) {
    meses -= 1;
    // Días del mes anterior al despido (pedimos prestado).
    const diasMesAnterior = new Date(fechaDespido.getFullYear(), fechaDespido.getMonth(), 0).getDate();
    dias += diasMesAnterior;
  }
  if (meses < 0) {
    anios -= 1;
    meses += 12;
  }

  // Fracción mayor de 3 meses → suma un período (art. 245).
  const fraccionMayor3 = meses > 3 || (meses === 3 && dias > 0);
  const periodos = Math.max(1, anios + (fraccionMayor3 ? 1 : 0));

  return { anios, meses, dias, periodos };
}

export function calcularIndemnizacionArt245(params: {
  mejor_remuneracion: number;
  fecha_ingreso: string;
  fecha_despido: string;
  tope_cct?: number;
  aplica_vizzoti?: boolean;
  en_periodo_prueba?: boolean;
  ley_25323_art1?: boolean;
  ley_25323_art2?: boolean;
  multa_art_80?: boolean;
}): IndemnizacionResult {
  const {
    mejor_remuneracion,
    fecha_ingreso,
    fecha_despido,
    tope_cct,
    aplica_vizzoti,
    en_periodo_prueba = false,
    ley_25323_art1 = false,
    ley_25323_art2 = false,
    multa_art_80 = false,
  } = params;

  const ingreso = parseLocalDate(fecha_ingreso);
  const despido = parseLocalDate(fecha_despido);

  const { anios, meses, dias, periodos } = calcularAntiguedad(ingreso, despido);

  // --- Base de cálculo y tope (art. 245 + Vizzoti) ---
  let base_calculo = mejor_remuneracion;
  let tope_aplicado = false;
  if (tope_cct && tope_cct > 0) {
    const tope = tope_cct * 3;
    if (base_calculo > tope) {
      if (aplica_vizzoti) {
        // El tope no puede reducir la base más de un 33% (piso del 67%).
        base_calculo = Math.max(tope, mejor_remuneracion * 0.67);
      } else {
        base_calculo = tope;
      }
      tope_aplicado = true;
    }
  }

  const indemnizacion_antiguedad = base_calculo * periodos;

  // --- Preaviso (art. 231/232) ---
  // Período de prueba: 15 días (0,5 mes). Hasta 5 años: 1 mes. Más de 5 años: 2 meses.
  const supera5Anios = anios > 5 || (anios === 5 && (meses > 0 || dias > 0));
  const preaviso_meses = en_periodo_prueba ? 0.5 : supera5Anios ? 2 : 1;
  const preaviso = mejor_remuneracion * preaviso_meses;

  // --- Integración del mes de despido (art. 233) ---
  const dia_despido = despido.getDate();
  const ultimo_dia_mes = new Date(despido.getFullYear(), despido.getMonth() + 1, 0).getDate();
  const integracion_dias = ultimo_dia_mes - dia_despido;
  const integracion = integracion_dias > 0 ? (mejor_remuneracion / 30) * integracion_dias : 0;

  // --- SAC sobre preaviso e integración (art. 123) ---
  const sac_preaviso = (preaviso + integracion) / 12;

  // --- Vacaciones proporcionales no gozadas (art. 155/156) ---
  // Día de vacación = remuneración / 25. Proporción sobre los días trabajados
  // en el AÑO calendario (no en el semestre).
  const dias_vacaciones =
    periodos <= 5 ? 14 : periodos <= 10 ? 21 : periodos <= 20 ? 28 : 35;
  const inicioAnio = new Date(despido.getFullYear(), 0, 1);
  const inicioComputoAnual = ingreso > inicioAnio ? ingreso : inicioAnio;
  const diasTrabajadosAnio = Math.min(365, diasInclusive(inicioComputoAnual, despido));
  const vacaciones_proporcionales =
    (mejor_remuneracion / 25) * dias_vacaciones * (diasTrabajadosAnio / 365);

  // --- SAC proporcional del semestre (art. 121/122) ---
  const enPrimerSemestre = despido.getMonth() < 6;
  const inicioSemestre = enPrimerSemestre
    ? new Date(despido.getFullYear(), 0, 1)
    : new Date(despido.getFullYear(), 6, 1);
  const finSemestre = enPrimerSemestre
    ? new Date(despido.getFullYear(), 5, 30)
    : new Date(despido.getFullYear(), 11, 31);
  const inicioComputoSem = ingreso > inicioSemestre ? ingreso : inicioSemestre;
  const diasDelSemestre = diasInclusive(inicioSemestre, finSemestre);
  const diasTrabajadosSemestre = Math.max(0, diasInclusive(inicioComputoSem, despido));
  const sac_proporcional = (mejor_remuneracion / 2) * (diasTrabajadosSemestre / diasDelSemestre);

  // --- Rubros opcionales ---
  const m_ley_25323_art1 = ley_25323_art1 ? indemnizacion_antiguedad : 0;
  const m_ley_25323_art2 = ley_25323_art2
    ? 0.5 * (indemnizacion_antiguedad + preaviso + integracion)
    : 0;
  const m_multa_art_80 = multa_art_80 ? mejor_remuneracion * 3 : 0;

  const rubros: RubroLiquidacion[] = [
    {
      label: "Indemnización por antigüedad (art. 245)",
      detalle: `${periodos} período${periodos > 1 ? "s" : ""} × ${formatCurrency(base_calculo)}`,
      monto: indemnizacion_antiguedad,
    },
    {
      label: "Indemnización sustitutiva de preaviso (art. 232)",
      detalle: en_periodo_prueba ? "15 días (período de prueba)" : `${preaviso_meses} mes${preaviso_meses > 1 ? "es" : ""}`,
      monto: preaviso,
    },
    {
      label: "Integración mes de despido (art. 233)",
      detalle: `${integracion_dias} día${integracion_dias !== 1 ? "s" : ""}`,
      monto: integracion,
    },
    { label: "SAC s/ preaviso e integración (art. 123)", monto: sac_preaviso },
    { label: "Vacaciones proporcionales (art. 156)", detalle: `${dias_vacaciones} días base`, monto: vacaciones_proporcionales },
    { label: "SAC proporcional (art. 121)", monto: sac_proporcional },
  ];
  if (m_ley_25323_art1 > 0) rubros.push({ label: "Duplicación Ley 25.323 art. 1", detalle: "relación no registrada", monto: m_ley_25323_art1 });
  if (m_ley_25323_art2 > 0) rubros.push({ label: "Incremento Ley 25.323 art. 2", detalle: "50% por falta de pago", monto: m_ley_25323_art2 });
  if (m_multa_art_80 > 0) rubros.push({ label: "Multa art. 80 LCT", detalle: "3 remuneraciones", monto: m_multa_art_80 });

  const total = rubros.reduce((acc, r) => acc + r.monto, 0);

  return {
    antiguedad_anios: periodos,
    antiguedad_meses: meses,
    antiguedad_dias: dias,
    indemnizacion_antiguedad,
    preaviso_meses,
    preaviso,
    integracion_dias,
    integracion,
    sac_preaviso,
    vacaciones_proporcionales,
    sac_proporcional,
    ley_25323_art1: m_ley_25323_art1,
    ley_25323_art2: m_ley_25323_art2,
    multa_art_80: m_multa_art_80,
    total,
    tope_aplicado,
    base_calculo,
    rubros,
  };
}

export function calcularIntereses(params: {
  capital: number;
  tasa_anual: number;
  fecha_desde: string;
  fecha_hasta: string;
}): { dias: number; intereses: number; total: number; tasa_diaria: number } {
  const { capital, tasa_anual, fecha_desde, fecha_hasta } = params;
  const desde = parseLocalDate(fecha_desde);
  const hasta = parseLocalDate(fecha_hasta);
  const dias = Math.max(0, Math.round((hasta.getTime() - desde.getTime()) / MS_POR_DIA));
  // Interés simple no capitalizable (criterio habitual de la liquidación judicial).
  const tasa_diaria = tasa_anual / 365;
  const intereses = capital * (tasa_diaria / 100) * dias;
  return { dias, intereses, total: capital + intereses, tasa_diaria };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}
