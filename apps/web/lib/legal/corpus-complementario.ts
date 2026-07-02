import type { Ley, LeyArticulo } from "./corpus";

/**
 * Corpus complementario: leyes especiales y artículos adicionales.
 *
 * REGLA DE ORO: solo se cargan artículos cuyo contenido esté verificado.
 * Los textos son síntesis fieles de la norma (no transcripciones literales);
 * el abogado siempre debe confrontar con la fuente oficial (InfoLeg/SAIJ).
 */

/** Artículos que se AGREGAN a la LCT ya cargada en corpus.ts. */
export const LCT_ARTICULOS_EXTRA: LeyArticulo[] = [
  { numero: "75", titulo: "Deber de seguridad", texto: "El empleador debe hacer observar las pautas y limitaciones a la duracion del trabajo y las normas de seguridad e higiene, adoptando las medidas necesarias para tutelar la integridad psicofisica y la dignidad de los trabajadores." },
  { numero: "103", titulo: "Concepto de remuneracion", texto: "Se entiende por remuneracion la contraprestacion que debe percibir el trabajador como consecuencia del contrato de trabajo. El empleador debe al trabajador la remuneracion aunque este no preste servicios, por la mera circunstancia de haber puesto su fuerza de trabajo a disposicion de aquel." },
  { numero: "121", titulo: "Sueldo anual complementario — concepto", texto: "Se entiende por sueldo anual complementario la doceava parte del total de las remuneraciones percibidas por el trabajador en el respectivo ano calendario. Conforme la ley 23.041, se abona sobre el calculo del 50% de la mayor remuneracion mensual devengada por todo concepto dentro de cada semestre." },
  { numero: "122", titulo: "Epocas de pago del SAC", texto: "El sueldo anual complementario se abona en dos cuotas: la primera con vencimiento el 30 de junio y la segunda con vencimiento el 18 de diciembre de cada ano." },
  { numero: "123", titulo: "SAC proporcional en la extincion", texto: "Cuando se opere la extincion del contrato de trabajo por cualquier causa, el trabajador o sus derechohabientes tendran derecho a percibir la parte del sueldo anual complementario proporcional a la fraccion del semestre trabajada." },
  { numero: "150", titulo: "Vacaciones — plazos segun antiguedad", texto: "El trabajador gozara de un periodo minimo y continuado de descanso anual remunerado: 14 dias corridos con antiguedad no mayor de 5 anos; 21 dias con antiguedad mayor de 5 y hasta 10 anos; 28 dias con antiguedad mayor de 10 y hasta 20 anos; 35 dias con antiguedad superior a 20 anos." },
  { numero: "155", titulo: "Retribucion de las vacaciones", texto: "Para los trabajadores mensualizados, la retribucion de las vacaciones se determina dividiendo por 25 el importe del sueldo que perciba al momento de su otorgamiento, multiplicado por los dias de vacaciones que correspondan." },
  { numero: "156", titulo: "Indemnizacion por vacaciones no gozadas", texto: "Cuando por cualquier causa se produzca la extincion del contrato de trabajo, el trabajador tendra derecho a percibir una indemnizacion equivalente al salario correspondiente al periodo de descanso proporcional a la fraccion del ano trabajada." },
  { numero: "208", titulo: "Enfermedad — plazos de licencia paga", texto: "Cada accidente o enfermedad inculpable que impida la prestacion del servicio no afectara el derecho del trabajador a percibir su remuneracion durante un periodo de 3 meses si su antiguedad fuese menor de 5 anos, y de 6 meses si fuera mayor. Si el trabajador tuviere cargas de familia, los periodos se extienden a 6 y 12 meses respectivamente." },
  { numero: "212", titulo: "Reincorporacion e incapacidad definitiva", texto: "Vigente el plazo de conservacion del empleo, si del accidente o enfermedad resultase una disminucion definitiva en la capacidad laboral del trabajador, el empleador debera asignarle tareas acordes sin disminucion de su remuneracion. Si no pudiera hacerlo por causa que no le fuere imputable, debera abonar una indemnizacion igual a la del art. 247. Si estando en condiciones de hacerlo no le asignara tareas, la indemnizacion sera la del art. 245. Cuando la incapacidad sea absoluta, corresponde una indemnizacion igual a la del art. 245." },
  { numero: "213", titulo: "Despido durante la enfermedad", texto: "Si el empleador despidiese al trabajador durante el plazo de las interrupciones pagas por accidente o enfermedad inculpable, debera abonar, ademas de las indemnizaciones por despido injustificado, los salarios correspondientes a todo el tiempo que faltare para el vencimiento de aquella o a la fecha del alta, segun demostracion que hiciese el trabajador." },
  { numero: "247", titulo: "Indemnizacion por fuerza mayor o falta de trabajo", texto: "En los casos de despido por fuerza mayor o por falta o disminucion de trabajo no imputable al empleador fehacientemente justificada, el trabajador tendra derecho a percibir una indemnizacion equivalente a la mitad de la prevista en el articulo 245. El despido debera comenzar por el personal menos antiguo dentro de cada especialidad." },
];

