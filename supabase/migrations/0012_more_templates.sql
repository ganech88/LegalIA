INSERT INTO escrito_templates (tipo, subtipo, nombre_display, fuero, jurisdiccion, campos_requeridos, template_prompt, template_estructura) VALUES

-- 1. Demanda por accidente de trabajo (Ley 24.557)
('demanda_laboral', 'accidente_trabajo', 'Demanda por accidente de trabajo', 'laboral', ARRAY['CABA','PBA','nacional'],
'{
  "fields": [
    {"name": "actor_nombre", "label": "Nombre completo del actor", "type": "text", "required": true},
    {"name": "actor_dni", "label": "DNI del actor", "type": "text", "required": true},
    {"name": "actor_domicilio", "label": "Domicilio real del actor", "type": "text", "required": true},
    {"name": "demandado_nombre", "label": "Razón social del empleador", "type": "text", "required": true},
    {"name": "demandado_cuit", "label": "CUIT del empleador", "type": "text", "required": true},
    {"name": "demandado_domicilio", "label": "Domicilio del empleador", "type": "text", "required": true},
    {"name": "art_nombre", "label": "Nombre de la ART demandada", "type": "text", "required": true},
    {"name": "art_cuit", "label": "CUIT de la ART", "type": "text", "required": true},
    {"name": "fecha_ingreso", "label": "Fecha de ingreso laboral", "type": "date", "required": true},
    {"name": "fecha_accidente", "label": "Fecha del accidente/enfermedad", "type": "date", "required": true},
    {"name": "descripcion_accidente", "label": "Descripción del accidente o enfermedad profesional", "type": "textarea", "required": true},
    {"name": "lesiones", "label": "Lesiones y/o patologías diagnosticadas", "type": "textarea", "required": true},
    {"name": "porcentaje_incapacidad", "label": "Porcentaje de incapacidad estimado (%)", "type": "number", "required": true},
    {"name": "mejor_remuneracion", "label": "Mejor remuneración mensual ($)", "type": "number", "required": true},
    {"name": "tratamiento_medico", "label": "Tratamiento médico realizado/pendiente", "type": "textarea", "required": false},
    {"name": "jurisdiccion", "label": "Jurisdicción", "type": "select", "options": ["CABA", "PBA", "nacional"], "required": true},
    {"name": "hechos", "label": "Hechos adicionales relevantes", "type": "textarea", "required": false}
  ]
}'::jsonb,
'Generá un escrito de demanda por accidente de trabajo / enfermedad profesional en el marco de la Ley 24.557 de Riesgos del Trabajo y sus modificatorias (Ley 26.773), para ser presentado ante la justicia de {jurisdiccion}.

Formato del escrito:
1. Encabezado con objeto de la demanda
2. Personería del actor y letrado
3. Hechos (relación laboral, descripción del accidente/enfermedad, atención médica, consecuencias)
4. Derecho aplicable (Ley 24.557, Ley 26.773, arts. 1737-1740 CCCN, art. 75 LCT, Decreto 658/96 si es enfermedad profesional)
5. Inconstitucionalidad del art. 39 LRT si corresponde (opción de reclamo integral vía derecho civil)
6. Liquidación detallada (fórmulas LRT y/o derecho civil)
7. Prueba (documental, testimonial, pericial médica, pericial contable, informativa)
8. Reserva del caso federal
9. Petitorio

Datos del caso:
- Actor: {actor_nombre}, DNI {actor_dni}, domicilio {actor_domicilio}
- Empleador: {demandado_nombre}, CUIT {demandado_cuit}, domicilio {demandado_domicilio}
- ART: {art_nombre}, CUIT {art_cuit}
- Fecha ingreso: {fecha_ingreso}
- Fecha accidente: {fecha_accidente}
- Descripción: {descripcion_accidente}
- Lesiones: {lesiones}
- Incapacidad estimada: {porcentaje_incapacidad}%
- Mejor remuneración: ${mejor_remuneracion}
- Tratamiento: {tratamiento_medico}
- Hechos adicionales: {hechos}

Generá el escrito completo con estilo procesal argentino. Incluí cálculos indemnizatorios según fórmulas de la LRT.',
'I. OBJETO
II. PERSONERÍA
III. HECHOS
IV. DERECHO
V. PLANTEO DE INCONSTITUCIONALIDAD
VI. LIQUIDACIÓN
VII. PRUEBA
  a) Documental
  b) Testimonial
  c) Pericial médica
  d) Pericial contable
  e) Informativa
VIII. RESERVA CASO FEDERAL
IX. PETITORIO'),

