# LegalIA — Fase 2: el diferencial compuesto
**Fecha:** 02/07/2026 · Basado en revisión completa del código (incl. chat, casos, agenda, templates, onboarding, biblioteca, PWA) + mercado

## La tesis

Ya tenés tres piezas que nadie más tiene juntas: **citas verificadas + liquidación auditable + calculadoras correctas**. La fase 2 no es sumar features sueltas: es componerlas en dos diferenciales que se refuerzan y son difíciles de copiar:

1. **"Todo verificable"** — cada cita contra la ley completa, cada número con fuente y fecha.
2. **"El expediente vivo"** — del telegrama a la sentencia en un solo hilo: caso → comunicaciones → cálculo → demanda → vencimientos.

Hallazgos de la revisión que fundamentan esto: el historial del chat es efímero (se pierde al refrescar), los escritos NO están vinculados a los casos ni a los vencimientos, las tasas de interés están hardcodeadas y desactualizadas, no hay autosave ni versionado del editor, y los templates no distinguen el procedimiento de PBA (ley 15.057, jueces unipersonales y oralidad, hoy operativa) del de CABA — una diferencia procesal real que un laboralista nota al instante.

---

## Tier 1 — Multiplican el diferencial ya construido

**1. RAG real: la ley completa, verificable.** Hoy el semáforo de citas cubre ~70 artículos curados. Ingestar LCT completa (277 arts.), CCCN, CPCCN, LRT, leyes complementarias desde InfoLeg/SAIJ (fuentes públicas oficiales) a pgvector (el schema ya existe). Efecto doble: el asistente responde con fuentes reales sobre cualquier tema, y el semáforo pasa de "no está en mi corpus" a "verificado contra el texto oficial completo". Costo: ~USD 5 de embeddings + un script de ingestión. **Es la inversión con mejor retorno del roadmap.**

**2. Datos vivos con fuente y fecha.** Tabla `indices` + cron que consume APIs públicas oficiales: IPC/RIPTE/CER desde la API de series de tiempo de datos.gob.ar, tasas desde la API del BCRA. Cada calculadora muestra "tasa vigente al DD/MM — fuente: BCRA". Una calculadora con tasa vieja es indefendible en una liquidación; una con fuente y fecha es un argumento de venta. Ningún competidor lo muestra así.

**3. Expediente vivo.** Migración: `caso_id` en `escritos` y `vencimientos` + timeline del caso (comunicaciones, cálculos, escritos, plazos en orden cronológico). El caso pasa de ficha muerta a columna vertebral del producto. Es lo que hace que el abogado no se vaya: su trabajo queda organizado acá.

**4. Checklist pre-presentación por jurisdicción.** Antes de exportar: ¿liquidación incluida? ¿prueba ofrecida completa? ¿reserva del caso federal? ¿competencia correcta? — reglas determinísticas por tipo de escrito + revisión IA, distinguiendo PBA (ley 15.057) de CABA (ley 18.345). "El corrector que te evita la providencia de subsanación." Barato de construir, altísimo valor percibido.

## Tier 2 — Retención (uso diario)

**5. Chat persistente con fuentes clickeables.** Conversaciones guardadas (hoy se pierden al refrescar), citas de la respuesta renderizadas como chips que abren la biblioteca, y 3-4 preguntas sugeridas por especialidad del usuario.

**6. Autosave + versionado del editor.** Tabla `escritos_versiones`, guardado automático cada 30s, y diff "generado vs. editado". Un abogado que perdió 40 minutos de edición no vuelve.

**7. Wizard de comunicaciones laborales.** Secuencia guiada del despido indirecto: intimación registración (art. 11 LNE, con copia AFIP en 24hs) → plazo de respuesta (30 días) → despido indirecto → cálculo → demanda. Cada paso genera el telegrama Y agenda el plazo siguiente. Nadie del mercado encadena esto.

**8. Búsqueda y filtros en historial** de escritos y consultas (hoy no hay).

## Tier 3 — Crecimiento

**9. Modo cliente.** Botón "explicárselo a mi cliente": informe en lenguaje claro (qué reclama, cuánto, plazos) con membrete del estudio, compartible por link o PDF. Ahorra al abogado la hora de explicación y pone tu marca frente al cliente final → loop de referidos.

**10. Onboarding con momento "wow".** Al terminar el registro: demanda de ejemplo precargada generándose en vivo + semáforo de citas funcionando. Hoy el onboarding junta datos y te deja en un dashboard vacío.

**11. Más landings públicas** (plazos procesales, honorarios UMA) con el patrón ya construido de `/herramientas` — cada una es una puerta de entrada SEO.

**12. Programa de referidos**: 1 mes de Profesional por colega que se suscribe.

## Tier 4 — Infra pendiente (requieren credenciales o decisión)

Sentry real · validación de matrícula contra padrones · WhatsApp para vencimientos (Twilio/Meta) · exportación completa de datos del usuario (refuerza confianza Ley 25.326) · Supabase Pro antes de vender.

---

## Orden sugerido de ejecución

**Sprint 1 (ya):** #2 datos vivos + #6 autosave/versionado + #8 filtros — rápidos, sin dependencias.
**Sprint 2:** #3 expediente vivo + #5 chat persistente — una migración y varias pantallas.
**Sprint 3:** #1 RAG completo (necesita OPENAI_API_KEY activa) + #4 checklist por jurisdicción.
**Sprint 4:** #7 wizard laboral + #9 modo cliente + #10 onboarding.

Regla de oro que ya nos funcionó: cada feature debe poder enunciarse como una frase de venta verificable ("cada tasa con fuente y fecha", "nunca perdés una edición", "tu expediente completo en un hilo").
