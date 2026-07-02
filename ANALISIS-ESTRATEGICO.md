# LegalIA — Análisis estratégico completo
**Fecha:** 01/07/2026 · Auditoría de código + investigación de mercado

---

## 1. Diagnóstico: dónde está parado el producto

El producto está mucho más avanzado que el CLAUDE.md: generador de escritos (5+ tipos, incluido personalizado), asistente IA con fallback multi-proveedor (Anthropic → Groq → Gemini), 7 calculadoras (art. 245, ART, intereses, actualización, plazos procesales, honorarios ley 27.423), agenda de vencimientos con cron + email, mini CRM de casos, multiusuario (plan Estudio), biblioteca legal, modo revisión de escritos, editor con export DOCX con membrete, PWA, billing Mercado Pago (scaffold), compliance básico (términos, privacidad, supresión de cuenta).

**Nota general: 6.5/10 técnico, 4/10 listo-para-vender.** Lo que falta no es cantidad de features, es confiabilidad y diferencial defendible.

### Lo que NO es lo que dice ser

| Promesa | Realidad |
|---|---|
| "RAG verificado con pgvector" | Es **keyword search** sobre un corpus hardcodeado de 272 líneas (`lib/legal/rag.ts` → `buscarEnCorpus`). No hay embeddings en producción. |
| "Cita artículos reales" | Cierto solo si el corpus tiene el tema. Corpus: ~21 arts. LCT, 13 CCCN, 6 CPCCN, 3 LRT, un puñado de fallos. Fuera de eso, el LLM improvisa → **riesgo de alucinación, el pecado capital del producto**. |
| Billing operativo | Scaffold sin `MP_ACCESS_TOKEN` cargado, y el webhook **no valida firma HMAC de Mercado Pago** (`app/api/billing/webhook/route.ts`) → cualquiera puede forjar un upgrade. |

---

## 2. Correcciones críticas antes de vender (bloqueantes)

1. **Validar firma `x-signature` en el webhook de MP.** Sin esto, fraude de suscripción trivial.
2. **Sanitizar inputs del usuario en prompts** (`generate-escrito`, `chat`): los `datos_caso` van directo al prompt → prompt injection. Delimitar con tags, instruir al modelo a tratar el contenido como datos.
3. **Verificación post-generación de citas:** paso automático que chequee cada artículo/fallo citado contra el corpus y marque en el editor lo no verificado ("⚠ cita no verificada — revisar"). Esto convierte tu mayor riesgo en tu mayor argumento de venta.
4. **Rate limiting global por IP** (hoy solo por usuario autenticado) + logging centralizado de errores (Sentry está en el stack pero no cableado).
5. **Validación de matrícula en onboarding** (aunque sea declarativa + verificación async contra padrones públicos CPACF/CASI). Compliance: no dar asesoramiento a no-abogados.

---

## 3. El mercado se movió: tu diferencial del CLAUDE.md ya no existe

La tabla de competencia del CLAUDE.md quedó vieja. En 2026 ya compiten directo con vos:

| Competidor | Qué hace | Precio | Amenaza |
|---|---|---|---|
| **Argus Legal** | Genera el escrito completo, entrenado con +260.000 fallos SAIJ/CSJN, +750 estudios. Planes por volumen (10/30/60 escritos/mes) | s/cotización | **Alta** — es exactamente tu propuesta, con más corpus y tracción |
| **Veredicta** | Gestión + jurisprudencia IA (500.000+ fuentes) + integración PJN + bot WhatsApp | Free + Pro USD 20/usuario | **Alta** — plan free permanente, muy agresivo |
| **RivoLegal** | Gestión integral + IA + PJN | desde $49.000/mes | Media |
| **MetaJurídico** | Gestión de escritorio, 1.400 estudios, integra PJN/MEV/EJE, IA por WhatsApp | s/cotización | Media — incumbente con convenio CPACF |

**Conclusión dura:** "genera escritos con IA y cita leyes argentinas" ya es mesa de entrada, no diferencial. Competir por corpus (260k fallos de Argus) o por integraciones (PJN de Veredicta/Meta) de frente es perder.

---

## 4. Diferenciales reales que podés construir (y nadie tiene bien)

**A. El flujo laboral completo, no el escrito suelto.** Ya tenés las piezas que los demás no: calculadoras correctas (art. 245, ART, intereses CNAT, plazos, honorarios) **encadenadas** al escrito (ya existe el prellenado calculadora→demanda vía sessionStorage). Duplicá esa apuesta: *"De la consulta del cliente a la demanda liquidada en 15 minutos"* — telegrama → cálculo de indemnización → demanda con liquidación auditable rubro por rubro → agenda de plazos procesales del expediente. Ningún competidor une cálculo + escrito + vencimientos.

**B. Citas verificadas con semáforo.** Argus presume corpus gigante; vos podés presumir *honestidad verificable*: cada cita del escrito con ✅ verificada / ⚠ revisar, y link al texto de la norma en tu biblioteca. Para un abogado que responde con su matrícula, eso vale más que volumen.

