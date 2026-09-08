/**
 * Prestaciones dinerarias de la Ley de Riesgos del Trabajo (24.557), con las
 * reformas de las leyes 26.773 (2012) y 27.348 (2017) y los pisos que la SRT
 * publica cada semestre (dec. 1694/09 art. 3 → actualización por RIPTE,
 * ley 26.773 arts. 8 y 17.6).
 *
 * Fórmulas (todas de pago único desde la ley 26.773, art. 2):
 * - ILP parcial (< 66%), art. 14.2:  53 × IBM × (% / 100) × (65 / edad),
 *   con piso = PISO_ART_14 × (% / 100). Si el % es > 50 y < 66 se suma la
 *   compensación adicional del art. 11.4.a.
 * - ILP total (≥ 66%), art. 15.2:  53 × IBM × (65 / edad)  — SIN multiplicar
 *   por el porcentaje —, piso PISO_ART_15, más compensación art. 11.4.b.
 * - Gran invalidez, art. 17: ídem total + prestación MENSUAL adicional (se
 *   informa aparte; no es pago único).
 * - Muerte, art. 18: ídem total, más compensación art. 11.4.c.
 * - Art. 3 ley 26.773: si el daño se produjo en el lugar de trabajo o mientras
 *   el trabajador está a disposición del empleador (NO in itinere), se adiciona
 *   un 20% sobre las prestaciones dinerarias; para muerte e incapacidad total
 *   ese 20% no puede ser inferior al mínimo que fija la SRT.
 * - ILT, art. 13: prestación mensual igual a la remuneración calculada según
 *   el art. 208 LCT; los primeros 10 días los paga el empleador, luego la ART.
 *
 * El IBM es el del art. 12 (ley 27.348): promedio de las remuneraciones de los
 * 12 meses anteriores, actualizadas por RIPTE. Acá se ingresa ya calculado.
 */

export interface PisosSRT {
  /** Identificación de la resolución y vigencia, para mostrar la fuente. */
  fuente: string;
  vigencia_desde: string;
  vigencia_hasta: string;
  /** Art. 11.4.a — ILP parcial > 50% y < 66%. */
  compensacion_11_4_a: number;
  /** Art. 11.4.b — ILP total (≥ 66%) y gran invalidez. */
  compensacion_11_4_b: number;
  /** Art. 11.4.c — muerte. */
  compensacion_11_4_c: number;
  /** Piso del art. 14.2 (se multiplica por el % de incapacidad). */
  piso_art_14: number;
  /** Piso del art. 15.2 (incapacidad total) y del art. 18 (muerte). */
  piso_art_15: number;
  /** Mínimo del adicional 20% (art. 3 ley 26.773) para muerte e incapacidad total. */
  minimo_art_3_26773: number;
}

/**
 * Tabla semestral. Agregar una fila por cada resolución de la SRT; se elige
 * la vigente a la fecha de la primera manifestación invalidante.
 * Fuente 39/2026: B.O. 02/09/2026.
 */
export const PISOS_SRT: PisosSRT[] = [
  {
    fuente: "Res. SRT 39/2026 (B.O. 02/09/2026)",
    vigencia_desde: "2026-09-01",
    vigencia_hasta: "2027-02-28",
    compensacion_11_4_a: 50_824_055,
    compensacion_11_4_b: 63_530_069,
    compensacion_11_4_c: 76_236_060,
    piso_art_14: 114_354_110,
    piso_art_15: 114_354_110,
    minimo_art_3_26773: 21_656_176,
  },
];

export function pisosVigentes(fechaISO?: string): PisosSRT {
  const f = (fechaISO ?? "").slice(0, 10);
  const hit = f ? PISOS_SRT.find((p) => f >= p.vigencia_desde && f <= p.vigencia_hasta) : undefined;
  return hit ?? PISOS_SRT[PISOS_SRT.length - 1];
}

export type TipoPrestacion = "ilp" | "ilt" | "gran_invalidez" | "muerte";

export interface RubroART {
  label: string;
  norma: string;
  detalle: string;
  monto: number;
}

export interface ARTResult {
  tipo: TipoPrestacion;
  porcentaje_incapacidad: number;
  ingreso_base: number;
  coef_edad: number;
  formula: number;
  piso: number;
  aplica_piso: boolean;
  rubros: RubroART[];
  total: number;
  advertencias: string[];
  pisos: PisosSRT;
}