/** Leyes complementarias que se suman al corpus. */
export const LEYES_COMPLEMENTARIAS: Ley[] = [
  {
    id: "l25323",
    nombre: "Ley 25.323 — Incremento de indemnizaciones laborales",
    nombre_corto: "Ley 25.323",
    numero: "25.323",
    area: "laboral",
    descripcion: "Incrementa las indemnizaciones por despido en caso de relacion no registrada o de falta de pago que obligue a litigar.",
    articulos: [
      { numero: "1", titulo: "Duplicacion por relacion no registrada", texto: "Las indemnizaciones previstas por el art. 245 LCT o las que en el futuro las reemplacen seran incrementadas al doble cuando se trate de una relacion laboral que al momento del despido no este registrada o lo este de modo deficiente." },
      { numero: "2", titulo: "Incremento del 50% por falta de pago", texto: "Cuando el empleador, fehacientemente intimado por el trabajador, no le abonare las indemnizaciones previstas en los arts. 232, 233 y 245 LCT y, consecuentemente, lo obligare a iniciar acciones judiciales o cualquier instancia previa de caracter obligatorio para percibirlas, estas seran incrementadas en un 50%. Los jueces podran reducir prudencialmente el incremento hasta su eximicion si hubieran existido causas que justificaren la conducta del empleador." },
    ],
  },
  {
    id: "lne",
    nombre: "Ley Nacional de Empleo",
    nombre_corto: "LNE",
    numero: "24.013",
    area: "laboral",
    descripcion: "Regula el empleo y sanciona el trabajo no registrado con indemnizaciones a favor del trabajador. Verificar vigencia de los arts. 8 a 15 tras las reformas laborales recientes.",
    articulos: [
      { numero: "8", titulo: "Empleo no registrado", texto: "El empleador que no registrare una relacion laboral abonara al trabajador afectado una indemnizacion equivalente a una cuarta parte de las remuneraciones devengadas desde el comienzo de la vinculacion, computadas a valores reajustados. VERIFICAR VIGENCIA: este regimen fue alcanzado por reformas laborales recientes." },
      { numero: "9", titulo: "Fecha de ingreso falsa", texto: "El empleador que consignare en la documentacion laboral una fecha de ingreso posterior a la real abonara una indemnizacion equivalente a la cuarta parte de las remuneraciones devengadas desde la fecha de ingreso real hasta la fecha falsamente consignada. VERIFICAR VIGENCIA tras reformas recientes." },
      { numero: "10", titulo: "Remuneracion menor a la real", texto: "El empleador que consignare en la documentacion laboral una remuneracion menor que la percibida abonara una indemnizacion equivalente a la cuarta parte del importe de las remuneraciones devengadas y no registradas. VERIFICAR VIGENCIA tras reformas recientes." },
      { numero: "11", titulo: "Requisitos de procedencia", texto: "Las indemnizaciones de los arts. 8, 9 y 10 proceden cuando el trabajador o la asociacion sindical intime al empleador de modo fehaciente a fin de que regularice la situacion, y remita copia del requerimiento a la AFIP dentro de las 24 horas habiles siguientes." },
      { numero: "15", titulo: "Despido posterior a la intimacion", texto: "Si el empleador despidiere sin causa justificada al trabajador dentro de los 2 anos desde que se le hubiere cursado de modo justificado la intimacion del art. 11, el trabajador tendra derecho a percibir el doble de las indemnizaciones que le hubieren correspondido por el despido. VERIFICAR VIGENCIA tras reformas recientes." },
    ],
  },
  {
    id: "l25345",
    nombre: "Ley 25.345 — Prevencion de la evasion fiscal (art. 45: certificados de trabajo)",
    nombre_corto: "Ley 25.345",
    numero: "25.345",
    area: "laboral",
    descripcion: "Su art. 45 agrega al art. 80 LCT la indemnizacion por falta de entrega de los certificados de trabajo.",
    articulos: [
      { numero: "45", titulo: "Sancion por falta de entrega de certificados (art. 80 LCT)", texto: "Si el empleador no hiciera entrega de la constancia o del certificado de trabajo previstos en el art. 80 LCT dentro de los 2 dias habiles computados a partir del dia siguiente a la recepcion del requerimiento fehaciente del trabajador, sera sancionado con una indemnizacion a favor de este ultimo equivalente a 3 veces la mejor remuneracion mensual, normal y habitual percibida durante el ultimo ano o durante el tiempo de prestacion de servicios si este fuere menor." },
    ],
  },
  {
    id: "l27555",
    nombre: "Ley de Teletrabajo",
    nombre_corto: "Ley 27.555",
    numero: "27.555",
    area: "laboral",
    descripcion: "Regimen legal del contrato de teletrabajo (incorpora el art. 102 bis a la LCT).",
    articulos: [
      { numero: "5", titulo: "Derecho a la desconexion digital", texto: "La persona que trabaja bajo la modalidad de teletrabajo tiene derecho a no ser contactada y a desconectarse de los dispositivos digitales y/o tecnologias de la informacion y comunicacion fuera de su jornada laboral y durante los periodos de licencias. No podra ser sancionada por hacer uso de este derecho." },
      { numero: "8", titulo: "Reversibilidad", texto: "El consentimiento prestado por la persona que trabaja en posicion presencial para pasar a la modalidad de teletrabajo podra ser revocado por la misma en cualquier momento de la relacion. En tal caso, el empleador debera otorgarle tareas en el establecimiento en el cual las hubiera prestado anteriormente, o en su defecto en el mas cercano al domicilio del dependiente." },
      { numero: "9", titulo: "Elementos de trabajo", texto: "El empleador debe proporcionar el equipamiento —hardware y software—, las herramientas de trabajo y el soporte necesario para el desempeno de las tareas, y asumir los costos de instalacion, mantenimiento y reparacion de las mismas, o la compensacion por la utilizacion de herramientas propias de la persona que trabaja." },
    ],
  },
  {
    id: "l23592",
    nombre: "Ley de Actos Discriminatorios",
    nombre_corto: "Ley 23.592",
    numero: "23.592",
    area: "laboral",
    descripcion: "Sanciona los actos discriminatorios. Base normativa de la nulidad del despido discriminatorio (doctrina 'Alvarez c/ Cencosud').",
    articulos: [
      { numero: "1", titulo: "Actos discriminatorios — cese y reparacion", texto: "Quien arbitrariamente impida, obstruya, restrinja o de algun modo menoscabe el pleno ejercicio sobre bases igualitarias de los derechos y garantias fundamentales reconocidos en la Constitucion Nacional, sera obligado, a pedido del damnificado, a dejar sin efecto el acto discriminatorio o cesar en su realizacion y a reparar el dano moral y material ocasionados. Se consideraran particularmente los actos discriminatorios determinados por motivos tales como raza, religion, nacionalidad, ideologia, opinion politica o gremial, sexo, posicion economica, condicion social o caracteres fisicos." },
    ],
  },
  {
    id: "l26773",
    nombre: "Regimen de ordenamiento de la reparacion de los danos derivados de los accidentes de trabajo",
    nombre_corto: "Ley 26.773",
    numero: "26.773",
    area: "laboral",
    descripcion: "Complementa la LRT 24.557. Regula la opcion entre la via sistemica y la accion civil, y el adicional de pago unico.",
    articulos: [
      { numero: "3", titulo: "Adicional del 20% por dano en el lugar de trabajo", texto: "Cuando el dano se produzca en el lugar de trabajo o lo sufra el dependiente mientras se encuentre a disposicion del empleador, el damnificado (trabajador victima o sus derechohabientes) percibira junto a las indemnizaciones dinerarias previstas en el regimen, una indemnizacion adicional de pago unico en compensacion por cualquier otro dano no reparado por las formulas alli previstas, equivalente al 20% de esa suma. No aplica a los accidentes in itinere." },
      { numero: "4", titulo: "Opcion excluyente", texto: "Los obligados por la ley 24.557 deberan, dentro de los 15 dias de notificados de la muerte del trabajador o de la homologacion o determinacion de la incapacidad laboral, notificar fehacientemente a los damnificados los importes que les corresponde percibir. Los damnificados podran optar de modo excluyente entre las indemnizaciones previstas en este regimen de reparacion o las que les pudieran corresponder con fundamento en otros sistemas de responsabilidad (opcion con renuncia)." },
    ],
  },
  {
    id: "cn",
    nombre: "Constitucion Nacional",
    nombre_corto: "CN",
    numero: "CN",
    area: "constitucional",
    descripcion: "Norma suprema. El art. 14 bis es el fundamento constitucional del derecho del trabajo argentino.",
    articulos: [
      { numero: "14 bis", titulo: "Derechos del trabajador", texto: "El trabajo en sus diversas formas gozara de la proteccion de las leyes, las que aseguraran al trabajador: condiciones dignas y equitativas de labor; jornada limitada; descanso y vacaciones pagados; retribucion justa; salario minimo vital movil; igual remuneracion por igual tarea; participacion en las ganancias de las empresas; proteccion contra el despido arbitrario; estabilidad del empleado publico; organizacion sindical libre y democratica. Los gremios tienen garantizado: concertar convenios colectivos de trabajo; recurrir a la conciliacion y al arbitraje; el derecho de huelga. El Estado otorgara los beneficios de la seguridad social, que tendra caracter de integral e irrenunciable." },
      { numero: "17", titulo: "Derecho de propiedad", texto: "La propiedad es inviolable, y ningun habitante de la Nacion puede ser privado de ella, sino en virtud de sentencia fundada en ley." },
      { numero: "18", titulo: "Debido proceso y defensa en juicio", texto: "Ningun habitante de la Nacion puede ser penado sin juicio previo fundado en ley anterior al hecho del proceso, ni juzgado por comisiones especiales, o sacado de los jueces designados por la ley antes del hecho de la causa. Es inviolable la defensa en juicio de la persona y de los derechos." },
    ],
  },
];

