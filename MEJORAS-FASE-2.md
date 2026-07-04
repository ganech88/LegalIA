# Mejoras Fase 2 — 02/07/2026
**Objetivo:** que el abogado trabaje solo acá y su seguimiento diario quede automatizado.

## 1. Datos oficiales en vivo (diferencial "todo verificable")

- **`lib/legal/indices-live.ts` + `/api/indices`**: coeficientes de actualización calculados EN VIVO contra las series oficiales de datos.gob.ar (IPC INDEC `148.3_INIVELNAL_DICI_M_26`, RIPTE `158.1_REPTE_0_0_5`, CER `94.2_CD_D_0_0_10`, UVA `94.2_UVAD_D_0_0_10` — todas verificadas con datos al 2026). Cache de 12 h vía fetch revalidate; sin cron ni credenciales.
- **Calculadora de actualización reescrita**: antes usaba IPC hardcodeado hasta 2025-04 y estimaba 3% mensual (indefendible); ahora muestra valor del índice y fecha exacta de cada punto + fuente, con aviso si el último dato oficial es anterior a la fecha pedida.
- **Calculadora de intereses**: la tasa de referencia precarga un campo SIEMPRE editable + aviso honesto de que la tasa activa BNA no tiene API pública y debe verificarse.

## 2. Editor: nunca perdés una edición

- **Autosave** 2,5 s después de la última tecla, con indicador "Auto-guardado HH:MM" en la barra de estado.
- **Versionado** (`escritos_versiones`, migración 0020): snapshot en cada guardado manual + automático cada 5 min. Panel "Versiones" con restaurar (`panel-versiones.tsx`).

## 3. Expediente vivo

- **`escritos.caso_id`** (migración 0020; `vencimientos.caso_id` ya existía).
- **Selector de caso en el editor** (`caso-selector.tsx`): vinculás el escrito a un expediente sin salir.
- **Timeline del caso** (`caso-timeline.tsx`, visible al abrir un caso): escritos y plazos del expediente en orden cronológico, con estados (vencido/cumplido/pendiente) y accesos rápidos.

## 4. Asistente y historial

- **Chat persistente**: al entrar se recuperan las últimas 10 consultas guardadas (antes se perdía todo al refrescar).
- **Semáforo de citas en el chat** (`citas-chat.tsx`): cada respuesta del asistente muestra sus citas contrastadas contra el corpus (✅/🟡/🔴), expandible con el detalle.
- **Historial de escritos con búsqueda y filtros por fuero** (`historial-list.tsx`), hasta 200 escritos.

## Estado de infraestructura

- Migración **0020 aplicada y verificada** en Supabase (caso_id + escritos_versiones + RLS).
- Migraciones remotas al día: 0018 (estilo), 0019 (revoke+grant funciones de cuota), 0020.

## Para deployar

1. `pnpm install && pnpm --filter web build && pnpm --filter web test` (local).
2. `comitear.bat` (mensaje ya actualizado).
3. Nada más: sin variables nuevas ni pasos manuales.

## Siguiente tanda sugerida (de PROPUESTA-FASE-2.md)

RAG con ley completa (requiere OPENAI_API_KEY) · checklist pre-presentación por jurisdicción (PBA 15.057 vs CABA 18.345) · wizard de comunicaciones laborales con plazos automáticos · modo cliente · onboarding con demo.

## Agregado 04/07 — Control pre-presentación + Wizard de telegramas

- **Control pre-presentación** (`lib/legal/checklist.ts` + botón "Control" en el editor): checklist procesal determinístico por tipo de escrito y jurisdicción — estructura (objeto/hechos/derecho/petitorio), prueba ofrecida, liquidación e intereses, reserva del caso federal, datos de las partes, y controles cruzados de régimen procesal (detecta ley 15.057 en escritos CABA y ley 18.345/CNAT en escritos PBA; recuerda el SECLO en CABA). Costo cero (sin IA). Lógica validada por ejecución.
- **Wizard de telegramas laborales** (`/escritos/telegramas`, `lib/legal/telegramas.ts`, link "Telegramas" en el sidebar): secuencia guiada del despido indirecto — intimación de registración (24.013), intimación de pago, aclaración de situación, despido indirecto — cada paso con su base legal, texto listo para copiar y botón que agenda el plazo del paso siguiente en la Agenda (con alerta por email). Cierra el loop telegrama → plazo → cálculo → demanda.
