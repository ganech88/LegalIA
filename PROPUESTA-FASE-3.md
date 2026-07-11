# LegalIA — Fase 3: del producto útil al hábito diario
**Fecha:** 05/07/2026 · Con todo lo de Fase 1 y 2 ya en producción

## El diagnóstico honesto

Hoy LegalIA es fuerte cuando el abogado **ya sabe qué necesita**: generar una demanda, calcular una indemnización, mandar un telegrama. El próximo salto es estar presente en los momentos donde el trabajo **le llega** al abogado — la cédula que aparece, la demanda que le notifican, el cliente que pregunta "¿cómo va mi juicio?". Ahí se construye el hábito diario, y el hábito es lo que hace imposible cancelar la suscripción.

---

## Tier A — El hábito diario (máxima prioridad)

**1. "Subí la cédula" — plazos automáticos desde documentos.** El abogado saca una foto o sube el PDF de la cédula/notificación → la IA detecta tipo de acto, fecha de notificación y tribunal → calcula el vencimiento con días hábiles judiciales (la lib de plazos YA existe) → lo agenda con alerta de email. El momento mágico: *"me notificaron, lo subo, LegalIA ya me agendó el plazo"*. Es un uso DIARIO, de 15 segundos, imposible de abandonar. Nadie del mercado lo resuelve así de simple. Técnica: Claude con visión lee la imagen directamente (sin OCR aparte); reutiliza `lib/legal/plazos.ts` y la agenda existente.

**2. "Me demandaron" — análisis de la demanda recibida.** Subís la demanda de la contraparte → resumen ejecutivo, plazo para contestar (agendado), debilidades detectadas (¿prescripción? cruzar fechas contra la lib de plazos), excepciones y defensas sugeridas con base legal del RAG, y borrador de contestación pre-cargado punto por punto. Convierte el peor momento de la semana en 15 minutos de trabajo dirigido. Es el espejo perfecto del generador: uno ataca, este defiende.

**3. Alertas por WhatsApp.** El email se pierde; el abogado argentino vive en WhatsApp. Vencimientos y avisos por WhatsApp (Twilio/Meta Cloud API, requiere alta de número). Después, segunda etapa: consultarle al asistente por WhatsApp.

## Tier B — Más mercado con lo ya construido (nuevas verticales)

**4. Vertical previsional.** Reajuste de haberes, PUAM, retiro por invalidez — uno de los mayores volúmenes de litigio del país, con miles de abogados previsionalistas mal servidos por el software actual. Entregable: calculadora de movilidad jubilatoria (mismas series de datos.gob.ar que ya consumimos) + template de demanda de reajuste + corpus de leyes 24.241/27.426 y fallos (Badaro, Elliff, Blanco). Duplica el mercado direccionable reutilizando toda la infraestructura.

**5. Amparos de salud.** Prepagas y obras sociales que niegan coberturas: es urgente, repetitivo y de alta frecuencia — el caso perfecto para templates. Amparo con medida cautelar + checklist específico + corpus ley 26.682/23.660/24.901 (discapacidad). Los abogados de familia/civil generalistas los hacen todo el tiempo.

**6. ART completo.** Ya existe la calculadora 24.557; falta el flujo: reclamo ante comisión médica SRT → revisión judicial (ley 27.348) → demanda. Templates + plazos del procedimiento administrativo agendados.

## Tier C — Retención y expansión de cuentas

**7. Portal del cliente.** El dolor silencioso del abogado: el cliente que llama cada semana preguntando "¿cómo va mi juicio?". Solución: link compartible por caso (token, sin login) con el estado en lenguaje claro, próximos pasos y branding del estudio. El abogado gana horas; el cliente final ve LegalIA → funnel de nuevos abogados. Sube el valor del plan Estudio.

**8. Onboarding con momento wow.** Al registrarse: demanda de ejemplo generándose en vivo + semáforo de citas funcionando. Hoy el primer login te deja en un dashboard vacío — es la mayor fuga del funnel.

**9. Tablero del estudio.** Montos totales en juego, casos por etapa, vencimientos de la semana, escritos generados por miembro. Para el plan Estudio: la vista del socio.

## Tier D — Moat técnico y adquisición

**10. RAG ampliado**: CCCN completo, leyes procesales 18.345 y 15.057 completas, 24.013, y jurisprudencia CSJN/SAIJ con actualización periódica. Cada ley que entra hace más potente el semáforo de citas y el asistente.

**11. Blog de fallos automatizado**: cron semanal que toma fallos nuevos, genera el comentario con IA (revisión humana), publica en `/blog` → SEO compuesto sobre el dominio nuevo. Cada fallo comentado es una puerta de entrada.

**12. Google Search Console + schema.org** en las herramientas públicas (FAQPage, SoftwareApplication) para acelerar indexación y rich results.

---

## Cómo se enuncia el diferencial (para vender)

- *"Sacale una foto a la cédula. LegalIA te agenda el plazo."* (nadie lo tiene)
- *"¿Te demandaron? Subila. En 15 minutos tenés el análisis y el borrador de contestación."*
- *"Tu cliente ya no te llama a preguntar cómo va el juicio: tiene su link."*
- Y el paraguas de siempre: *"Todo verificable — citas contra la ley completa, números con fuente y fecha."*

## Orden de ejecución sugerido

**Sprint próximo:** #1 Subí la cédula + #8 onboarding wow (los dos usan lo que ya existe; #1 define el hábito).
**Después:** #2 análisis de demanda recibida + #7 portal del cliente.
**Luego:** #4 vertical previsional (nuevo mercado) + #10 RAG ampliado.
**Continuo:** #11 blog SEO + #12 Search Console.
**Cuando haya credenciales:** #3 WhatsApp (necesita alta en Twilio/Meta).
