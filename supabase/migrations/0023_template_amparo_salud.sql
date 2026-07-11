-- Vertical amparos de salud: prepagas / obras sociales que niegan cobertura.
-- Urgente, repetitivo, alta frecuencia: el caso perfecto para un template.
INSERT INTO escrito_templates (tipo, subtipo, nombre_display, fuero, jurisdiccion, campos_requeridos, template_prompt, template_estructura) VALUES
('amparo', 'amparo_salud', 'Amparo de salud con medida cautelar', 'civil', ARRAY['CABA','PBA','nacional'],
'{
  "fields": [
    {"name": "actor_nombre", "label": "Nombre completo del amparista", "type": "text", "required": true},
    {"name": "actor_dni", "label": "DNI del amparista", "type": "text", "required": true},
    {"name": "actor_domicilio", "label": "Domicilio real del amparista", "type": "text", "required": true},
    {"name": "demandado_nombre", "label": "Obra social / prepaga demandada", "type": "text", "required": true},
    {"name": "demandado_cuit", "label": "CUIT de la demandada", "type": "text", "required": false},
    {"name": "tipo_cobertura", "label": "Tipo de entidad", "type": "select", "options": ["prepaga (ley 26.682)", "obra social (ley 23.660)", "ambas / derivación"], "required": true},
    {"name": "prestacion_negada", "label": "Prestación / medicamento / tratamiento negado", "type": "textarea", "required": true},
    {"name": "diagnostico", "label": "Diagnóstico y cuadro de salud", "type": "textarea", "required": true},
    {"name": "es_discapacidad", "label": "¿Involucra certificado de discapacidad (ley 24.901)?", "type": "select", "options": ["sí", "no"], "required": true},
    {"name": "prescripcion_medica", "label": "Prescripción médica (médico, fecha, contenido)", "type": "textarea", "required": true},
    {"name": "negativa_detalle", "label": "Negativa de la demandada (fecha, forma, motivo alegado)", "type": "textarea", "required": true},
    {"name": "reclamos_previos", "label": "Reclamos previos realizados (CD, notas, Superintendencia)", "type": "textarea", "required": false},
    {"name": "urgencia", "label": "Urgencia / riesgo para la salud si no se otorga ya", "type": "textarea", "required": true},
    {"name": "jurisdiccion", "label": "Jurisdicción", "type": "select", "options": ["CABA", "PBA", "nacional"], "required": true},
    {"name": "hechos", "label": "Hechos adicionales relevantes", "type": "textarea", "required": false}
  ]
}'::jsonb,
'Generá una acción de amparo de salud con solicitud de medida cautelar, para ser presentada ante la justicia de {jurisdiccion} (si la demandada es obra social nacional o prepaga con derivación de aportes, fuero federal: art. 38 ley 23.661; indicalo en el encabezado).

Formato del escrito:
1. Encabezado con objeto (amparo art. 43 CN y ley 16.986 + medida cautelar)
2. Personería
3. Legitimación y procedencia formal del amparo (acto lesivo actual, arbitrariedad manifiesta, inexistencia de vía más idónea)
4. Hechos (cuadro de salud, prescripción médica, negativa, reclamos previos)
5. Derecho: art. 42 y 43 CN, tratados con jerarquía constitucional (art. 75 inc. 22: DUDH, PIDESC art. 12), ley 23.660/23.661 (obras sociales), ley 26.682 (prepagas), PMO (res. 201/2002 MS y modif.), y ley 24.901 si {es_discapacidad} = sí. Jurisprudencia CSJN sobre derecho a la salud (doctrina de "Campodónico de Beviacqua", "Asociación Benghalensis") citada con prudencia y sin inventar.
6. Medida cautelar: verosimilitud del derecho (prescripción médica + marco normativo) y peligro en la demora ({urgencia}). Solicitar que se ordene la cobertura inmediata bajo apercibimiento de astreintes (art. 804 CCCN).
7. Prueba documental acompañada (historia clínica, prescripción, negativa, carnet/afiliación, CUD si aplica)
8. Reserva del caso federal
9. Petitorio

Datos del caso:
- Amparista: {actor_nombre}, DNI {actor_dni}, domicilio {actor_domicilio}
- Demandada: {demandado_nombre} ({tipo_cobertura}), CUIT {demandado_cuit}
- Prestación negada: {prestacion_negada}
- Diagnóstico: {diagnostico}
- Discapacidad (ley 24.901): {es_discapacidad}
- Prescripción médica: {prescripcion_medica}
- Negativa: {negativa_detalle}
- Reclamos previos: {reclamos_previos}
- Urgencia: {urgencia}
- Hechos adicionales: {hechos}

Generá el escrito completo, formal, con estilo procesal argentino. NUNCA inventes citas de fallos ni números de resolución que no conozcas con certeza; si dudás, referí a la norma de manera genérica.',
'I. OBJETO
II. PERSONERÍA
III. PROCEDENCIA FORMAL DEL AMPARO
IV. HECHOS
V. DERECHO
VI. MEDIDA CAUTELAR
VII. PRUEBA
VIII. RESERVA DEL CASO FEDERAL
IX. PETITORIO');