-- 2. Demanda civil por daños y perjuicios
('demanda_civil', 'danos_perjuicios', 'Demanda civil por daños y perjuicios', 'civil', ARRAY['CABA','PBA','nacional'],
'{
  "fields": [
    {"name": "actor_nombre", "label": "Nombre completo del actor", "type": "text", "required": true},
    {"name": "actor_dni", "label": "DNI del actor", "type": "text", "required": true},
    {"name": "actor_domicilio", "label": "Domicilio del actor", "type": "text", "required": true},
    {"name": "demandado_nombre", "label": "Nombre/Razón social del demandado", "type": "text", "required": true},
    {"name": "demandado_domicilio", "label": "Domicilio del demandado", "type": "text", "required": true},
    {"name": "demandado_dni_cuit", "label": "DNI/CUIT del demandado", "type": "text", "required": false},
    {"name": "tipo_responsabilidad", "label": "Tipo de responsabilidad", "type": "select", "options": ["Contractual", "Extracontractual"], "required": true},
    {"name": "hechos", "label": "Hechos que originan el reclamo", "type": "textarea", "required": true},
    {"name": "dano_material", "label": "Descripción del daño material/patrimonial", "type": "textarea", "required": true},
    {"name": "dano_moral", "label": "Descripción del daño moral", "type": "textarea", "required": false},
    {"name": "monto_reclamado", "label": "Monto total reclamado ($)", "type": "number", "required": true},
    {"name": "prueba_disponible", "label": "Prueba con la que cuenta", "type": "textarea", "required": false},
    {"name": "jurisdiccion", "label": "Jurisdicción", "type": "select", "options": ["CABA", "PBA", "nacional"], "required": true},
    {"name": "citacion_terceros", "label": "Citación en garantía (aseguradora, etc.)", "type": "text", "required": false}
  ]
}'::jsonb,
'Generá un escrito de demanda civil por daños y perjuicios para ser presentado ante la justicia de {jurisdiccion}.

Formato del escrito:
1. Encabezado con objeto de la demanda
2. Personería del actor y letrado
3. Hechos (descripción detallada y cronológica de los hechos dañosos)
4. Daño (material, moral, lucro cesante, pérdida de chance según corresponda)
5. Relación de causalidad
6. Factor de atribución (dolo, culpa, riesgo, garantía)
7. Derecho aplicable (arts. 1708-1780 CCCN según tipo de responsabilidad, art. 1737 daño resarcible, art. 1738 indemnización, art. 1741 daño moral)
8. Citación en garantía si corresponde (Ley 17.418)
9. Monto del reclamo con detalle de rubros
10. Prueba
11. Petitorio

Datos del caso:
- Actor: {actor_nombre}, DNI {actor_dni}, domicilio {actor_domicilio}
- Demandado: {demandado_nombre}, DNI/CUIT {demandado_dni_cuit}, domicilio {demandado_domicilio}
- Tipo responsabilidad: {tipo_responsabilidad}
- Hechos: {hechos}
- Daño material: {dano_material}
- Daño moral: {dano_moral}
- Monto reclamado: ${monto_reclamado}
- Prueba disponible: {prueba_disponible}
- Citación en garantía: {citacion_terceros}

Generá la demanda completa con estilo procesal argentino. Detallá cada rubro indemnizatorio por separado.',
'I. OBJETO
II. PERSONERÍA
III. HECHOS
IV. DAÑO
  a) Daño material
  b) Daño moral
  c) Otros rubros
V. RELACIÓN DE CAUSALIDAD
VI. FACTOR DE ATRIBUCIÓN
VII. DERECHO
VIII. CITACIÓN EN GARANTÍA
IX. MONTO DEL RECLAMO
X. PRUEBA
XI. PETITORIO'),