/** Artículos que se AGREGAN al CCCN ya cargado en corpus.ts. */
export const CCCN_ARTICULOS_EXTRA: LeyArticulo[] = [
  { numero: "1740", titulo: "Reparacion plena", texto: "La reparacion del dano debe ser plena. Consiste en la restitucion de la situacion del damnificado al estado anterior al hecho danoso, sea por el pago en dinero o en especie." },
  { numero: "1741", titulo: "Indemnizacion de las consecuencias no patrimoniales", texto: "Esta legitimado para reclamar la indemnizacion de las consecuencias no patrimoniales el damnificado directo. Si del hecho resulta su muerte o sufre gran discapacidad tambien tienen legitimacion a titulo personal, segun las circunstancias, los ascendientes, los descendientes, el conyuge y quienes convivian con aquel recibiendo trato familiar ostensible. El monto de la indemnizacion debe fijarse ponderando las satisfacciones sustitutivas y compensatorias que pueden procurar las sumas reconocidas." },
  { numero: "1744", titulo: "Prueba del dano", texto: "El dano debe ser acreditado por quien lo invoca, excepto que la ley lo impute o presuma, o que surja notorio de los propios hechos." },
  { numero: "1748", titulo: "Curso de los intereses", texto: "El curso de los intereses comienza desde que se produce cada perjuicio." },
  { numero: "2561", titulo: "Plazos especiales de prescripcion", texto: "El reclamo del resarcimiento de danos por agresiones sexuales infligidas a personas incapaces prescribe a los 10 anos. El reclamo de la indemnizacion de danos derivados de la responsabilidad civil prescribe a los 3 anos. Las acciones civiles derivadas de delitos de lesa humanidad son imprescriptibles." },
];
