/**
 * RÉGIMEN INDEMNIZATORIO SEGÚN LA FECHA DEL DISTRACTO — diferencial del producto.
 *
 * El derecho del trabajo argentino cambió dos veces en menos de dos años y la
 * mayoría de las herramientas del mercado siguen liquidando "como antes":
 *
 * 1. Ley 27.742 "Bases" (B.O. 08/07/2024, vigente desde el 09/07/2024), art. 99:
 *    derogó los arts. 8, 9, 10, 11 y 15 de la ley 24.013, el art. 1 de la ley
 *    25.323, los arts. 43 a 48 de la ley 25.345 (entre ellos el art. 45, que
 *    había incorporado la indemnización del art. 80 LCT) y el art. 50 de la ley
 *    25.877. Sustituyó el art. 92 bis (período de prueba de 6 meses, ampliable
 *    por CCT) e incorporó el art. 245 bis (agravamiento por despido
 *    discriminatorio: 50%, ampliable al 100% por el juez).
 *    El art. 2 de la ley 25.323 NO fue derogado.
 *
 * 2. Ley 27.802 "de Modernización Laboral" (B.O. 06/03/2026): nuevo art. 245
 *    (base sin SAC ni conceptos no mensuales; tope de 3 salarios promedio del
 *    CCT; piso del 67% — codifica "Vizzoti"), art. 231 (sin preaviso en período
 *    de prueba), art. 276 (actualización de créditos laborales por IPC + 3%
 *    anual), art. 55 de la ley (juicios en trámite: tasa pasiva BCRA con techo
 *    IPC+3% y piso del 67% de ese techo), art. 56 (pago en cuotas de sentencias)
 *    y tope de costas del 25%. Una cautelar del JNT N° 63 suspendió parte de
 *    la ley el 30/03/2026; la CNAT Sala VIII la revocó el 23/04/2026 y la ley
 *    está vigente, con impugnaciones artículo por artículo en trámite.
 *
 * Esta función resuelve, a partir de la fecha de despido, qué rubros existen y
 * cuáles ya no. Nada aquí es asesoramiento: el profesional decide.
 */

export type RegimenLaboral = "pre_bases" | "ley_bases" | "modernizacion";

/** Ley 27.742 — vigencia (art. 1 del dec. 592/2024: día siguiente a la publicación). */
export const FECHA_LEY_BASES = "2024-07-09";
/** Ley 27.802 — publicada en el B.O. el 06/03/2026. */
export const FECHA_MODERNIZACION = "2026-03-06";

export interface RegimenInfo {
  regimen: RegimenLaboral;
  nombre: string;
  norma: string;
  vigente_desde: string | null;
  /** Arts. 8/9/10/15 ley 24.013 (relación no registrada o deficientemente registrada). */
  multas_24013: boolean;
  /** Art. 1 ley 25.323 (duplicación por relación no registrada). */
  ley_25323_art1: boolean;
  /** Art. 2 ley 25.323 (50% por falta de pago en término) — sigue vigente. */
  ley_25323_art2: boolean;
  /** Indemnización del art. 80 LCT (3 remuneraciones) — art. 45 ley 25.345. */
  multa_art_80: boolean;
  /** Duración legal del período de prueba (meses). */
  periodo_prueba_meses: 3 | 6;
  /** Preaviso debido durante el período de prueba (meses). */
  preaviso_en_prueba: 0 | 0.5;
  /** La base del art. 245 excluye expresamente el SAC y los conceptos no mensuales. */
  base_excluye_sac: boolean;
  /** Existe el art. 245 bis (agravamiento por despido discriminatorio). */
  art_245_bis: boolean;
  /** Actualización de créditos laborales por IPC + 3% anual (art. 276 LCT). */
  actualizacion_ipc_mas_3: boolean;
  notas: string[];
}

const NOTAS_COMUNES = [
  "Herramienta de asistencia: el profesional verifica cada rubro y la vigencia de la normativa antes de presentar.",
];

