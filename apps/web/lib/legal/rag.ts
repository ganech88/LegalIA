import { buscarEnCorpus } from "./corpus";

/**
 * Builds RAG context from keyword search in the local corpus.
 * Extracts key terms from the user message and searches across
 * laws, articles, and case law. Returns formatted context for
 * injection into the LLM system prompt.
 */
export function buildRagContext(userMessage: string, maxChars = 4000): string {
  const terms = extractSearchTerms(userMessage);
  if (terms.length === 0) return "";

  const chunks: string[] = [];
  let totalLen = 0;

  for (const term of terms) {
    if (totalLen >= maxChars) break;

    const { leyes, fallos } = buscarEnCorpus(term);

    for (const ley of leyes) {
      for (const art of ley.matches) {
        const chunk = `[${ley.nombre_corto} - Art. ${art.numero}: ${art.titulo}]\n${art.texto}`;
        if (totalLen + chunk.length > maxChars) break;
        if (!chunks.includes(chunk)) {
          chunks.push(chunk);
          totalLen += chunk.length;
        }
      }
    }

    // Solo se inyectan fallos verificados como "fuentes verificadas". Los
    // criterios ilustrativos (verificado: false) no se pasan al LLM para no
    // presentarlos como jurisprudencia confirmada (regla: nunca inventar fallos).
    for (const fallo of fallos.filter((f) => f.verificado)) {
      const chunk = `[Jurisprudencia: "${fallo.caratula}" - ${fallo.tribunal} (${fallo.fecha})]\nTema: ${fallo.tema}\nSumario: ${fallo.sumario}`;
      if (totalLen + chunk.length > maxChars) break;
      if (!chunks.includes(chunk)) {
        chunks.push(chunk);
        totalLen += chunk.length;
      }
    }
  }

  return chunks.join("\n\n---\n\n");
}

/**
 * Builds context from user's cases for case-specific questions.
 */
export function buildCaseContext(
  casos: { caratula: string; expediente: string | null; fuero: string; jurisdiccion: string; juzgado: string | null; notas: string | null; estado: string }[],
  escritos: { titulo: string; tipo: string; contenido_generado: string }[],
): string {
  if (casos.length === 0 && escritos.length === 0) return "";

  const parts: string[] = [];

  if (casos.length > 0) {
    parts.push("=== CASOS DEL USUARIO ===");
    for (const c of casos) {
      let entry = `- ${c.caratula}`;
      if (c.expediente) entry += ` (EXP ${c.expediente})`;
      entry += ` | ${c.fuero} | ${c.jurisdiccion} | ${c.estado}`;
      if (c.juzgado) entry += ` | ${c.juzgado}`;
      if (c.notas) entry += `\n  Notas: ${c.notas}`;
      parts.push(entry);
    }
  }

  if (escritos.length > 0) {
    parts.push("\n=== ESCRITOS RECIENTES ===");
    for (const e of escritos) {
      const preview = e.contenido_generado.slice(0, 500);
      parts.push(`- [${e.tipo}] ${e.titulo}\n  ${preview}...`);
    }
  }

  return parts.join("\n");
}

function extractSearchTerms(message: string): string[] {
  const lower = message.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const legalTerms = [
    "despido", "indemnizacion", "preaviso", "antiguedad", "prescripcion",
    "accidente", "art", "articulo", "laboral", "civil", "comercial",
    "contrato", "trabajo", "remuneracion", "salario", "sueldo",
    "apelacion", "recurso", "demanda", "contestacion", "embargo",
    "cautelar", "medida", "prueba", "pericial", "testimonial",
    "convenio", "colectivo", "sindicato", "sindical", "huelga",
    "discriminacion", "maternidad", "embarazo", "lactancia",
    "riesgo", "enfermedad", "profesional", "incapacidad", "invalidez",
    "muerte", "fallecimiento", "heredero", "sucesion",
    "buena fe", "dano", "perjuicio", "reparacion", "integral",
    "fraude", "simulacion", "nulidad", "registracion",
    "tope", "vizzoti", "inconstitucionalidad",
    "alimentos", "regimen", "visitas", "tenencia", "divorcio",
    "multa", "certificado", "art 80", "art 245", "art 232",
    "preaviso", "integracion", "sac", "vacaciones", "aguinaldo",
    "jornada", "hora extra", "teletrabajo",
  ];

  const found: string[] = [];

  // Extract article references like "art 245", "art. 80"
  const artMatches = lower.match(/art[iculo.]*\s*(\d+)/g);
  if (artMatches) {
    for (const m of artMatches) {
      const num = m.match(/\d+/)?.[0];
      if (num) found.push(num);
    }
  }

  // Match legal terms present in the message
  for (const term of legalTerms) {
    if (lower.includes(term) && !found.includes(term)) {
      found.push(term);
    }
  }

  // If no specific terms found, use significant words from the message
  if (found.length === 0) {
    const stopwords = new Set(["que", "es", "el", "la", "los", "las", "un", "una", "de", "del", "en", "por", "para", "con", "como", "cual", "cuales", "puede", "puedo", "hay", "tiene", "hacer", "dice", "sobre", "ante", "sin", "mas", "muy", "ser", "esta", "ese", "eso", "esa", "este", "esto", "todo", "toda", "todos", "todas", "otro", "otra", "otros", "otras", "me", "mi", "te", "tu", "se", "le", "lo", "nos", "su", "sus", "al"]);
    const words = lower.split(/\s+/).filter(w => w.length > 3 && !stopwords.has(w));
    found.push(...words.slice(0, 3));
  }

  return [...new Set(found)].slice(0, 5);
}