-- 3. Escrito de ofrecimiento de prueba (genérico)
('ofrecimiento_prueba', 'generico', 'Escrito de ofrecimiento de prueba', 'civil', ARRAY['CABA','PBA','nacional'],
'{
  "fields": [
    {"name": "expediente", "label": "Número de expediente", "type": "text", "required": true},
    {"name": "caratula", "label": "Carátula del expediente", "type": "text", "required": true},
    {"name": "juzgado", "label": "Juzgado interviniente", "type": "text", "required": true},
    {"name": "parte_nombre", "label": "Nombre de la parte que ofrece prueba", "type": "text", "required": true},
    {"name": "parte_caracter", "label": "Carácter procesal", "type": "select", "options": ["actora", "demandada", "tercero"], "required": true},
    {"name": "fuero", "label": "Fuero", "type": "select", "options": ["civil", "laboral", "comercial", "familia"], "required": true},
    {"name": "jurisdiccion", "label": "Jurisdicción", "type": "select", "options": ["CABA", "PBA", "nacional"], "required": true},
    {"name": "documental", "label": "Prueba documental (listar documentos)", "type": "textarea", "required": false},
    {"name": "testimonial", "label": "Testigos (nombre, DNI, domicilio de cada uno)", "type": "textarea", "required": false},
    {"name": "pericial", "label": "Pericias solicitadas y puntos de pericia", "type": "textarea", "required": false},
    {"name": "informativa", "label": "Oficios a librar (entidad y dato requerido)", "type": "textarea", "required": false},
    {"name": "confesional", "label": "Posiciones para absolución (si corresponde)", "type": "textarea", "required": false}
  ]
}'::jsonb,
'Generá un escrito de ofrecimiento de prueba para ser presentado en el expediente indicado, ante la justicia de {jurisdiccion}, fuero {fuero}.

Formato del escrito:
1. Encabezado con datos del expediente
2. Objeto: ofrece prueba
3. Prueba documental (enumerada, con reserva de agregar en original)
4. Prueba testimonial (datos completos de cada testigo, con citación judicial subsidiaria)
5. Prueba pericial (tipo de pericia, puntos de pericia detallados)
6. Prueba informativa (oficios, con detalle de qué se solicita a cada entidad)
7. Prueba confesional / absolución de posiciones (si corresponde)
8. Petitorio

Datos:
- Expediente: {expediente}
- Carátula: {caratula}
- Juzgado: {juzgado}
- Parte: {parte_nombre} ({parte_caracter})
- Fuero: {fuero}
- Jurisdicción: {jurisdiccion}
- Documental: {documental}
- Testimonial: {testimonial}
- Pericial: {pericial}
- Informativa: {informativa}
- Confesional: {confesional}

Para fuero laboral en CABA citar arts. de la LO 18.345. Para civil en CABA citar CPCCN arts. 360 y ss. Para PBA citar CPCC PBA.
Generá el escrito completo con estilo procesal argentino.',
'I. OBJETO
II. PRUEBA DOCUMENTAL
III. PRUEBA TESTIMONIAL
IV. PRUEBA PERICIAL
V. PRUEBA INFORMATIVA
VI. PRUEBA CONFESIONAL
VII. PETITORIO'),

-- 4. Solicitud de medida cautelar
('medida_cautelar', 'generica', 'Solicitud de medida cautelar', 'civil', ARRAY['CABA','PBA','nacional'],
'{
  "fields": [
    {"name": "expediente", "label": "Número de expediente (si existe)", "type": "text", "required": false},
    {"name": "caratula", "label": "Carátula del expediente", "type": "text", "required": true},
    {"name": "juzgado", "label": "Juzgado interviniente", "type": "text", "required": false},
    {"name": "solicitante_nombre", "label": "Nombre del solicitante", "type": "text", "required": true},
    {"name": "solicitante_domicilio", "label": "Domicilio del solicitante", "type": "text", "required": true},
    {"name": "contra_quien", "label": "Contra quién se solicita la medida", "type": "text", "required": true},
    {"name": "tipo_medida", "label": "Tipo de medida cautelar", "type": "select", "options": ["Embargo preventivo", "Inhibición general de bienes", "Anotación de litis", "Prohibición de innovar", "Prohibición de contratar", "Medida cautelar innovativa", "Secuestro", "Intervención judicial"], "required": true},
    {"name": "verosimilitud_derecho", "label": "Fundamento de la verosimilitud del derecho", "type": "textarea", "required": true},
    {"name": "peligro_demora", "label": "Fundamento del peligro en la demora", "type": "textarea", "required": true},
    {"name": "contracautela", "label": "Contracautela ofrecida", "type": "select", "options": ["Caución juratoria", "Caución real", "Caución personal"], "required": true},
    {"name": "monto_cautelar", "label": "Monto de la medida ($) si aplica", "type": "number", "required": false},
    {"name": "jurisdiccion", "label": "Jurisdicción", "type": "select", "options": ["CABA", "PBA", "nacional"], "required": true},
    {"name": "bienes_afectados", "label": "Bienes sobre los que recae la medida (si aplica)", "type": "textarea", "required": false}
  ]
}'::jsonb,
'Generá un escrito de solicitud de medida cautelar de tipo {tipo_medida} para ser presentado ante la justicia de {jurisdiccion}.

