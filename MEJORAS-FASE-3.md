# LegalIA — Fase 3 implementada
**Fecha:** 11/07/2026 · Commits 8e9be63 + d83674d · Deploy verificado en producción

## Qué se construyó (contra PROPUESTA-FASE-3.md)

### 1. "Subí la cédula" (`/agenda/cedula` + `/api/analizar-documento` modo `cedula`)
Foto o PDF de la cédula/notificación → Claude Sonnet con visión detecta tipo de acto, fecha de notificación, tribunal, carátula y plazo sugerido (con preset de `lib/legal/plazos.ts`) → el abogado ajusta fecha/plazo → un clic agenda el vencimiento con alerta por email. Los archivos NO se almacenan (van al modelo y se descartan). Cuenta como 1 consulta; se devuelve el crédito si falla. Límite 4 MB, rate limit 10/min por IP, defensa anti prompt-injection en el prompt.

### 2. "Me demandaron" (`/escritos/contestar` + modo `demanda`)
Pegás el texto o subís el PDF de la demanda recibida → resumen ejecutivo, partes, plazo de contestación con fundamento, debilidades detectadas, defensas sugeridas con base legal, excepciones posibles y prueba a reunir → botón "Generar borrador de contestación" que arma la descripción y llama al generador existente.

### 3. Portal del cliente (`/portal/[token]` + migración 0022)
Toggle "Portal del cliente" en la ficha de cada caso → genera un link con token UUID no adivinable → el cliente ve (sin cuenta): carátula, estado en lenguaje claro, próximas fechas, trabajo realizado, branding del estudio + Powered by DSF. Desactivar el toggle corta el acceso al instante. **E2E verificado en producción**: caso de prueba insertado → página renderizó todos los datos → deshabilitado → "Enlace no disponible" → datos de prueba borrados. Datos mínimos: no se exponen notas, montos ni contraparte.

### 4. Vertical amparos de salud (migración 0023, aplicada)
Template "Amparo de salud con medida cautelar": prepagas (ley 26.682) / obras sociales (ley 23.660), ley 24.901 si hay discapacidad, cautelar con verosimilitud + peligro en la demora, fuero federal cuando corresponde (art. 38 ley 23.661). Aparece automáticamente en el generador (los templates se leen de la DB).

### 5. SEO técnico
JSON-LD schema.org (FAQPage con 4 preguntas + SoftwareApplication) en la calculadora pública de indemnización.

## Qué quedó afuera y por qué
- **CCCN completo al RAG**: la página de InfoLeg del CCCN (norma 26.994) es tan grande que ni siquiera responde a fetch con timeout de 3 minutos — inviable para el cron serverless de 60s. Requiere fuente troceada (SAIJ o texto actualizado por libros). Pendiente documentado.
- **WhatsApp**: sigue esperando credenciales Twilio/Meta.
- **Onboarding wow, tablero del estudio, vertical previsional, blog de fallos**: próximas tandas.

## Verificación
- esbuild OK en los 9 archivos nuevos/tocados; deploy Vercel READY (un fix intermedio: el SDK de Anthropic exige `citations` en TextBlock → extracción de texto reescrita sin type predicate).
- Migraciones 0022 y 0023 aplicadas en remoto y verificadas por SQL.
- Portal e2e en producción (alta, render, corte de acceso, limpieza).