**C. Liquidaciones defendibles.** El número de una demanda laboral es lo que más miedo da errar. Exportá la liquidación como anexo con fórmula, tasa y fuente de cada rubro (incluido Ley 25.323 y multa art. 80 que ya calculás). Es tu feature más difícil de copiar porque exige derecho, no solo prompts.

**D. Nicho antes que país.** 150.000 abogados es un mercado, no un target. Dominá **laboralistas independientes de CABA/PBA** primero: es donde tus calculadoras y templates son más fuertes, el volumen de juicios es enorme y el dolor (liquidar bien, no perder plazos) es diario.

### Oportunidades de producto (orden de impacto/esfuerzo)

1. **RAG real con pgvector** (el schema ya existe): ingestar LCT, CCCN, LRT y CPCCN completos + fallos SAIJ (fuente pública). Cierra la brecha de corpus a bajo costo.
2. **Tasas vivas:** actualizar automáticamente tasa activa BNA, CNAT 2601/2764, RIPTE, IPC vía cron (ya tenés la infraestructura de cron). Una calculadora con tasa vieja destruye confianza.
3. **Integración PJN/MEV** (fase 2, es lo que más piden los abogados según toda la competencia lo publicita): aunque sea importar carátula y movimientos del expediente.
4. **Plantillas de estilo por abogado:** aprender de escritos que el usuario sube (ya está en tu Fase 3; Argus ya lo ofrece — no te quedes atrás).
5. **WhatsApp para vencimientos** además de email: el abogado argentino vive en WhatsApp.
6. **Pay-as-you-go** ($x por escrito extra) para suavizar el salto free→profesional.

---

## 5. Cómo venderlo

**Posicionamiento:** *"LegalIA: la demanda laboral liquidada, citada y verificada. Vos la firmás, nosotros te mostramos por qué cada número y cada artículo es correcto."* Atacá el miedo (alucinación, liquidación errada, plazo vencido), no la pereza.

**Pricing (ajuste sugerido):**
- Free permanente (como Veredicta): 3 escritos + calculadoras **ilimitadas** → las calculadoras son tu gancho de adquisición SEO/boca a boca, no las encierres.
- Profesional $15.000–18.000/mes (hoy $12.000 está barato vs. RivoLegal $49.000; subí antes de tener base instalada).
- Estudio $30.000–35.000/mes, 5 usuarios.
- Anual ×10 (ya implementado). Precios en pesos = ventaja contra Veredicta (USD 20 ≈ volátil).

**Canales, en orden:**
1. **SEO de herramientas gratis:** "calculadora indemnización despido 2026", "plazos procesales PBA", "honorarios UMA hoy" — tráfico de intención altísima que ya resolvés mejor que nadie. Cada calculadora, una landing indexable con CTA "generá la demanda con estos números".
2. **Convenios con colegios de abogados** (CPACF, CASI, CALM): descuento a matriculados. MetaJurídico ya lo hace con CPACF — es el canal de confianza del rubro.
3. **Contenido en el idioma del gremio:** newsletter/LinkedIn con fallos nuevos y tablas de tasas actualizadas (ya tenés el corpus y el cron; el newsletter de tu Fase 3 es también canal de venta).
4. **Referidos:** 1 mes gratis por colega matriculado (ya está en tus pendientes).
5. **Demos en vivo de 20 min** por Zoom a estudios de 2-5 abogados: el producto se vende solo mostrando el flujo telegrama→demanda.

**Métrica norte:** escritos efectivamente presentados en tribunales por usuarios pagos. Si un abogado presenta 2 escritos hechos con LegalIA, no se va más.

---

## 6. Plan 30/60/90

**30 días — confiable:** firma HMAC webhook + MP productivo · sanitización de prompts · verificación de citas con semáforo · Sentry cableado · tasas BNA/CNAT actualizadas · subir precio Profesional.
**60 días — diferencial:** RAG real (leyes completas + fallos SAIJ en pgvector) · liquidación como anexo auditable · calculadoras como landings públicas SEO · free permanente con calculadoras abiertas.
**90 días — crecimiento:** convenio con un colegio (empezar por CASI o CALM, más accesibles que CPACF) · WhatsApp de vencimientos · programa de referidos · primer caso de éxito documentado (con permiso, sin datos del cliente).

---

## Anexo: deuda técnica relevante

Cobertura de tests ~2% (solo calculadoras/plazos/honorarios — al menos es donde más importa); sin logging centralizado; funciones de uso (`decrement_usage`) invocables por el usuario vía RPC (mover a service role desde las API routes); Supabase free se auto-pausa por inactividad (recurrente — con ventas hay que pasar a Pro); corpus sin leyes post-2024 (teletrabajo 27.555, reformas recientes) ni jurisprudencia 2025/2026.