export function calcularART(params: {
  ingreso_base_mensual: number;
  porcentaje_incapacidad: number;
  edad: number;
  tipo: TipoPrestacion;
  dias_ilt?: number;
  /** Accidente en el lugar de trabajo / a disposición del empleador (no in itinere): +20% art. 3 ley 26.773. */
  aplica_20_por_ciento?: boolean;
  fecha_pmi?: string;
  pisos?: PisosSRT;
}): ARTResult {
  const { ingreso_base_mensual: ibm, edad, tipo, dias_ilt = 0, aplica_20_por_ciento = false } = params;
  const pct = Math.min(100, Math.max(0, params.porcentaje_incapacidad || 0));
  const pisos = params.pisos ?? pisosVigentes(params.fecha_pmi);
  const coef_edad = edad > 0 ? 65 / edad : 1;
  const rubros: RubroART[] = [];
  const advertencias: string[] = [];

  let formula = 0;
  let piso = 0;

  if (tipo === "ilt") {
    const monto = (ibm / 30) * dias_ilt;
    rubros.push({
      label: "Incapacidad laboral temporaria",
      norma: "Art. 13 LRT (según ley 26.773) y art. 208 LCT",
      detalle: `${dias_ilt} día(s) × IBM/30 — los primeros 10 días a cargo del empleador, el resto de la ART`,
      monto,
    });
    advertencias.push("La ILT se liquida como salario (art. 208 LCT): la aproximación IBM/30 × días es orientativa; usar la remuneración real del período.");
    return { tipo, porcentaje_incapacidad: pct, ingreso_base: ibm, coef_edad, formula: monto, piso: 0, aplica_piso: false, rubros, total: monto, advertencias, pisos };
  }

  const esTotal = tipo === "muerte" || tipo === "gran_invalidez" || pct >= 66;
  if (esTotal) {
    formula = 53 * ibm * coef_edad;
    piso = pisos.piso_art_15;
  } else {
    formula = 53 * ibm * (pct / 100) * coef_edad;
    piso = pisos.piso_art_14 * (pct / 100);
  }
  const aplica_piso = piso > formula;
  const principal = Math.max(formula, piso);

  const normaPrincipal =
    tipo === "muerte" ? "Art. 18.1 LRT (remite al art. 15.2)" :
    tipo === "gran_invalidez" ? "Arts. 15.2 y 17 LRT" :
    pct >= 66 ? "Art. 15.2 LRT (incapacidad total, ≥ 66%)" : "Art. 14.2 LRT (incapacidad parcial)";
  rubros.push({
    label: esTotal ? "Indemnización por incapacidad total / muerte" : `Indemnización por incapacidad parcial (${pct}%)`,
    norma: normaPrincipal,
    detalle: esTotal
      ? `53 × ${fmt(ibm)} × 65/${edad}${aplica_piso ? ` → piso ${fmt(piso)} (${pisos.fuente})` : ""}`
      : `53 × ${fmt(ibm)} × ${pct}% × 65/${edad}${aplica_piso ? ` → piso ${fmt(piso)} (${pisos.fuente})` : ""}`,
    monto: principal,
  });

  // Compensaciones adicionales de pago único (art. 11.4).
  if (tipo === "muerte") {
    rubros.push({ label: "Compensación adicional de pago único", norma: "Art. 11.4.c LRT", detalle: pisos.fuente, monto: pisos.compensacion_11_4_c });
  } else if (esTotal) {
    rubros.push({ label: "Compensación adicional de pago único", norma: "Art. 11.4.b LRT", detalle: pisos.fuente, monto: pisos.compensacion_11_4_b });
  } else if (pct > 50) {
    rubros.push({ label: "Compensación adicional de pago único", norma: "Art. 11.4.a LRT", detalle: `${pisos.fuente} — incapacidad > 50% y < 66%`, monto: pisos.compensacion_11_4_a });
  }

  // Adicional 20% (art. 3 ley 26.773) sobre las prestaciones dinerarias.
  if (aplica_20_por_ciento) {
    const base20 = rubros.reduce((a, r) => a + r.monto, 0);
    let adicional = base20 * 0.2;
    let detalle = `20% × ${fmt(base20)}`;
    if (esTotal && adicional < pisos.minimo_art_3_26773) {
      adicional = pisos.minimo_art_3_26773;
      detalle += ` → mínimo ${fmt(pisos.minimo_art_3_26773)} (${pisos.fuente})`;
    }
    rubros.push({ label: "Adicional por daño no in itinere", norma: "Art. 3 ley 26.773", detalle, monto: adicional });
  } else {
    advertencias.push("No se aplicó el adicional del 20% del art. 3 de la ley 26.773 (solo procede si el daño NO fue in itinere).");
  }

  if (tipo === "gran_invalidez") {
    advertencias.push("Gran invalidez: además corresponde una prestación MENSUAL adicional (art. 17.2 LRT) cuyo monto fija la SRT semestralmente; no está incluida en el pago único.");
  }
  if (edad > 65) {
    advertencias.push("Edad superior a 65: el coeficiente 65/edad resulta menor a 1 (criterio literal de la ley; parte de la jurisprudencia lo cuestiona).");
  }
  advertencias.push("Ingreso base según art. 12 LRT (ley 27.348): promedio de 12 meses actualizado por RIPTE; la prestación devenga intereses desde la primera manifestación invalidante (art. 12.2/12.3).");
  advertencias.push("Trámite previo obligatorio ante la Comisión Médica (ley 27.348; CSJN \"Pogonza\", 2021) antes de la vía judicial.");

  const total = rubros.reduce((a, r) => a + r.monto, 0);
  return { tipo, porcentaje_incapacidad: pct, ingreso_base: ibm, coef_edad, formula, piso, aplica_piso, rubros, total, advertencias, pisos };
}

function fmt(n: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(Math.round(n));
}
