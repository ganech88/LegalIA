INSERT INTO escrito_templates (tipo, subtipo, nombre_display, fuero, jurisdiccion, campos_requeridos, template_prompt, template_estructura) VALUES

-- 1. Demanda laboral por despido sin causa
('demanda_laboral', 'despido_sin_causa', 'Demanda por despido sin causa', 'laboral', ARRAY['CABA','PBA','nacional'],
'{
  "fields": [
    {"name": "actor_nombre", "label": "Nombre completo del actor", "type": "text", "required": true},
    {"name": "actor_dni", "label": "DNI del actor", "type": "text", "required": true},
    {"name": "actor_domicilio", "label": "Domicilio real del actor", "type": "text", "required": true},
    {"name": "actor_domicilio_electronico", "label": "Domicilio electrónico (CUIT)", "type": "text", "required": false},
    {"name": "demandado_nombre", "label": "Razón social del demandado", "type": "text", "required": true},
    {"name": "demandado_cuit", "label": "CUIT del demandado", "type": "text", "required": true},
    {"name": "demandado_domicilio", "label": "Domicilio del demandado", "type": "text", "required": true},
    {"name": "fecha_ingreso", "label": "Fecha de ingreso", "type": "date", "required": true},
    {"name": "fecha_despido", "label": "Fecha de despido", "type": "date", "required": true},
    {"name": "mejor_remuneracion", "label": "Mejor remuneración mensual, normal y habitual ($)", "type": "number", "required": true},
    {"name": "categoria", "label": "Categoría laboral", "type": "text", "required": true},
    {"name": "cct", "label": "Convenio Colectivo de Trabajo aplicable", "type": "text", "required": false},
    {"name": "jornada", "label": "Tipo de jornada (completa/parcial)", "type": "select", "options": ["completa", "parcial"], "required": true},
    {"name": "jurisdiccion", "label": "Jurisdicción", "type": "select", "options": ["CABA", "PBA", "nacional"], "required": true},
    {"name": "hechos", "label": "Hechos relevantes del caso", "type": "textarea", "required": true},
    {"name": "rubros_reclamados", "label": "Rubros adicionales a reclamar", "type": "multiselect", "options": ["Indemnización art. 245", "Preaviso art. 232", "SAC proporcional", "Vacaciones proporcionales", "Integración mes de despido", "Art. 2 Ley 25.323", "Art. 80 LCT", "Horas extras", "Diferencias salariales"], "required": false},
    {"name": "monto_reclamado", "label": "Monto total estimado ($)", "type": "number", "required": false}
  ]
}'::jsonb,
'Generá un escrito de demanda laboral por despido sin causa para ser presentado ante la justicia de {jurisdiccion}.

Formato del escrito:
1. Encabezado con objeto de la demanda
2. Personería del actor y datos del letrado
3. Hechos (relación laboral, circunstancias del despido, detalle cronológico)
4. Derecho aplicable (citar arts. 232, 233, 245, 246 LCT, art. 2 Ley 25.323 si corresponde, y normativa específica)
5. Liquidación detallada rubro por rubro con cálculos
6. Prueba (documental, testimonial, pericial contable, informativa)
7. Reserva del caso federal
8. Petitorio

Datos del caso:
- Actor: {actor_nombre}, DNI {actor_dni}, domicilio {actor_domicilio}
- Demandado: {demandado_nombre}, CUIT {demandado_cuit}, domicilio {demandado_domicilio}
- Fecha de ingreso: {fecha_ingreso}
- Fecha de despido: {fecha_despido}
- Mejor remuneración: ${mejor_remuneracion}
- Categoría/CCT: {categoria} {cct}
- Jornada: {jornada}
- Hechos relevantes: {hechos}
- Rubros reclamados: {rubros_reclamados}