Formato del escrito:
1. Encabezado con datos del expediente (si existe) o como medida previa
2. Objeto: solicita medida cautelar
3. Hechos que fundan el pedido
4. Verosimilitud del derecho (fumus boni iuris)
5. Peligro en la demora (periculum in mora)
6. Tipo de medida y alcance
7. Contracautela ofrecida
8. Derecho aplicable (arts. 195-233 CPCCN para CABA/nacional, o CPCC PBA arts. 195-233 según jurisdicción)
9. Petitorio

Datos:
- Expediente: {expediente}
- Carátula: {caratula}
- Juzgado: {juzgado}
- Solicitante: {solicitante_nombre}, domicilio {solicitante_domicilio}
- Contra: {contra_quien}
- Tipo de medida: {tipo_medida}
- Verosimilitud del derecho: {verosimilitud_derecho}
- Peligro en la demora: {peligro_demora}
- Contracautela: {contracautela}
- Monto: ${monto_cautelar}
- Bienes afectados: {bienes_afectados}

Generá el escrito completo, fundado en doctrina y jurisprudencia. Estilo procesal argentino formal.',
'I. OBJETO
II. HECHOS
III. VEROSIMILITUD DEL DERECHO
IV. PELIGRO EN LA DEMORA
V. MEDIDA SOLICITADA
VI. CONTRACAUTELA
VII. DERECHO
VIII. PETITORIO'),

-- 5. Acta de mediación - Solicitud
('mediacion', 'solicitud', 'Acta de mediación — Solicitud', 'civil', ARRAY['CABA','PBA','nacional'],
'{
  "fields": [
    {"name": "requirente_nombre", "label": "Nombre del requirente", "type": "text", "required": true},
    {"name": "requirente_dni", "label": "DNI del requirente", "type": "text", "required": true},
    {"name": "requirente_domicilio", "label": "Domicilio del requirente", "type": "text", "required": true},
    {"name": "letrado_nombre", "label": "Nombre del letrado patrocinante", "type": "text", "required": true},
    {"name": "letrado_matricula", "label": "Matrícula del letrado", "type": "text", "required": true},
    {"name": "requerido_nombre", "label": "Nombre del requerido", "type": "text", "required": true},
    {"name": "requerido_domicilio", "label": "Domicilio del requerido", "type": "text", "required": true},
    {"name": "fuero", "label": "Fuero", "type": "select", "options": ["civil", "familia", "comercial"], "required": true},
    {"name": "jurisdiccion", "label": "Jurisdicción", "type": "select", "options": ["CABA", "PBA", "nacional"], "required": true},
    {"name": "objeto_mediacion", "label": "Objeto de la mediación", "type": "textarea", "required": true},
    {"name": "hechos", "label": "Hechos que motivan el reclamo", "type": "textarea", "required": true},
    {"name": "monto_estimado", "label": "Monto estimado del reclamo ($)", "type": "number", "required": false},
    {"name": "mediador_preferencia", "label": "Mediador de preferencia (si tiene)", "type": "text", "required": false}
  ]
}'::jsonb,
'Generá un formulario de solicitud de mediación prejudicial obligatoria según Ley 26.589 (y Ley 13.951 para PBA si corresponde), para ser presentada ante la justicia de {jurisdiccion}, fuero {fuero}.

Formato:
1. Datos del requirente y letrado patrocinante
2. Datos del requerido
3. Objeto de la mediación
4. Hechos que fundan el reclamo
5. Monto estimado
6. Mediador (sorteo o elección)
7. Fundamento legal (Ley 26.589 para CABA/nacional, Ley 13.951 para PBA, normativa de familia si corresponde)
8. Petitorio

Datos:
- Requirente: {requirente_nombre}, DNI {requirente_dni}, domicilio {requirente_domicilio}
- Letrado: {letrado_nombre}, matrícula {letrado_matricula}
- Requerido: {requerido_nombre}, domicilio {requerido_domicilio}
- Fuero: {fuero}
- Jurisdicción: {jurisdiccion}
- Objeto: {objeto_mediacion}
- Hechos: {hechos}
- Monto estimado: ${monto_estimado}
- Mediador preferencia: {mediador_preferencia}

Generá la solicitud completa, formal, lista para presentar ante el centro de mediación correspondiente.',
'I. DATOS DEL REQUIRENTE
II. DATOS DEL LETRADO
III. DATOS DEL REQUERIDO
IV. OBJETO DE LA MEDIACIÓN
V. HECHOS
VI. MONTO ESTIMADO
VII. MEDIADOR
VIII. DERECHO
IX. PETITORIO');
