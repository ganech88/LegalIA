export interface LeyArticulo {
  numero: string;
  titulo: string;
  texto: string;
  /** Presente cuando el artículo fue derogado: el semáforo lo marca en vez de validarlo. */
  vigencia?: { derogado_por: string; desde: string; nota?: string };
}

export interface Ley {
  id: string;
  nombre: string;
  nombre_corto: string;
  numero: string;
  area: string;
  descripcion: string;
  articulos: LeyArticulo[];
}

export interface Fallo {
  id: string;
  caratula: string;
  tribunal: string;
  fecha: string;
  tema: string;
  area: string;
  sumario: string;
  voces: string[];
  /**
   * true  = fallo verificado (cita confirmada), se inyecta al asistente IA.
   * false = criterio ilustrativo cuya cita exacta NO está confirmada; se muestra
   *         en la biblioteca con aviso pero NO se usa como "fuente verificada".
   */
  verificado: boolean;
}

import {
  LCT_ARTICULOS_EXTRA,
  CCCN_ARTICULOS_EXTRA,
  LEYES_COMPLEMENTARIAS,
} from "./corpus-complementario";

const LEYES_BASE: Ley[] = [
  {
    id: "lct",
    nombre: "Ley de Contrato de Trabajo",
    nombre_corto: "LCT",
    numero: "20.744",
    area: "laboral",
    descripcion: "Regula las relaciones laborales individuales en Argentina. Establece derechos y obligaciones de trabajadores y empleadores.",
    articulos: [
      { numero: "1", titulo: "Fuentes de regulacion", texto: "El contrato de trabajo y la relacion de trabajo se rigen: a) Por esta ley; b) Por las leyes y estatutos profesionales; c) Por las convenciones colectivas o laudos con fuerza de tales; d) Por la voluntad de las partes; e) Por los usos y costumbres." },
      { numero: "4", titulo: "Concepto de trabajo", texto: "Constituye trabajo, a los fines de esta ley, toda actividad licita que se preste en favor de quien tiene la facultad de dirigirla, mediante una remuneracion." },
      { numero: "14", titulo: "Nulidad por fraude laboral", texto: "Sera nulo todo contrato por el cual las partes hayan procedido con simulacion o fraude a la ley laboral, sea aparentando normas contractuales no laborales, interposicion de personas o de cualquier otro medio." },
      { numero: "21", titulo: "Contrato de trabajo", texto: "Habra contrato de trabajo, cualquiera sea su forma o denominacion, siempre que una persona fisica se obligue a realizar actos, ejecutar obras o prestar servicios en favor de la otra y bajo la dependencia de esta, durante un periodo determinado o indeterminado de tiempo, mediante el pago de una remuneracion." },
      { numero: "23", titulo: "Presuncion de existencia del contrato", texto: "El hecho de la prestacion de servicios hace presumir la existencia de un contrato de trabajo, salvo que por las circunstancias, las relaciones o causas que lo motiven se demostrase lo contrario." },
      { numero: "80", titulo: "Deber de observar las obligaciones frente a los organismos sindicales y de la seguridad social — Certificado de trabajo", texto: "La obligacion de ingresar los fondos de seguridad social por parte del empleador y los sindicales a su cargo, ya sea como obligado directo o como agente de retencion, configurara asimismo una obligacion contractual. El empleador, por su parte, debera dar al trabajador, cuando este lo requiriese a la epoca de la extincion de la relacion, constancia documentada de ello. Cuando el contrato de trabajo se extinguiere por cualquier causa, el empleador estara obligado a entregar al trabajador un certificado de trabajo, conteniendo las indicaciones sobre el tiempo de prestacion de servicios, naturaleza de estos, constancia de los sueldos percibidos y de los aportes y contribuciones efectuados a los organismos de la seguridad social. NOTA: la indemnizacion de 3 remuneraciones por falta de entrega (parrafo incorporado por el art. 45 de la ley 25.345) fue derogada por el art. 99 de la ley 27.742 (vigente desde el 09/07/2024); subsiste la obligacion de entregar los certificados." },
      { numero: "9", titulo: "Principio in dubio pro operario", texto: "En caso de duda sobre la aplicacion de normas legales o convencionales prevalecera la mas favorable al trabajador. Si la duda recayese en la interpretacion o alcance de la ley, o en la apreciacion de la prueba, los jueces se decidiran en el sentido mas favorable al trabajador." },
      { numero: "66", titulo: "Ius variandi", texto: "El empleador esta facultado para introducir cambios relativos a la forma y modalidades de la prestacion del trabajo, en tanto no importen un ejercicio irrazonable de esa facultad, ni alteren modalidades esenciales del contrato, ni causen perjuicio material ni moral al trabajador. Ante su ejercicio abusivo el trabajador podra considerarse despedido sin justa causa o accionar para restablecer las condiciones alteradas." },
      { numero: "92 bis", titulo: "Periodo de prueba (texto segun ley 27.742)", texto: "El contrato de trabajo por tiempo indeterminado, excepto el referido en el articulo 96, se entendera celebrado a prueba durante los primeros seis (6) meses de vigencia. Los convenios colectivos de trabajo pueden ampliar dicho periodo de prueba hasta ocho (8) meses para las empresas de seis (6) a cien (100) trabajadores y hasta doce (12) meses para las de hasta cinco (5) trabajadores. Cualquiera de las partes podra extinguir la relacion durante ese lapso sin expresion de causa, sin derecho a indemnizacion con motivo de la extincion. Un empleador no puede contratar a un mismo trabajador mas de una vez utilizando el periodo de prueba. NOTA: hasta el 08/07/2024 el periodo era de tres (3) meses; desde la ley 27.802 (06/03/2026) no se requiere preaviso durante el periodo de prueba (art. 231)." },
      { numero: "178", titulo: "Presuncion de despido por maternidad", texto: "Se presume, salvo prueba en contrario, que el despido de la mujer trabajadora obedece a razones de maternidad o embarazo cuando se dispusiera dentro del plazo de siete meses y medio anteriores o posteriores a la fecha del parto, siempre que la mujer haya cumplido con la notificacion del embarazo. En tal caso procede la indemnizacion agravada del art. 182." },
      { numero: "182", titulo: "Indemnizacion por maternidad/matrimonio", texto: "En caso de despido por causa de embarazo o maternidad, el empleador abonara una indemnizacion equivalente a un (1) ano de remuneraciones, que se acumula a la establecida en el art. 245." },
      { numero: "242", titulo: "Justa causa de despido", texto: "Una de las partes podra hacer denuncia del contrato de trabajo en caso de inobservancia por la otra de las obligaciones resultantes del mismo que configuren injuria y que, por su gravedad, no consientan la prosecucion de la relacion. La valoracion debera ser hecha prudencialmente por los jueces, segun las modalidades y circunstancias de cada caso." },
      { numero: "243", titulo: "Comunicacion e invariabilidad de la causa", texto: "El despido por justa causa dispuesto por el empleador, como la denuncia del contrato fundada en justa causa por el trabajador, deberan comunicarse por escrito con expresion suficientemente clara de los motivos en que se funda la ruptura. Ante la demanda no se admitira la modificacion de la causal de despido consignada en la comunicacion." },
      { numero: "231", titulo: "Preaviso — plazos (texto segun ley 27.802)", texto: "El contrato de trabajo no podra ser disuelto por voluntad de una de las partes, sin previo aviso, o en su defecto, indemnizacion ademas de la que corresponda al trabajador por su antiguedad en el empleo, cuando el contrato se disuelva por voluntad del empleador. El preaviso, cuando las partes no lo fijen en un termino mayor, debera darse con la anticipacion siguiente: a) por el trabajador, de quince (15) dias; b) por el empleador, de un (1) mes cuando el trabajador tuviese una antiguedad en el empleo que no exceda de cinco (5) anos y de dos (2) meses cuando fuere superior. Para el supuesto en que el trabajador se encuentre en periodo de prueba no se requerira la obligacion de preaviso. NOTA: hasta el 05/03/2026 el empleador debia preavisar con quince (15) dias durante el periodo de prueba." },
      { numero: "232", titulo: "Indemnizacion sustitutiva del preaviso", texto: "La parte que omita el preaviso o lo otorgue de modo insuficiente debera abonar a la otra una indemnizacion sustitutiva equivalente a la remuneracion que corresponderia al trabajador durante los plazos senalados en el articulo 231." },
      { numero: "233", titulo: "Integracion del mes de despido", texto: "Cuando la extincion del contrato de trabajo dispuesta por el empleador se produzca sin preaviso y en fecha que no coincida con el ultimo dia del mes, la indemnizacion sustitutiva debida al trabajador se integrara con una suma igual a los salarios por los dias faltantes hasta el ultimo dia del mes en el que se produjera el despido." },
      { numero: "245 bis", titulo: "Agravamiento indemnizatorio por despido discriminatorio (ley 27.742)", texto: "Sera considerado despido por un acto de discriminacion aquel originado por motivos de raza o etnia, religion, nacionalidad, ideologia, opinion politica o gremial, sexo o genero, orientacion sexual, posicion economica, caracteres fisicos o discapacidad. En este supuesto la prueba estara a cargo de quien invoque la causal, y en caso de sentencia judicial que corrobore el caracter discriminatorio del despido, correspondera el pago de una indemnizacion agravada especial que ascendera a un monto equivalente al cincuenta por ciento (50%) de la establecida por el articulo 245 LCT. Segun la gravedad de los hechos, los jueces podran incrementar esta indemnizacion hasta el cien por ciento (100%). El despido dispuesto, en todos los casos, producira la extincion definitiva del vinculo laboral a todos los efectos, no procediendo la reinstalacion." },
      { numero: "276", titulo: "Actualizacion de creditos laborales (texto segun ley 27.802)", texto: "Los creditos provenientes de las relaciones individuales de trabajo seran actualizados, desde la fecha en que cada suma es debida y hasta su efectivo pago, conforme la variacion que experimente el Indice de Precios al Consumidor (IPC) Nivel General elaborado por el INDEC, con mas una tasa de interes pura del tres por ciento (3%) anual. NOTA: para los juicios en tramite sin sentencia firme rige el art. 55 de la ley 27.802 (tasa pasiva BCRA con techo IPC+3% y piso del 67% de dicho techo), cuya constitucionalidad esta discutida en la CNAT." },
      { numero: "245", titulo: "Indemnizacion por antiguedad o despido (texto segun ley 27.802)", texto: "En los casos de despido dispuesto por el empleador sin justa causa, habiendo o no mediado preaviso, este debera abonar al trabajador una indemnizacion equivalente a un (1) mes de sueldo por cada ano de servicio o fraccion mayor de tres (3) meses, tomando como base la mejor remuneracion mensual, normal y habitual devengada durante el ultimo ano o durante el tiempo de prestacion de servicios si este fuera menor. En la base de calculo no tendran incidencia los conceptos de pago no mensuales, como el sueldo anual complementario, ni las gratificaciones o premios de pago no mensual. Dicha base no podra exceder el equivalente a tres (3) veces el importe del salario mensual promedio de todas las remuneraciones previstas en el convenio colectivo de trabajo aplicable al trabajador. En ningun caso la base de calculo podra ser inferior al sesenta y siete por ciento (67%) de la mejor remuneracion mensual, normal y habitual (doctrina Vizzoti, CSJN 14/09/2004, hoy texto legal). El importe de esta indemnizacion en ningun caso podra ser inferior a un (1) mes de sueldo calculado sobre la base del sistema establecido en el primer parrafo. Mediante convenio colectivo las partes pueden sustituir el presente regimen por un fondo o sistema de cese laboral (art. 245 segun ley 27.742). NOTA: para despidos anteriores al 06/03/2026 rige el texto anterior, sin la exclusion expresa del SAC (aunque el plenario CNAT 322 'Tulosai', 19/11/2009, ya lo excluia) y sin el piso legal del 67%." },
      { numero: "246", titulo: "Despido indirecto", texto: "Cuando el trabajador hiciese denuncia del contrato de trabajo fundado en justa causa, tendra derecho a las indemnizaciones previstas en los articulos 232, 233 y 245." },
      { numero: "256", titulo: "Prescripcion", texto: "Prescriben a los dos (2) anos las acciones relativas a creditos provenientes de las relaciones individuales de trabajo y, en general, de disposiciones de convenios colectivos, laudos con eficacia de convenios colectivos y disposiciones legales o reglamentarias del derecho del trabajo." },
    ],
  },
  {
    id: "cccn",
    nombre: "Codigo Civil y Comercial de la Nacion",
    nombre_corto: "CCCN",
    numero: "26.994",
    area: "civil",
    descripcion: "Codigo unificado que regula las relaciones civiles y comerciales. Vigente desde agosto de 2015.",
    articulos: [
      { numero: "1", titulo: "Fuentes y aplicacion", texto: "Los casos que este Codigo rige deben ser resueltos segun las leyes que resulten aplicables, conforme con la Constitucion Nacional y los tratados de derechos humanos en los que la Republica sea parte." },
      { numero: "9", titulo: "Principio de buena fe", texto: "Los derechos deben ser ejercidos de buena fe." },
      { numero: "10", titulo: "Abuso del derecho", texto: "El ejercicio regular de un derecho propio o el cumplimiento de una obligacion legal no puede constituir como ilicito ningun acto. La ley no ampara el ejercicio abusivo de los derechos." },
      { numero: "1708", titulo: "Funciones de la responsabilidad", texto: "Las disposiciones de este Titulo son aplicables a la prevencion del dano y a su reparacion." },
      { numero: "1716", titulo: "Deber de reparar", texto: "La violacion del deber de no danar a otro, o el incumplimiento de una obligacion, da lugar a la reparacion del dano causado, conforme con las disposiciones de este Codigo." },
      { numero: "1737", titulo: "Concepto de dano", texto: "Hay dano cuando se lesiona un derecho o un interes no reprobado por el ordenamiento juridico, que tenga por objeto la persona, el patrimonio, o un derecho de incidencia colectiva." },
      { numero: "1738", titulo: "Indemnizacion", texto: "La indemnizacion comprende la perdida o disminucion del patrimonio de la victima, el lucro cesante en el beneficio economico esperado de acuerdo a la probabilidad objetiva de su obtencion y la perdida de chances. Incluye especialmente las consecuencias de la violacion de los derechos personalisimos de la victima, de su integridad personal, su salud psicofisica, sus afecciones espirituales legitimas y las que resultan de la interferencia en su proyecto de vida." },
      { numero: "1746", titulo: "Indemnizacion por incapacidad (formula de renta)", texto: "En caso de lesiones o incapacidad permanente, fisica o psiquica, total o parcial, la indemnizacion debe ser evaluada mediante la determinacion de un capital de tal modo que sus rentas cubran la disminucion de la aptitud del damnificado para realizar actividades productivas o economicamente valorables, y que se agote al termino del plazo en que razonablemente pudo continuar realizando tales actividades." },
      { numero: "1757", titulo: "Hecho de las cosas y actividades riesgosas", texto: "Toda persona responde por el dano causado por el riesgo o vicio de las cosas, o de las actividades que sean riesgosas o peligrosas por su naturaleza, por los medios empleados o por las circunstancias de su realizacion. La responsabilidad es objetiva. No son eximentes la autorizacion administrativa para el uso de la cosa o la realizacion de la actividad, ni el cumplimiento de las tecnicas de prevencion." },
      { numero: "2560", titulo: "Plazo generico de prescripcion", texto: "El plazo de la prescripcion es de cinco anos, excepto que este previsto uno diferente en la legislacion local." },
      { numero: "2562", titulo: "Plazo de prescripcion de dos anos", texto: "Prescriben a los dos anos: a) el pedido de declaracion de nulidad relativa y de revision de actos juridicos; b) el reclamo de derecho comun de danos derivados de accidentes y enfermedades del trabajo; c) el reclamo de todo lo que se devenga por anos o plazos periodicos mas cortos." },
    ],
  },
  {
    id: "cpccn",
    nombre: "Codigo Procesal Civil y Comercial de la Nacion",
    nombre_corto: "CPCCN",
    numero: "17.454",
    area: "procesal",
    descripcion: "Regula el procedimiento ante los tribunales civiles y comerciales de la Nacion.",
    articulos: [
      { numero: "34", titulo: "Deberes de los jueces", texto: "Son deberes de los jueces: 1) Asistir a las audiencias. 2) Decidir las causas en lo posible de acuerdo al orden en que hayan quedado en estado. 3) Dictar las resoluciones con sujecion a los plazos legales." },
      { numero: "36", titulo: "Facultades ordenatorias e instructorias", texto: "Aun sin requerimiento de parte, los jueces y tribunales podran: 1) Tomar medidas tendientes a evitar la paralizacion del proceso. 2) Ordenar las diligencias necesarias para esclarecer la verdad de los hechos controvertidos." },
      { numero: "244", titulo: "Recurso de apelacion", texto: "El recurso de apelacion, salvo disposicion en contrario, procedera solamente respecto de sentencias definitivas, sentencias interlocutorias y providencias simples que causen gravamen que no pueda ser reparado por la sentencia definitiva." },
      { numero: "245", titulo: "Forma y plazo de interposicion", texto: "El recurso de apelacion se interpondra por escrito o verbalmente dentro del plazo de cinco (5) dias." },
      { numero: "246", titulo: "Efecto del recurso", texto: "El recurso de apelacion sera concedido libremente o en relacion; y en uno u otro caso, en efecto suspensivo o devolutivo." },
      { numero: "330", titulo: "Forma de la demanda", texto: "La demanda sera deducida por escrito y contendra: 1) El nombre y domicilio del demandante. 2) El nombre y domicilio del demandado. 3) La cosa demandada, designandola con toda exactitud. 4) Los hechos en que se funde. 5) El derecho expuesto sucintamente. 6) La peticion en terminos claros y positivos." },
    ],
  },
  {
    id: "lrt",
    nombre: "Ley de Riesgos del Trabajo",
    nombre_corto: "LRT",
    numero: "24.557",
    area: "laboral",
    descripcion: "Regula la prevencion de riesgos y la reparacion de danos derivados del trabajo. Establece el sistema de ART.",
    articulos: [
      { numero: "1", titulo: "Normativa aplicable y objetivos", texto: "La prevencion de los riesgos y la reparacion de los danos derivados del trabajo se regiran por esta LRT y sus normas reglamentarias." },
      { numero: "6", titulo: "Contingencias", texto: "Se considera accidente de trabajo a todo acontecimiento subito y violento ocurrido por el hecho o en ocasion del trabajo, o en el trayecto entre el domicilio del trabajador y el lugar de trabajo." },
      { numero: "14", titulo: "Prestaciones en especie", texto: "Las ART otorgaran a los trabajadores que sufran algunas de las contingencias previstas en esta ley las siguientes prestaciones en especie: a) Asistencia medica y farmaceutica; b) Protesis y ortopedia; c) Rehabilitacion; d) Recalificacion profesional; e) Servicio funerario." },
    ],
  },
];