Generá el escrito completo, formal, listo para presentar. Usá el estilo procesal argentino. Incluí todos los cálculos numéricos en la liquidación.',
'I. OBJETO
II. PERSONERÍA
III. HECHOS
IV. DERECHO
V. LIQUIDACIÓN
VI. PRUEBA
  a) Documental
  b) Testimonial
  c) Pericial contable
  d) Informativa
VII. RESERVA CASO FEDERAL
VIII. PETITORIO'),

-- 2. Carta documento - Intimación de pago
('carta_documento', 'intimacion_pago', 'Carta documento: Intimación de pago', 'laboral', ARRAY['CABA','PBA','nacional'],
'{
  "fields": [
    {"name": "remitente_nombre", "label": "Nombre del remitente (trabajador)", "type": "text", "required": true},
    {"name": "remitente_dni", "label": "DNI del remitente", "type": "text", "required": true},
    {"name": "remitente_domicilio", "label": "Domicilio del remitente", "type": "text", "required": true},
    {"name": "destinatario_nombre", "label": "Razón social del destinatario (empleador)", "type": "text", "required": true},
    {"name": "destinatario_cuit", "label": "CUIT del destinatario", "type": "text", "required": true},
    {"name": "destinatario_domicilio", "label": "Domicilio del destinatario", "type": "text", "required": true},
    {"name": "concepto_adeudado", "label": "Conceptos adeudados", "type": "textarea", "required": true},
    {"name": "periodo_adeudado", "label": "Período adeudado (ej: marzo 2026)", "type": "text", "required": true},
    {"name": "monto_adeudado", "label": "Monto adeudado ($)", "type": "number", "required": false},
    {"name": "plazo_dias", "label": "Plazo para cumplimiento (días hábiles)", "type": "number", "required": true},
    {"name": "detalle_adicional", "label": "Detalle adicional", "type": "textarea", "required": false}
  ]
}'::jsonb,
'Generá una carta documento de intimación de pago de un trabajador a su empleador.

Debe incluir:
- Identificación del remitente y destinatario
- Relación laboral vigente
- Detalle de los conceptos adeudados
- Intimación formal con plazo en días hábiles
- Apercibimiento de considerarse en situación de despido indirecto (art. 246 LCT) y accionar judicialmente
- Cita de arts. 74, 103, 128, 137 LCT según corresponda

Datos:
- Remitente: {remitente_nombre}, DNI {remitente_dni}, domicilio {remitente_domicilio}
- Destinatario: {destinatario_nombre}, CUIT {destinatario_cuit}, domicilio {destinatario_domicilio}
- Conceptos adeudados: {concepto_adeudado}
- Período: {periodo_adeudado}
- Monto: ${monto_adeudado}
- Plazo: {plazo_dias} días hábiles
- Detalle adicional: {detalle_adicional}

Usá tono formal pero firme. Formato de carta documento estándar argentina.',
'CARTA DOCUMENTO
REMITENTE: [datos]
DESTINATARIO: [datos]
TEXTO: [cuerpo con intimación y apercibimiento]'),

-- 3. Carta documento - Despido indirecto
('carta_documento', 'despido_indirecto', 'Carta documento: Despido indirecto', 'laboral', ARRAY['CABA','PBA','nacional'],
'{
  "fields": [
    {"name": "remitente_nombre", "label": "Nombre del remitente (trabajador)", "type": "text", "required": true},
    {"name": "remitente_dni", "label": "DNI del remitente", "type": "text", "required": true},
    {"name": "remitente_domicilio", "label": "Domicilio del remitente", "type": "text", "required": true},
    {"name": "destinatario_nombre", "label": "Razón social del destinatario (empleador)", "type": "text", "required": true},
    {"name": "destinatario_cuit", "label": "CUIT del destinatario", "type": "text", "required": true},
    {"name": "destinatario_domicilio", "label": "Domicilio del destinatario", "type": "text", "required": true},
    {"name": "fecha_ingreso", "label": "Fecha de ingreso", "type": "date", "required": true},
    {"name": "categoria", "label": "Categoría laboral", "type": "text", "required": true},
    {"name": "injuria_descripcion", "label": "Descripción de la injuria/incumplimiento del empleador", "type": "textarea", "required": true},
    {"name": "intimaciones_previas", "label": "Intimaciones previas realizadas (si las hubo)", "type": "textarea", "required": false},
    {"name": "mejor_remuneracion", "label": "Mejor remuneración ($)", "type": "number", "required": true}
  ]
}'::jsonb,
'Generá una carta documento de despido indirecto (art. 246 LCT) de un trabajador a su empleador.

