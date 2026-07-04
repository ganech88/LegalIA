/**
 * Control pre-presentación — "el corrector que evita la providencia de subsanación".
 *
 * Motor de reglas determinístico (sin costo de IA) que revisa el escrito antes
 * de exportarlo: estructura procesal, prueba ofrecida, liquidación, reserva
 * federal, datos de las partes y requisitos según jurisdicción (PBA ley 15.057
 * vs. CABA/nacional ley 18.345).
 */

export type NivelCheck = "ok" | "advertencia" | "falta";

export interface ResultadoCheck {
  id: string;
  nivel: NivelCheck;
  titulo: string;
  detalle: string;
}

export interface DatosEscrito {
  texto: string;
  tipo: string;         // demanda_laboral, contestacion, recurso_apelacion, carta_documento, personalizado…
  fuero: string;        // laboral, civil…
  jurisdiccion: string; // CABA, PBA, nacional…
}

function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function contiene(texto: string, ...variantes: string[]): boolean {
  const t = norm(texto);
  return variantes.some((v) => t.includes(norm(v)));
}

const esDemanda = (tipo: string) => tipo.includes("demanda");
const esContestacion = (tipo: string) => tipo.includes("contestacion");
const esRecurso = (tipo: string) => tipo.includes("recurso");
const esCartaDoc = (tipo: string) => tipo.includes("carta");