export function regimenPorFecha(fechaDespidoISO: string): RegimenInfo {
  const f = (fechaDespidoISO || "").slice(0, 10);

  if (!f || f < FECHA_LEY_BASES) {
    return {
      regimen: "pre_bases",
      nombre: "Régimen anterior a la Ley Bases",
      norma: "LCT t.o. anterior a la ley 27.742",
      vigente_desde: null,
      multas_24013: true,
      ley_25323_art1: true,
      ley_25323_art2: true,
      multa_art_80: true,
      periodo_prueba_meses: 3,
      preaviso_en_prueba: 0.5,
      base_excluye_sac: false,
      art_245_bis: false,
      actualizacion_ipc_mas_3: false,
      notas: [
        "Distracto anterior al 09/07/2024: las multas de las leyes 24.013, 25.323 (art. 1) y 25.345 (art. 80 LCT) estaban vigentes. Su aplicación a juicios en trámite tras la derogación es materia discutida (CNAT Sala II, \"Coudakis\", 29/05/2026, rechazó la inconstitucionalidad de la derogación).",
        ...NOTAS_COMUNES,
      ],
    };
  }

  if (f < FECHA_MODERNIZACION) {
    return {
      regimen: "ley_bases",
      nombre: "Ley Bases (27.742)",
      norma: "LCT según ley 27.742 — art. 99 derogó las multas de las leyes 24.013, 25.323 (art. 1) y 25.345",
      vigente_desde: FECHA_LEY_BASES,
      multas_24013: false,
      ley_25323_art1: false,
      ley_25323_art2: true,
      multa_art_80: false,
      periodo_prueba_meses: 6,
      preaviso_en_prueba: 0.5,
      base_excluye_sac: false,
      art_245_bis: true,
      actualizacion_ipc_mas_3: false,
      notas: [
        "Distracto entre el 09/07/2024 y el 05/03/2026: no corresponden las multas de los arts. 8/9/10/15 ley 24.013, art. 1 ley 25.323 ni la indemnización del art. 80 LCT (derogadas por el art. 99 de la ley 27.742). Subsiste el art. 2 de la ley 25.323.",
        "Período de prueba de 6 meses (art. 92 bis según ley 27.742), ampliable por CCT.",
        "Despido discriminatorio: agravamiento del 50% de la indemnización del art. 245, ampliable al 100% por el juez (art. 245 bis).",
        ...NOTAS_COMUNES,
      ],
    };
  }

  return {
    regimen: "modernizacion",
    nombre: "Modernización Laboral (27.802)",
    norma: "LCT según leyes 27.742 y 27.802",
    vigente_desde: FECHA_MODERNIZACION,
    multas_24013: false,
    ley_25323_art1: false,
    ley_25323_art2: true,
    multa_art_80: false,
    periodo_prueba_meses: 6,
    preaviso_en_prueba: 0,
    base_excluye_sac: true,
    art_245_bis: true,
    actualizacion_ipc_mas_3: true,
    notas: [
      "Distracto desde el 06/03/2026 (ley 27.802): la base del art. 245 es la mejor remuneración mensual, normal y habitual del último año, SIN incidencia del SAC ni de conceptos de pago no mensual; el tope es de 3 veces el salario promedio del CCT y la base nunca puede ser inferior al 67% de la remuneración real (piso Vizzoti codificado).",
      "Sin preaviso durante el período de prueba (art. 231 según ley 27.802).",
      "Actualización del crédito: IPC INDEC + 3% anual desde que cada suma es debida (art. 276 LCT). Para juicios en trámite rige el art. 55 de la ley 27.802 (tasa pasiva BCRA con techo IPC+3% y piso del 67%), declarado inconstitucional por algunas Salas de la CNAT: conviene liquidar de las dos formas.",
      "La vigencia de la ley 27.802 fue suspendida parcialmente por cautelar (30/03/2026) y restablecida por la CNAT Sala VIII (23/04/2026); persisten impugnaciones. Verificar el estado al momento de presentar.",
      ...NOTAS_COMUNES,
    ],
  };
}

/** Texto corto para mostrar junto a un cálculo. */
export function etiquetaRegimen(info: RegimenInfo): string {
  return info.vigente_desde
    ? `${info.nombre} · vigente desde ${info.vigente_desde.split("-").reverse().join("/")}`
    : info.nombre;
}

/**
 * Bloque de contexto normativo para inyectar en los prompts de IA. Es la forma
 * más barata de evitar que el modelo reproduzca escritos "viejos" (reclamos de
 * arts. 8/15 LNE, art. 80, art. 1 ley 25.323) que sigue viendo en su
 * entrenamiento.
 */
export const CONTEXTO_REFORMAS_2024_2026 = `CAMBIOS NORMATIVOS RECIENTES QUE DEBÉS RESPETAR (no los omitas ni los contradigas):
- Ley 27.742 "Bases" (vigente desde el 09/07/2024), art. 99: DEROGÓ los arts. 8, 9, 10, 11 y 15 de la ley 24.013, el art. 1 de la ley 25.323, los arts. 43 a 48 de la ley 25.345 (incluida la indemnización del art. 80 LCT por falta de entrega de certificados) y el art. 50 de la ley 25.877. Para despidos posteriores a esa fecha NO reclames esas multas. El art. 2 de la ley 25.323 (50% por falta de pago en término) SIGUE VIGENTE. Período de prueba: 6 meses (art. 92 bis). Art. 245 bis: agravamiento del 50% (hasta 100%) por despido discriminatorio. El organismo recaudador se llama ARCA (ex AFIP, dec. 953/2024).
- Ley 27.802 "de Modernización Laboral" (B.O. 06/03/2026, vigente, con impugnaciones judiciales en trámite): art. 245 LCT nuevo (base = mejor remuneración mensual, normal y habitual del último año, excluidos SAC y conceptos no mensuales; tope 3 salarios promedio del CCT; piso 67%); art. 231 (sin preaviso en período de prueba); art. 276 LCT (créditos laborales se actualizan por IPC INDEC + 3% anual); art. 55 de la ley (juicios en trámite: tasa pasiva BCRA con techo IPC+3% y piso 67%); art. 56 (pago de sentencias en hasta 6 cuotas, 12 para PyMEs); costas y honorarios limitados al 25% del monto de sentencia; Fondo de Asistencia Laboral (vigencia postergada al 01/11/2026, no reduce la indemnización debida por el empleador).
- Intereses laborales en CABA: la CSJN en "Oliva c/ Coma" (29/02/2024) descalificó la capitalización del Acta CNAT 2764; NO cites el Acta 2764 como vigente.
- Ley 24.557 art. 39 inc. 1: derogado por la ley 26.773 (2012). No pidas su inconstitucionalidad.
Si el usuario reclama un rubro derogado, incluilo SOLO si la fecha del distracto es anterior a la derogación y aclaralo expresamente.`;
