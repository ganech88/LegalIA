# Roadmap de Ejecución — Desarrollo Sin Fronteras

## Proyectos Activos 2026

### Portafolio

| # | Proyecto | Estado | Prioridad | Stack |
|---|----------|--------|-----------|-------|
| 1 | ConsorcioTrust | En desarrollo (40 commits) | Alta — terminar MVP | React + Vite + Supabase |
| 2 | MonoGestión | Nuevo | Alta — mayor mercado | React + Vite + Supabase |
| 3 | LegalIA | Nuevo | Media — más complejo | Next.js + Supabase + Anthropic API |
| 4 | DesarrollosSinFronteras | Live | Baja — mantener | Next.js |
| 5 | AgentEval | Pausado | Baja — portfolio técnico | Next.js + Drizzle + Turborepo |

---

## Estrategia de Ejecución

### Principio: NO hacer todo a la vez

Máximo 2 proyectos en desarrollo activo simultáneo. El tercero queda en planificación/research.

### Mes 1-2: ConsorcioTrust MVP + MonoGestión setup

**Semana 1-2:**
- ConsorcioTrust: cerrar features faltantes del MVP
- ConsorcioTrust: deploy production en Vercel + Supabase Pro
- MonoGestión: crear repo, setup proyecto (Vite + React + Supabase)
- MonoGestión: diseñar y migrar schema de DB

**Semana 3-4:**
- ConsorcioTrust: buscar primeros 5 beta testers (administradores de consorcios)
- MonoGestión: implementar auth + onboarding wizard
- MonoGestión: dashboard principal con barra de progreso de facturación

**Semana 5-6:**
- ConsorcioTrust: iterar con feedback de beta testers
- MonoGestión: CRUD de facturas + cálculo de acumulado
- MonoGestión: sistema de alertas (tope cercano, vencimiento cuota)

**Semana 7-8:**
- ConsorcioTrust: lanzamiento soft (redes, boca a boca)
- MonoGestión: simulador de recategorización
- MonoGestión: integración Mercado Pago para suscripciones

### Mes 3-4: MonoGestión lanzamiento + LegalIA research

**Semana 9-10:**
- MonoGestión: testing completo + fix bugs
- MonoGestión: landing page + deploy production
- LegalIA: research de legislación a ingestar, formato de escritos

**Semana 11-12:**
- MonoGestión: beta testing con monotributistas reales
- MonoGestión: iterar UX basado en feedback
- LegalIA: crear repo Next.js, setup Supabase con pgvector

**Semana 13-14:**
- MonoGestión: lanzamiento público
- LegalIA: implementar auth + onboarding de abogados
- LegalIA: primer generador de escrito (demanda laboral por despido)

**Semana 15-16:**
- MonoGestión: fase 2 (historial, exportación, calculadora de topes)
- LegalIA: asistente IA básico (sin RAG, con system prompt legal)
- LegalIA: 3 tipos de escritos más (carta documento, contestación, apelación)

### Mes 5-6: LegalIA MVP + monetización de todo

**Semana 17-20:**
- LegalIA: RAG con pgvector (ingestión de LCT, CCCN, CPCCN)
- LegalIA: calculadoras legales (indemnización, intereses)
- LegalIA: integración Mercado Pago
- LegalIA: beta testing con abogados

**Semana 21-24:**
- LegalIA: lanzamiento público
- ConsorcioTrust: fase 2 (más features basado en clientes reales)
- MonoGestión: fase 3 (WhatsApp, multi-actividad)
- Todos: optimización de costos, monitoring, métricas de negocio

---

## Infraestructura Compartida

### Plan de costos consolidado

| Servicio | ConsorcioTrust | MonoGestión | LegalIA | Total |
|----------|---------------|-------------|---------|-------|
| Vercel Pro | Compartido | Compartido | Compartido | $20/mes |
| Supabase Pro #1 | ✓ (consorcios) | ✓ (monotributo) | — | $25/mes |
| Supabase Pro #2 | — | — | ✓ (legal + pgvector) | $25/mes |
| Anthropic API | ~$2-5 | $0 | ~$25-40 | ~$30-45/mes |
| OpenAI Embeddings | — | — | ~$5 | $5/mes |
| Resend | Compartido | Compartido | Compartido | $0-20/mes |
| Dominios (3) | $5/año | $5/año | $5/año | ~$15/año |
| Cloudflare DNS | Compartido | Compartido | Compartido | $0 |
| Sentry | Compartido | Compartido | Compartido | $0 (free) |
| **Total mensual** | | | | **~$110-140 USD** |

### Nota sobre Supabase

ConsorcioTrust y MonoGestión pueden compartir la misma instancia de Supabase Pro ($25/mes) usando schemas separados o prefijos en tablas, siempre que ambos estén bajo el mismo owner. LegalIA necesita su propia instancia por pgvector y el volumen de embeddings.

### Dominios sugeridos

- consorciotrust.com.ar (o .app)
- monogestion.com.ar (o monotributo.app)
- legalia.com.ar (o legalia.app)
- desarrollosinfronteras.com (ya existe)

---

## Métricas de Éxito (6 meses)

| Proyecto | Métrica | Target |
|----------|---------|--------|
| ConsorcioTrust | Consorcios activos pagando | 20-30 |
| MonoGestión | Usuarios activos | 100-200 |
| MonoGestión | Suscriptores pagos | 30-50 |
| LegalIA | Abogados registrados | 50-100 |
| LegalIA | Suscriptores pagos | 15-25 |
| DSF (factory) | Proyectos vendidos | 3-5 |
| **Revenue total** | MRR estimado | $300-600 USD equiv. |

---

## Canales de Adquisición por Proyecto

### ConsorcioTrust
- Grupos de WhatsApp de administradores de consorcios
- Colegios de administradores
- Google Ads: "software gestión consorcios argentina"
- Referidos de consorcios existentes

### MonoGestión
- Instagram/TikTok: contenido educativo sobre monotributo
- SEO: "cuánto puedo facturar como monotributista", "recategorización monotributo 2026"
- Grupos de Facebook de monotributistas y emprendedores
- Comunidades de freelancers argentinos
- Partnerships con contadores

### LegalIA
- LinkedIn: contenido para abogados sobre IA + derecho
- Colegios de abogados (CPACF, CASI, CALM)
- Webinars/demos en universidades de derecho
- Google Ads: "software abogados argentina", "calculadora indemnización laboral"
- Referidos de abogados a abogados

---

## Checklist Pre-Lanzamiento (aplica a cada proyecto)

- [ ] Landing page con propuesta de valor clara
- [ ] Auth funcionando (registro + login + recuperar contraseña)
- [ ] Onboarding wizard completo
- [ ] Feature core del MVP funcionando end-to-end
- [ ] Integración de pagos (Mercado Pago)
- [ ] Emails transaccionales configurados (Resend)
- [ ] Error tracking (Sentry)
- [ ] Términos y condiciones + política de privacidad
- [ ] Analytics básico (Vercel Analytics o PostHog)
- [ ] Testing manual completo de flujos críticos
- [ ] Dominio propio configurado con Cloudflare
- [ ] SSL habilitado (Vercel lo da por defecto)
- [ ] Backup de DB verificado (Supabase Pro lo incluye)
- [ ] Plan de soporte definido (email / WhatsApp / chat)
