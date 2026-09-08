/**
 * Secuencia de comunicaciones laborales (lado trabajador) — "wizard del
 * despido indirecto". Plantillas determinísticas (sin IA: los telegramas son
 * fórmulas estándar donde la precisión importa más que la redacción) con los
 * plazos legales de cada paso para agendar automáticamente.
 *
 * IMPORTANTE: el profesional debe adaptar cada texto al caso concreto.
 * Los textos están actualizados a la ley 27.742 (art. 99 derogó las multas de
 * los arts. 8/9/10/11/15 ley 24.013, art. 1 ley 25.323 y art. 45 ley 25.345 →
 * indemnización art. 80 LCT) y a la ley 27.802. Para distractos anteriores al
 * 09/07/2024 el letrado puede agregar los apercibimientos de multas a mano.
 */

export interface CampoTelegrama {
  name: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
}

export interface PasoTelegrama {
  id: string;
  titulo: string;
  descripcion: string;
  /** Base legal del paso, para mostrar al abogado. */
  baseLegal: string;
  campos: CampoTelegrama[];
  /** Genera el texto del telegrama con los datos del formulario. */
  generar: (d: Record<string, string>) => string;
  /** Plazo a agendar tras el envío. */
  plazo: { dias: number; titulo: string; descripcion: string } | null;
  /** id del paso siguiente sugerido. */
  siguiente: string | null;
}

const CAMPOS_BASE: CampoTelegrama[] = [
  { name: "empleador", label: "Empleador (razón social)", placeholder: "ACME S.A." },
  { name: "domicilio_empleador", label: "Domicilio del empleador", placeholder: "Av. Siempreviva 123, CABA" },
];

