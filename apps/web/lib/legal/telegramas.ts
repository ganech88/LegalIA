/**
 * Secuencia de comunicaciones laborales (lado trabajador) — "wizard del
 * despido indirecto". Plantillas determinísticas (sin IA: los telegramas son
 * fórmulas estándar donde la precisión importa más que la redacción) con los
 * plazos legales de cada paso para agendar automáticamente.
 *
 * IMPORTANTE: el profesional debe adaptar cada texto al caso concreto y
 * verificar la vigencia normativa (en especial el régimen de multas de la
 * ley 24.013, alcanzado por reformas recientes).
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
    descripcion: "Para trabajo no registrado o mal registrado. Abre la vía de las indemnizaciones de la ley 24.013 y exige copia a AFIP dentro de las 24 hs.",
    baseLegal: "Arts. 8/11 y 15, ley 24.013 (verificar vigencia tras reformas recientes) · art. 57 LCT",
    campos: [
      ...CAMPOS_BASE,
      { name: "fecha_ingreso", label: "Fecha de ingreso real", placeholder: "10/03/2021" },
      { name: "categoria", label: "Categoría y tareas", placeholder: "vendedor, CCT 130/75" },
      { name: "jornada", label: "Jornada", placeholder: "lunes a sábados de 9 a 18" },
      { name: "remuneracion", label: "Remuneración real mensual", placeholder: "$ 950.000" },
    ],
    generar: (d) => `A ${d.empleador || "[EMPLEADOR]"}, ${d.domicilio_empleador || "[DOMICILIO]"}:

Intímole plazo 30 días corridos (art. 11, ley 24.013) proceda a registrar debidamente la relación laboral que nos une, con fecha real de ingreso ${d.fecha_ingreso || "[FECHA INGRESO]"}, categoría ${d.categoria || "[CATEGORÍA]"}, jornada de ${d.jornada || "[JORNADA]"} y remuneración mensual de ${d.remuneracion || "[REMUNERACIÓN]"}, todo bajo apercibimiento de considerarme gravemente injuriado/a y despedido/a por su exclusiva culpa, y de reclamar las indemnizaciones de los arts. 8, 15 y concordantes de la ley 24.013. Notifícole que en el día de la fecha remito copia de la presente a la AFIP (art. 11, inc. b, ley 24.013). Queda Ud. debidamente notificado/a.`,
    plazo: { dias: 30, titulo: "Vence intimación de registración (30 días, art. 11 LNE)", descripcion: "Si el empleador no regularizó ni respondió, evaluar despido indirecto. Recordar: copia a AFIP dentro de las 24 hs del envío." },
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
    baseLegal: "Arts. 242, 246, 232/233, 245 LCT · art. 80 LCT (texto ley 25.345) · art. 15 ley 24.013 si hubo intimación registral",
    campos: [
      ...CAMPOS_BASE,
      { name: "incumplimiento", label: "Incumplimiento que motiva el distracto", placeholder: "no haber registrado la relación pese a la intimación del 01/07/2026 / no haber abonado los salarios intimados", multiline: true },
    ],
    generar: (d) => `A ${d.empleador || "[EMPLEADOR]"}, ${d.domicilio_empleador || "[DOMICILIO]"}:

Ante ${d.incumplimiento || "[INCUMPLIMIENTO INTIMADO Y NO SUBSANADO]"}, configurativo de injuria grave que impide la prosecución del vínculo (art. 242 LCT), considérome despedido/a por su exclusiva culpa (art. 246 LCT). Intímole plazo 4 días hábiles abone liquidación final e indemnizaciones por antigüedad, sustitutiva de preaviso e integración del mes de despido (arts. 245, 232 y 233 LCT), con más los incrementos que por derecho correspondan, bajo apercibimiento de accionar judicialmente (ley 25.323). Asimismo intímole plazo 2 días hábiles ponga a mi disposición los certificados del art. 80 LCT, bajo apercibimiento de la indemnización allí prevista (art. 45, ley 25.345). Queda Ud. debidamente notificado/a.`,
    plazo: { dias: 4, titulo: "Vence intimación de pago de la liquidación final (4 días hábiles)", descripcion: "Sin pago: queda expedito el reclamo. Generar la demanda con la calculadora art. 245 (los incrementos de la ley 25.323 requieren esta intimación previa)." },
    siguiente: null,
  },
];

export function getPaso(id: string): PasoTelegrama | undefined {
  return PASOS.find((p) => p.id === id);
}
