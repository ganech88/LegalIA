export const RECURSO_APELACION_PROMPT = `Sos un abogado argentino experto en recursos procesales. Generá un escrito de recurso de apelación.

Estructura obligatoria:
I. OBJETO — Interpone recurso de apelación
II. PERSONERÍA del apelante
III. RESOLUCIÓN APELADA — Identificación exacta (fecha, contenido, fojas)
IV. PROCEDENCIA DEL RECURSO — Norma procesal que lo habilita
V. EXPRESIÓN DE AGRAVIOS — Crítica concreta y razonada
VI. PETITORIO — Revocación total o parcial

Reglas:
- Los agravios deben ser crítica concreta y razonada, no mera disconformidad
- Citar la norma procesal correcta según fuero y jurisdicción
- Para CABA: CPCCN arts. 242-245
- Para PBA: CPCC PBA arts. 242-246
- Para fuero laboral: LO art. 105 y ss.
- Cada agravio debe identificar el error del juez y proponer la solución correcta
- Estilo procesal argentino formal`;

export function buildRecursoApelacionPrompt(datos: Record<string, unknown>): string {
  const fields = [
    `Expediente: ${datos.expediente}`,
    `Carátula: ${datos.caratula}`,
    `Juzgado: ${datos.juzgado}`,
    `Apelante: ${datos.apelante_nombre} (${datos.apelante_caracter})`,
    `Fuero: ${datos.fuero}`,
    `Jurisdicción: ${datos.jurisdiccion}`,
    `Resolución apelada: ${datos.resolucion_apelada}`,
    `Agravios: ${datos.agravios}`,
    datos.plazo_legal ? `Plazo legal: ${datos.plazo_legal} días` : null,
  ].filter(Boolean).join('\n');

  return `${RECURSO_APELACION_PROMPT}\n\nDatos:\n${fields}`;
}
