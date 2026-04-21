export interface IndemnizacionResult {
  antiguedad_anios: number;
  indemnizacion_antiguedad: number;
  preaviso_meses: number;
  preaviso: number;
  integracion_dias: number;
  integracion: number;
  sac_preaviso: number;
  vacaciones_proporcionales: number;
  sac_proporcional: number;
  total: number;
  tope_aplicado: boolean;
  base_calculo: number;
}

export function calcularIndemnizacionArt245(params: {
  mejor_remuneracion: number;
  fecha_ingreso: string;
  fecha_despido: string;
  tope_cct?: number;
  aplica_vizzoti?: boolean;
}): IndemnizacionResult {
  const { mejor_remuneracion, fecha_ingreso, fecha_despido, tope_cct, aplica_vizzoti } = params;

  const ingreso = new Date(fecha_ingreso);
  const despido = new Date(fecha_despido);

  const diffMs = despido.getTime() - ingreso.getTime();
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  const antiguedad_anios = Math.max(1, Math.round(diffYears));

  let base_calculo = mejor_remuneracion;
  let tope_aplicado = false;

  if (tope_cct && tope_cct > 0) {
    const tope = tope_cct * 3;
    if (base_calculo > tope) {
      if (aplica_vizzoti) {
        const minimo = mejor_remuneracion * 0.67;
        base_calculo = Math.max(tope, minimo);
      } else {
        base_calculo = tope;
      }
      tope_aplicado = true;
    }
  }

  const indemnizacion_antiguedad = base_calculo * antiguedad_anios;

  const preaviso_meses = antiguedad_anios >= 5 ? 2 : 1;
  const preaviso = mejor_remuneracion * preaviso_meses;

  const dia_despido = despido.getDate();
  const ultimo_dia_mes = new Date(despido.getFullYear(), despido.getMonth() + 1, 0).getDate();
  const integracion_dias = ultimo_dia_mes - dia_despido;
  const integracion = integracion_dias > 0 ? (mejor_remuneracion / 30) * integracion_dias : 0;

  const sac_preaviso = (preaviso + integracion) / 12;

  const mes_ingreso = ingreso.getMonth();
  const mes_despido = despido.getMonth();
  const dia_ingreso = ingreso.getDate();
  const meses_trabajados_semestre = mes_despido >= 6
    ? mes_despido - 6 + (despido.getDate() > 0 ? 1 : 0)
    : mes_despido + (despido.getDate() > 0 ? 1 : 0);

  const dias_vacaciones = antiguedad_anios <= 5 ? 14 : antiguedad_anios <= 10 ? 21 : antiguedad_anios <= 20 ? 28 : 35;
  const vacaciones_proporcionales = (mejor_remuneracion / 25) * (dias_vacaciones * meses_trabajados_semestre / 12);

  const sac_proporcional = (mejor_remuneracion / 12) * (mes_despido >= 6 ? mes_despido - 6 + 1 : mes_despido + 1) / 6 * (mejor_remuneracion / 2) / mejor_remuneracion;
  const sac_prop_calc = (mejor_remuneracion / 2) * (meses_trabajados_semestre / 6);

  const total = indemnizacion_antiguedad + preaviso + integracion + sac_preaviso + vacaciones_proporcionales + sac_prop_calc;

  return {
    antiguedad_anios,
    indemnizacion_antiguedad,
    preaviso_meses,
    preaviso,
    integracion_dias,
    integracion,
    sac_preaviso,
    vacaciones_proporcionales,
    sac_proporcional: sac_prop_calc,
    total,
    tope_aplicado,
    base_calculo,
  };
}

export function calcularIntereses(params: {
  capital: number;
  tasa_anual: number;
  fecha_desde: string;
  fecha_hasta: string;
}): { dias: number; intereses: number; total: number; tasa_diaria: number } {
  const { capital, tasa_anual, fecha_desde, fecha_hasta } = params;
  const desde = new Date(fecha_desde);
  const hasta = new Date(fecha_hasta);
  const dias = Math.round((hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24));
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
  }).format(value);
}
