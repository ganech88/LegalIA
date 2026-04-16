export const CARTA_DOCUMENTO_INTIMACION_PROMPT = `Sos un abogado laboralista argentino. Generá una carta documento de intimación de pago de un trabajador a su empleador.

Formato estándar de carta documento argentina:
- Encabezado: CARTA DOCUMENTO
- Datos de remitente y destinatario
- Cuerpo con intimación formal
- Apercibimientos legales

Contenido obligatorio:
- Identificación completa de remitente y destinatario
- Mención de la relación laboral vigente
- Detalle preciso de los conceptos adeudados
- Intimación con plazo en días hábiles
- Apercibimiento de considerarse en situación de despido indirecto (art. 246 LCT)
- Citar arts. 74, 103, 128, 137 LCT según corresponda
- Tono formal y firme`;

export const CARTA_DOCUMENTO_DESPIDO_INDIRECTO_PROMPT = `Sos un abogado laboralista argentino. Generá una carta documento de despido indirecto (art. 246 LCT).

Contenido obligatorio:
- Antecedentes de la relación laboral (fecha ingreso, categoría, tareas)
- Descripción de la injuria grave del empleador
- Referencia a intimaciones previas si las hubo
- Colocación formal en situación de despido indirecto por exclusiva culpa del empleador
- Reclamo de indemnizaciones: arts. 245, 232, 233 LCT, SAC proporcional, vacaciones, art. 80
- Intimación a entregar certificados art. 80 en plazo legal (30 días)
- Tono formal y contundente
- Formato carta documento estándar argentina`;

export function buildCartaIntimacionPrompt(datos: Record<string, unknown>): string {
  const fields = [
    `Remitente: ${datos.remitente_nombre}, DNI ${datos.remitente_dni}, domicilio ${datos.remitente_domicilio}`,
    `Destinatario: ${datos.destinatario_nombre}, CUIT ${datos.destinatario_cuit}, domicilio ${datos.destinatario_domicilio}`,
    `Conceptos adeudados: ${datos.concepto_adeudado}`,
    `Período: ${datos.periodo_adeudado}`,
    datos.monto_adeudado ? `Monto: $${datos.monto_adeudado}` : null,
    `Plazo: ${datos.plazo_dias} días hábiles`,
    datos.detalle_adicional ? `Detalle adicional: ${datos.detalle_adicional}` : null,
  ].filter(Boolean).join('\n');

  return `${CARTA_DOCUMENTO_INTIMACION_PROMPT}\n\nDatos:\n${fields}`;
}

export function buildCartaDespidoIndirectoPrompt(datos: Record<string, unknown>): string {
  const fields = [
    `Remitente: ${datos.remitente_nombre}, DNI ${datos.remitente_dni}, domicilio ${datos.remitente_domicilio}`,
    `Destinatario: ${datos.destinatario_nombre}, CUIT ${datos.destinatario_cuit}, domicilio ${datos.destinatario_domicilio}`,
    `Fecha ingreso: ${datos.fecha_ingreso}`,
    `Categoría: ${datos.categoria}`,
    `Injuria: ${datos.injuria_descripcion}`,
    datos.intimaciones_previas ? `Intimaciones previas: ${datos.intimaciones_previas}` : null,
    `Mejor remuneración: $${datos.mejor_remuneracion}`,
  ].filter(Boolean).join('\n');

  return `${CARTA_DOCUMENTO_DESPIDO_INDIRECTO_PROMPT}\n\nDatos:\n${fields}`;
}