Debe incluir:
- Antecedentes de la relación laboral
- Descripción de la injuria grave que justifica el despido indirecto
- Referencia a intimaciones previas si las hubo
- Colocación formal en situación de despido indirecto por exclusiva culpa del empleador
- Reclamo de indemnizaciones: art. 245, 232, 233 LCT, SAC proporcional, vacaciones, art. 80 LCT
- Intimación a entregar certificados art. 80 en plazo legal

Datos:
- Remitente: {remitente_nombre}, DNI {remitente_dni}, domicilio {remitente_domicilio}
- Destinatario: {destinatario_nombre}, CUIT {destinatario_cuit}, domicilio {destinatario_domicilio}
- Fecha ingreso: {fecha_ingreso}
- Categoría: {categoria}
- Injuria: {injuria_descripcion}
- Intimaciones previas: {intimaciones_previas}
- Mejor remuneración: ${mejor_remuneracion}

Tono formal y contundente. Formato de carta documento estándar argentina.',
'CARTA DOCUMENTO
REMITENTE: [datos]
DESTINATARIO: [datos]
TEXTO: [antecedentes, injuria, colocación en despido indirecto, reclamo]'),

-- 4. Contestación de demanda laboral
('contestacion_demanda', 'laboral', 'Contestación de demanda laboral', 'laboral', ARRAY['CABA','PBA','nacional'],
'{
  "fields": [
    {"name": "expediente", "label": "Número de expediente", "type": "text", "required": true},
    {"name": "caratula", "label": "Carátula del expediente", "type": "text", "required": true},
    {"name": "juzgado", "label": "Juzgado interviniente", "type": "text", "required": true},
    {"name": "demandado_nombre", "label": "Nombre/Razón social del demandado", "type": "text", "required": true},
    {"name": "demandado_cuit", "label": "CUIT del demandado", "type": "text", "required": true},
    {"name": "demandado_domicilio", "label": "Domicilio del demandado", "type": "text", "required": true},
    {"name": "letrado_nombre", "label": "Nombre del letrado patrocinante", "type": "text", "required": true},
    {"name": "letrado_tomo_folio", "label": "Tomo y folio del letrado", "type": "text", "required": true},
    {"name": "actor_nombre", "label": "Nombre del actor", "type": "text", "required": true},
    {"name": "hechos_version_demandado", "label": "Versión del demandado sobre los hechos", "type": "textarea", "required": true},
    {"name": "negaciones_especificas", "label": "Hechos que se niegan específicamente", "type": "textarea", "required": true},
    {"name": "defensas", "label": "Defensas y excepciones a oponer", "type": "multiselect", "options": ["Falta de legitimación", "Prescripción", "Cosa juzgada", "Compensación", "Pago", "Plus petición", "Defecto legal"], "required": false},
    {"name": "jurisdiccion", "label": "Jurisdicción", "type": "select", "options": ["CABA", "PBA", "nacional"], "required": true},
    {"name": "prueba_ofrecida", "label": "Prueba que ofrece el demandado", "type": "textarea", "required": false}
  ]
}'::jsonb,
'Generá un escrito de contestación de demanda laboral.

