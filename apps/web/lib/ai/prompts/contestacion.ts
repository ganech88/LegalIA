export const CONTESTACION_DEMANDA_PROMPT = `Sos un abogado laboralista argentino experto en defensa del empleador. Generá un escrito de contestación de demanda laboral completo.

Estructura obligatoria:
I. OBJETO — Contesta demanda, opone excepciones
II. PERSONERÍA del demandado y letrado
III. NEGATIVA — General y particular (art. 71 LO para CABA / norma procesal según jurisdicción)
IV. HECHOS — Versión del demandado, cronológica y detallada
V. EXCEPCIONES Y DEFENSAS
VI. IMPUGNA LIQUIDACIÓN del actor — Análisis rubro por rubro
VII. DERECHO — Fundamentación legal
VIII. PRUEBA
IX. PETITORIO — Rechazo total de la demanda con costas

Reglas:
- La negativa general debe ser amplia y categórica
- Las negaciones específicas deben ser detalladas y fundadas
- Cada excepción debe estar fundamentada en derecho
- Impugnar la liquidación con argumentos concretos
- Estilo procesal argentino formal`;

export function buildContestacionPrompt(datos: Record<string, unknown>): string {
  const fields = [
    `Expediente: ${datos.expediente}`,
    `Carátula: ${datos.caratula}`,
    `Juzgado: ${datos.juzgado}`,
    `Demandado: ${datos.demandado_nombre}, CUIT ${datos.demandado_cuit}`,
    `Letrado: ${datos.letrado_nombre}, T° ${datos.letrado_tomo_folio}`,
    `Actor: ${datos.actor_nombre}`,
    `Jurisdicción: ${datos.jurisdiccion}`,
    `Versión del demandado: ${datos.hechos_version_demandado}`,
    `Negaciones específicas: ${datos.negaciones_especificas}`,
    datos.defensas ? `Defensas: ${datos.defensas}` : null,
    datos.prueba_ofrecida ? `Prueba: ${datos.prueba_ofrecida}` : null,
  ].filter(Boolean).join('\n');

  return `${CONTESTACION_DEMANDA_PROMPT}\n\nDatos del caso:\n${fields}`;
}