/** Corpus completo: leyes base + artículos extra + leyes complementarias. */
export const LEYES: Ley[] = [
  ...LEYES_BASE.map((ley) => {
    if (ley.id === "lct") return { ...ley, articulos: [...ley.articulos, ...LCT_ARTICULOS_EXTRA] };
    if (ley.id === "cccn") return { ...ley, articulos: [...ley.articulos, ...CCCN_ARTICULOS_EXTRA] };
    return ley;
  }),
  ...LEYES_COMPLEMENTARIAS,
];

export const JURISPRUDENCIA: Fallo[] = [
  {
    id: "vizzoti",
    caratula: "Vizzoti, Carlos Alberto c/ AMSA SA s/ despido",
    tribunal: "CSJN",
    fecha: "2004-09-14",
    tema: "Tope indemnizatorio art. 245 LCT — inconstitucionalidad parcial",
    area: "laboral",
    sumario: "La Corte Suprema declaro la inconstitucionalidad del tope del art. 245 LCT cuando la aplicacion del limite reduce la base salarial en mas del 33%. Establecio que la indemnizacion no puede ser inferior al 67% de la mejor remuneracion mensual normal y habitual del trabajador.",
    voces: ["indemnizacion", "tope", "inconstitucionalidad", "art. 245", "despido"],
    verificado: true,
  },
  {
    id: "aquino",
    caratula: "Aquino, Isacio c/ Cargo Servicios Industriales SA s/ accidente",
    tribunal: "CSJN",
    fecha: "2004-09-21",
    tema: "Inconstitucionalidad del art. 39 LRT — acceso a reparacion integral",
    area: "laboral",
    sumario: "Se declaro la inconstitucionalidad del art. 39 inc. 1 de la LRT que vedaba el acceso a la via civil, por vulnerar el derecho a la reparacion integral del dano (art. 19 CN) y el principio de igualdad (art. 16 CN).",
    voces: ["accidente", "ART", "reparacion integral", "inconstitucionalidad", "danos"],
    verificado: true,
  },
  {
    id: "alvarez-cencosud",
    caratula: "Alvarez, Maximiliano y otros c/ Cencosud SA s/ accion de amparo",
    tribunal: "CSJN",
    fecha: "2010-12-07",
    tema: "Despido discriminatorio — nulidad y reinstalacion",
    area: "laboral",
    sumario: "La CSJN confirmo que el despido motivado en razones discriminatorias (actividad sindical) es nulo. Ordeno la reinstalacion de los trabajadores y el pago de salarios caidos, en aplicacion de la ley 23.592.",
    voces: ["discriminacion", "despido", "reinstalacion", "actividad sindical", "nulidad"],
    verificado: true,
  },
  {
    id: "arostegui",
    caratula: "Arostegui, Pablo Martin c/ Omega ART SA y Pametal Peluso y Compania SRL",
    tribunal: "CSJN",
    fecha: "2008-04-08",
    tema: "Reparacion integral por accidente de trabajo",
    area: "laboral",
    sumario: "La Corte ratifico el derecho del trabajador accidentado a reclamar la reparacion integral por via civil, y que las prestaciones de la LRT constituyen un piso minimo que no obsta al reclamo de mayores danos.",
    voces: ["accidente", "reparacion integral", "via civil", "danos", "ART"],
    verificado: true,
  },
  {
    id: "ramos-jose",
    caratula: "Ramos, Jose Luis c/ Estado Nacional (Min. de Defensa — ARA) s/ indemnizacion por despido",
    tribunal: "CSJN",
    fecha: "2010-04-06",
    tema: "Contratacion fraudulenta del Estado — estabilidad",
    area: "laboral",
    sumario: "La CSJN reconocio el derecho indemnizatorio de un empleado contratado de manera sucesiva por el Estado bajo modalidades temporales que encubrian una relacion permanente.",
    voces: ["empleo publico", "fraude", "contratacion", "estabilidad", "Estado"],
    verificado: true,
  },
  {
    id: "perez-disco",
    caratula: "Perez, Anibal Raul c/ Disco SA s/ despido",
    tribunal: "CSJN",
    fecha: "2009-09-01",
    tema: "Naturaleza salarial de los vales alimentarios — art. 103 bis LCT",
    area: "laboral",
    sumario: "La CSJN declaro la inconstitucionalidad del art. 103 bis inc. c) LCT en cuanto negaba caracter remuneratorio a los vales alimentarios, por contrariar el concepto de remuneracion del Convenio 95 OIT y el art. 14 bis CN. Los vales tienen naturaleza salarial.",
    voces: ["remuneracion", "vales alimentarios", "salario", "inconstitucionalidad", "OIT"],
    verificado: true,
  },
  {
    id: "madorran",
    caratula: "Madorran, Marta Cristina c/ Administracion Nacional de Aduanas s/ reincorporacion",
    tribunal: "CSJN",
    fecha: "2007-05-03",
    tema: "Estabilidad propia del empleado publico — art. 14 bis CN",
    area: "laboral",
    sumario: "La CSJN reconocio la estabilidad propia del empleado publico (art. 14 bis CN), declarando la validez de la reincorporacion frente a un despido incausado en el ambito de la Administracion Publica.",
    voces: ["empleo publico", "estabilidad", "reincorporacion", "art. 14 bis"],
    verificado: true,
  },
  {
    id: "milone-asociart",
    caratula: "Milone, Juan Antonio c/ Asociart SA ART s/ accidente",
    tribunal: "CSJN",
    fecha: "2004-10-26",
    tema: "Inconstitucionalidad del pago en renta periodica — LRT",
    area: "laboral",
    sumario: "La Corte declaro la inconstitucionalidad del art. 14, ap. 2.b de la LRT que imponia el pago de la indemnizacion por incapacidad en forma de renta periodica, por afectar el derecho a una reparacion integral y la disponibilidad del credito por el trabajador.",
    voces: ["accidente", "ART", "renta periodica", "reparacion integral", "inconstitucionalidad"],
    verificado: true,
  },
  {
    id: "ate-2008",
    caratula: "Asociacion Trabajadores del Estado (ATE) c/ Ministerio de Trabajo s/ ley de asociaciones sindicales",
    tribunal: "CSJN",
    fecha: "2008-11-11",
    tema: "Libertad sindical — inconstitucionalidad art. 41 ley 23.551",
    area: "laboral",
    sumario: "La CSJN declaro la inconstitucionalidad del art. 41 inc. a) de la ley 23.551 que exigia afiliacion a la asociacion sindical con personeria gremial para ser delegado, por vulnerar la libertad sindical (art. 14 bis CN y Convenio 87 OIT).",
    voces: ["libertad sindical", "delegado", "personeria gremial", "OIT", "inconstitucionalidad"],
    verificado: true,
  },
];

export function buscarEnCorpus(query: string): { leyes: (Ley & { matches: LeyArticulo[] })[]; fallos: Fallo[] } {
  const q = query.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const leyResults = LEYES.map(ley => {
    // Números: coincidencia EXACTA del artículo ("2" no debe traer el 245, 232, 2562…).
    const soloNumero = /^\d+(\s*(bis|ter|quater))?$/.test(q);
    const numeroBuscado = q.match(/^art(?:iculo)?\.?\s*(\d+(?:\s*(?:bis|ter|quater))?)$/)?.[1] ?? (soloNumero ? q : null);
    const matches = ley.articulos.filter(a => {
      if (numeroBuscado) return a.numero.toLowerCase().replace(/\s+/g, " ") === numeroBuscado.replace(/\s+/g, " ");
      return (
        a.texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q) ||
        a.titulo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q)
      );
    });
    return { ...ley, matches };
  }).filter(l => l.matches.length > 0);

  const falloResults = JURISPRUDENCIA.filter(f =>
    f.caratula.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q) ||
    f.sumario.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q) ||
    f.tema.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q) ||
    f.voces.some(v => v.includes(q))
  );

  return { leyes: leyResults, fallos: falloResults };
}