Formato:
1. Encabezado con datos del expediente
2. Personería del demandado y letrado
3. Objeto: contesta demanda, opone excepciones
4. Negativa general y particular de hechos (art. 71 LO para CABA o norma procesal según jurisdicción)
5. Versión del demandado sobre los hechos
6. Excepciones y defensas
7. Derecho
8. Impugna liquidación del actor
9. Prueba
10. Petitorio

Datos:
- Expediente: {expediente}
- Carátula: {caratula}
- Juzgado: {juzgado}
- Demandado: {demandado_nombre}, CUIT {demandado_cuit}
- Letrado: {letrado_nombre}, T° {letrado_tomo_folio}
- Actor: {actor_nombre}
- Versión del demandado: {hechos_version_demandado}
- Negaciones específicas: {negaciones_especificas}
- Defensas: {defensas}
- Jurisdicción: {jurisdiccion}
- Prueba: {prueba_ofrecida}

Generá la contestación completa con estilo procesal argentino. Negación general amplia + negaciones específicas detalladas.',
'I. OBJETO
II. PERSONERÍA
III. NEGATIVA
IV. HECHOS - VERSIÓN DEL DEMANDADO
V. EXCEPCIONES Y DEFENSAS
VI. IMPUGNA LIQUIDACIÓN
VII. DERECHO
VIII. PRUEBA
IX. PETITORIO'),

-- 5. Recurso de apelación genérico
('recurso_apelacion', 'generico', 'Recurso de apelación', 'civil', ARRAY['CABA','PBA','nacional'],
'{
  "fields": [
    {"name": "expediente", "label": "Número de expediente", "type": "text", "required": true},
    {"name": "caratula", "label": "Carátula del expediente", "type": "text", "required": true},
    {"name": "juzgado", "label": "Juzgado que dictó la resolución", "type": "text", "required": true},
    {"name": "apelante_nombre", "label": "Nombre del apelante", "type": "text", "required": true},
    {"name": "apelante_caracter", "label": "Carácter (actor/demandado/tercero)", "type": "select", "options": ["actor", "demandado", "tercero"], "required": true},
    {"name": "resolucion_apelada", "label": "Resolución que se apela (fecha y descripción)", "type": "textarea", "required": true},
    {"name": "agravios", "label": "Agravios (por qué la resolución es incorrecta)", "type": "textarea", "required": true},
    {"name": "fuero", "label": "Fuero", "type": "select", "options": ["civil", "laboral", "comercial", "familia"], "required": true},
    {"name": "jurisdiccion", "label": "Jurisdicción", "type": "select", "options": ["CABA", "PBA", "nacional"], "required": true},
    {"name": "plazo_legal", "label": "Plazo legal para apelar (días)", "type": "number", "required": false}
  ]
}'::jsonb,
'Generá un escrito de recurso de apelación.

Formato:
1. Encabezado con datos del expediente
2. Objeto: interpone recurso de apelación
3. Personería del apelante
4. Resolución apelada (identificación, fecha, contenido)
5. Procedencia del recurso (norma procesal que lo habilita según fuero y jurisdicción)
6. Expresión de agravios detallada y fundada
7. Petitorio (revocación total o parcial de la resolución)

Datos:
- Expediente: {expediente}
- Carátula: {caratula}
- Juzgado: {juzgado}
- Apelante: {apelante_nombre} ({apelante_caracter})
- Resolución apelada: {resolucion_apelada}
- Agravios: {agravios}
- Fuero: {fuero}
- Jurisdicción: {jurisdiccion}

Para CABA citar CPCCN arts. 242-245. Para PBA citar CPCC PBA arts. 242-246. Para fuero laboral citar LO art. 105 y ss.
Expresar los agravios como crítica concreta y razonada de la resolución, no como mera disconformidad.',
'I. OBJETO
II. PERSONERÍA
III. RESOLUCIÓN APELADA
IV. PROCEDENCIA DEL RECURSO
V. EXPRESIÓN DE AGRAVIOS
VI. PETITORIO');