export function controlPrePresentacion(d: DatosEscrito): ResultadoCheck[] {
  const r: ResultadoCheck[] = [];
  const { texto, tipo, fuero, jurisdiccion } = d;
  const judicial = !esCartaDoc(tipo);

  const check = (id: string, ok: boolean, titulo: string, faltaDetalle: string, nivelSiFalta: NivelCheck = "falta", okDetalle = "Presente en el escrito.") => {
    r.push({ id, nivel: ok ? "ok" : nivelSiFalta, titulo, detalle: ok ? okDetalle : faltaDetalle });
  };

  // ---- Estructura básica (escritos judiciales) ----
  if (judicial) {
    check("objeto", contiene(texto, "objeto"), "Objeto",
      "No se detecta el apartado OBJETO. Todo escrito judicial debe enunciar con precisión qué se pide.");
    check("hechos", contiene(texto, "hechos"), "Hechos",
      "No se detecta el apartado HECHOS. La demanda debe exponerlos claramente (art. 330 CPCCN / art. 65 ley 18.345 / ley 15.057 PBA).");
    check("derecho", contiene(texto, "derecho"), "Derecho",
      "No se detecta el apartado DERECHO con la fundamentación normativa.");
    check("petitorio", contiene(texto, "petitorio", "por todo lo expuesto"), "Petitorio",
      "No se detecta el PETITORIO. Sin petición clara y positiva el escrito es observable.");
  }

  // ---- Prueba ----
  if (esDemanda(tipo) || esContestacion(tipo)) {
    check("prueba", contiene(texto, "prueba"), "Ofrecimiento de prueba",
      "No se detecta apartado de PRUEBA. En el proceso laboral la prueba se ofrece con la demanda/contestación (ley 18.345 art. 71; ley 15.057 PBA).");
    const tiposPrueba = ["documental", "testimonial", "pericial", "informativa", "confesional"].filter((p) => contiene(texto, p));
    check("prueba_detalle", tiposPrueba.length >= 2, "Medios de prueba detallados",
      `Solo se detectan ${tiposPrueba.length || "0"} medio(s) de prueba (${tiposPrueba.join(", ") || "ninguno"}). Revisá si corresponde ofrecer documental, testimonial, pericial (contable/médica), informativa y confesional.`,
      "advertencia",
      `Medios detectados: ${tiposPrueba.join(", ")}.`);
  }

  // ---- Demanda laboral: liquidación y rubros ----
  if (esDemanda(tipo) && fuero === "laboral") {
    check("liquidacion", contiene(texto, "liquidacion", "liquidación"), "Liquidación",
      "No se detecta LIQUIDACIÓN. La demanda laboral debe detallar los rubros y montos reclamados (podés generarla auditada desde la calculadora art. 245).");
    check("montos", /\$\s?[\d.,]{4,}/.test(texto), "Montos en pesos",
      "No se detectan importes ($). Verificá que la liquidación tenga montos concretos.", "advertencia");
    check("intereses", contiene(texto, "interes", "interés", "tasa"), "Intereses",
      "No se detecta pedido de intereses. Conviene solicitarlos expresamente desde la exigibilidad de cada rubro.", "advertencia");
  }

  // ---- Reserva del caso federal ----
  if (esDemanda(tipo) || esContestacion(tipo) || esRecurso(tipo)) {
    check("caso_federal", contiene(texto, "caso federal", "reserva federal", "recurso extraordinario", "art. 14 de la ley 48", "ley 48"), "Reserva del caso federal",
      "No se detecta la reserva del caso federal (art. 14, ley 48). Sin reserva oportuna se puede perder el acceso a la CSJN.", "advertencia");
  }

  // ---- Datos de las partes ----
  if (esDemanda(tipo)) {
    check("dni_cuit", /\b(dni|d\.n\.i\.|cuit|cuil)\b/i.test(texto), "Identificación de las partes",
      "No se detectan DNI/CUIT/CUIL. La demanda debe identificar con precisión a actor y demandada.", "advertencia");
    check("domicilios", contiene(texto, "domicilio"), "Domicilios",
      "No se detectan domicilios (real, legal/constituido y electrónico). Son requisito de admisibilidad.");
  }

  // ---- Requisitos por jurisdicción ----
  if (fuero === "laboral" && judicial) {
    if (norm(jurisdiccion) === "pba") {
      check("pba_regimen", contiene(texto, "15.057", "15057"), "Régimen procesal PBA (ley 15.057)",
        "El escrito no menciona la ley 15.057, el régimen procesal laboral vigente en PBA (juzgados unipersonales, oralidad). Verificá que el encabezado y las citas procesales correspondan al fuero bonaerense y no al nacional.", "advertencia");
      check("pba_no_nacional", !contiene(texto, "18.345", "18345", "CNAT"), "Sin citas del régimen nacional",
        "Se detectan citas del procedimiento nacional (ley 18.345 / CNAT) en un escrito para PBA. Reemplazalas por las normas bonaerenses (ley 15.057).",
        "falta", "No mezcla normas procesales nacionales.");
    }
    if (norm(jurisdiccion) === "caba" || norm(jurisdiccion) === "nacional") {
      check("caba_no_pba", !contiene(texto, "15.057", "15057"), "Sin citas del régimen bonaerense",
        "Se detecta la ley 15.057 (procedimiento PBA) en un escrito para CABA/nacional. El fuero del trabajo de CABA se rige por la ley 18.345.",
        "falta", "No mezcla normas procesales bonaerenses.");
      if (esDemanda(tipo)) {
        check("seclo", contiene(texto, "seclo", "conciliacion laboral obligatoria", "conciliación laboral obligatoria", "ley 24.635"), "Instancia previa (SECLO)",
          "No se menciona el paso por el SECLO (ley 24.635), requisito previo a la demanda laboral en CABA. Acreditá la conciliación agotada o la eximición.", "advertencia");
      }
    }
  }

  // ---- Recursos: plazo y agravios ----
  if (esRecurso(tipo)) {
    check("agravios", contiene(texto, "agravio"), "Expresión de agravios",
      "No se detecta la palabra 'agravios'. El recurso debe criticar concreta y razonadamente la resolución apelada.", "advertencia");
  }

  // ---- Carta documento: requisitos mínimos ----
  if (esCartaDoc(tipo)) {
    check("cd_plazo", /\b(24|48|72)\s*(hs|horas)\b|\b(dos|cuatro|treinta)\s*d[ií]as\b|\b\d+\s*d[ií]as\b/i.test(texto), "Plazo de intimación",
      "No se detecta un plazo de intimación (48 hs, 30 días, etc.). Toda intimación debe fijar plazo.", "advertencia");
    check("cd_apercibimiento", contiene(texto, "apercibimiento", "bajo apercib"), "Apercibimiento",
      "No se detecta apercibimiento. La intimación debe indicar la consecuencia del incumplimiento.");
  }

  // ---- Cierre ----
  if (judicial) {
    check("sera_justicia", contiene(texto, "sera justicia", "será justicia", "proveer de conformidad"), "Fórmula de cierre",
      "Falta la fórmula de cierre ('Proveer de conformidad, SERÁ JUSTICIA').", "advertencia");
  }

  return r;
}

export function resumenControl(resultados: ResultadoCheck[]) {
  return {
    ok: resultados.filter((x) => x.nivel === "ok").length,
    advertencias: resultados.filter((x) => x.nivel === "advertencia").length,
    faltas: resultados.filter((x) => x.nivel === "falta").length,
  };
}