export const PASOS: PasoTelegrama[] = [
  {
    id: "intimacion_registracion",
    titulo: "1 · Intimación a registrar la relación laboral",
    descripcion: "Para trabajo no registrado o mal registrado. Desde la ley 27.742 (09/07/2024) ya no existen las multas de los arts. 8/15 de la ley 24.013: la intimación sirve para constituir en mora al empleador y habilitar el despido indirecto, y deja documentada la deficiente registración (arts. 7 ley 24.013, 52 y 57 LCT).",
    baseLegal: "Art. 7 ley 24.013 · arts. 52, 57, 62, 63 LCT · art. 242/246 LCT (despido indirecto). Multas arts. 8/9/10/15 ley 24.013: derogadas por art. 99 ley 27.742 — solo distractos anteriores al 09/07/2024",
    campos: [
      ...CAMPOS_BASE,
      { name: "fecha_ingreso", label: "Fecha de ingreso real", placeholder: "10/03/2021" },
      { name: "categoria", label: "Categoría y tareas", placeholder: "vendedor, CCT 130/75" },
      { name: "jornada", label: "Jornada", placeholder: "lunes a sábados de 9 a 18" },
      { name: "remuneracion", label: "Remuneración real mensual", placeholder: "$ 950.000" },
    ],
    generar: (d) => `A ${d.empleador || "[EMPLEADOR]"}, ${d.domicilio_empleador || "[DOMICILIO]"}:

Intímole plazo 48 horas proceda a registrar debidamente la relación laboral que nos une (art. 7, ley 24.013; arts. 52 y 57 LCT), con fecha real de ingreso ${d.fecha_ingreso || "[FECHA INGRESO]"}, categoría ${d.categoria || "[CATEGORÍA]"}, jornada de ${d.jornada || "[JORNADA]"} y remuneración mensual de ${d.remuneracion || "[REMUNERACIÓN]"}, abonando las diferencias salariales resultantes, todo bajo apercibimiento de considerar su silencio o negativa (art. 57 LCT) como injuria grave que impide la prosecución del vínculo y de considerarme despedido/a por su exclusiva culpa (arts. 242 y 246 LCT), con más los incrementos del art. 2 de la ley 25.323. Queda Ud. debidamente notificado/a.`,
    plazo: { dias: 4, titulo: "Vence intimación de registración (48 hs + silencio art. 57 LCT)", descripcion: "Si el empleador no regularizó ni respondió en el plazo razonable del art. 57 LCT (usualmente 2 días hábiles), evaluar despido indirecto. Para distractos anteriores al 09/07/2024 conviene además la intimación del art. 11 ley 24.013 (30 días + copia a ARCA)." },
    siguiente: "intimacion_pago",
  },
  {
    id: "intimacion_pago",
    titulo: "2 · Intimación de pago de salarios adeudados",
    descripcion: "Para salarios, SAC o diferencias impagas. La mora salarial es injuria grave que habilita el despido indirecto.",
    baseLegal: "Arts. 57, 128, 137 y 242/246 LCT",
    campos: [
      ...CAMPOS_BASE,
      { name: "conceptos", label: "Conceptos adeudados", placeholder: "salarios de mayo y junio 2026, SAC 1er semestre", multiline: true },
    ],
    generar: (d) => `A ${d.empleador || "[EMPLEADOR]"}, ${d.domicilio_empleador || "[DOMICILIO]"}:

Encontrándose vencidos los plazos del art. 128 LCT, intímole plazo 48 horas abone ${d.conceptos || "[CONCEPTOS ADEUDADOS]"}, con más los intereses correspondientes, bajo apercibimiento de considerarme gravemente injuriado/a y despedido/a por su exclusiva culpa (arts. 242 y 246 LCT). La retención indebida de salarios configura injuria grave que impide la prosecución del vínculo. Queda Ud. debidamente notificado/a.`,
    plazo: { dias: 3, titulo: "Vence intimación de pago (48 hs + margen)", descripcion: "Si no pagó ni respondió, el silencio (art. 57 LCT) habilita a considerar el despido indirecto." },
    siguiente: "despido_indirecto",
  },
  {
    id: "aclaracion_situacion",
    titulo: "Alternativa · Intimación a aclarar situación laboral",
    descripcion: "Para negativa de tareas, suspensiones verbales o despido verbal negado. Fija posición y documenta la injuria.",
    baseLegal: "Arts. 57, 78 y 242/246 LCT",
    campos: [
      ...CAMPOS_BASE,
      { name: "hecho", label: "Qué pasó", placeholder: "desde el 01/07/2026 se me niega el ingreso al establecimiento", multiline: true },
    ],
    generar: (d) => `A ${d.empleador || "[EMPLEADOR]"}, ${d.domicilio_empleador || "[DOMICILIO]"}:

Ante el hecho de que ${d.hecho || "[HECHO: negativa de tareas / despido verbal]"}, intímole plazo 48 horas aclare mi situación laboral y me otorgue tareas efectivas conforme mi categoría (art. 78 LCT), bajo apercibimiento de considerar su silencio o negativa (art. 57 LCT) como injuria grave y considerarme despedido/a por su exclusiva culpa (arts. 242 y 246 LCT). Queda Ud. debidamente notificado/a.`,
    plazo: { dias: 3, titulo: "Vence intimación a aclarar situación (48 hs + margen)", descripcion: "Sin respuesta o con respuesta evasiva, evaluar despido indirecto." },
    siguiente: "despido_indirecto",
  },
  {
    id: "despido_indirecto",
    titulo: "3 · Despido indirecto",
    descripcion: "El paso final: ante el incumplimiento intimado y no subsanado, el trabajador se considera despedido por culpa del empleador y queda habilitado el reclamo indemnizatorio completo.",
    baseLegal: "Arts. 242, 246, 232/233, 245 LCT · art. 2 ley 25.323 (vigente) · art. 80 LCT (certificados; su indemnización fue derogada por art. 99 ley 27.742) · art. 276 LCT actualización IPC+3% (ley 27.802)",
    campos: [
      ...CAMPOS_BASE,
      { name: "incumplimiento", label: "Incumplimiento que motiva el distracto", placeholder: "no haber registrado la relación pese a la intimación del 01/07/2026 / no haber abonado los salarios intimados", multiline: true },
    ],
    generar: (d) => `A ${d.empleador || "[EMPLEADOR]"}, ${d.domicilio_empleador || "[DOMICILIO]"}:

Ante ${d.incumplimiento || "[INCUMPLIMIENTO INTIMADO Y NO SUBSANADO]"}, configurativo de injuria grave que impide la prosecución del vínculo (art. 242 LCT), considérome despedido/a por su exclusiva culpa (art. 246 LCT). Intímole plazo 4 días hábiles abone liquidación final e indemnizaciones por antigüedad, sustitutiva de preaviso e integración del mes de despido (arts. 245, 232 y 233 LCT), con más los incrementos que por derecho correspondan, bajo apercibimiento de accionar judicialmente y de reclamar el incremento del art. 2 de la ley 25.323 y la actualización del art. 276 LCT. Asimismo intímole haga entrega de los certificados de trabajo y de servicios y remuneraciones previstos en el art. 80 LCT, bajo apercibimiento de reclamar judicialmente su entrega y los daños derivados de su omisión. Queda Ud. debidamente notificado/a.`,
    plazo: { dias: 4, titulo: "Vence intimación de pago de la liquidación final (4 días hábiles)", descripcion: "Sin pago: queda expedito el reclamo. Generar la demanda con la calculadora art. 245 (el incremento del art. 2 ley 25.323 requiere esta intimación previa; la calculadora aplica automáticamente el régimen vigente a la fecha del distracto)." },
    siguiente: null,
  },
];

export function getPaso(id: string): PasoTelegrama | undefined {
  return PASOS.find((p) => p.id === id);
}
