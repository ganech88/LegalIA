# LegalIA — Handoff de rediseño editorial

> Paquete para el agente desarrollador (Claude Code).
> Convierte la app actual de LegalIA a la identidad editorial navy + gold definida en el mockup `reference/legalia_v5.html`.

---

## Cómo usar este handoff

1. **Lee TODO este README primero** y abrí `reference/legalia_v5.html` al lado para mirar pixel a pixel mientras implementás.
2. **Seguí los docs 01 → 11 en orden.** Cada uno es un PR chico. El orden evita que te quedes a mitad de camino con UI rota.
3. **Nunca toques lógica de negocio** (`lib/ai/`, `lib/legal/`, `app/api/`, `supabase/`). Solo la capa de presentación.
4. **Ante duda de color/espaciado/tipografía**: ganan los tokens de `01-TOKENS.md` + el mockup v5.

---

## Índice

| # | Doc | Qué toca |
|---|-----|----------|
| 01 | [TOKENS](./01-TOKENS.md) | `app/globals.css` — paleta navy/gold, utilidades editoriales |
| 02 | [TYPOGRAPHY](./02-TYPOGRAPHY.md) | `app/layout.tsx` — Fraunces + Newsreader + Plex Sans + Mono |
| 03 | [SIDEBAR](./03-SIDEBAR.md) | Sidebar navy con numerales romanos y plan card |
| 04 | [DASHBOARD](./04-DASHBOARD.md) | Masthead + stats deck + tabla escritos + casos |
| 05 | [CHAT](./05-CHAT.md) | Asistente IA con citas editoriales |
| 06 | [ESCRITOS](./06-ESCRITOS.md) | Listado + editor con preview A4 procesal |
| 07 | [CASOS](./07-CASOS.md) | Listado tipo expediente + detalle con timeline |
| 08 | [CALCULADORAS](./08-CALCULADORAS.md) | 4 calculadoras legales + widget en dashboard |
| 09 | [LANDING-AUTH](./09-LANDING-AUTH.md) | Landing pública + login + register + onboarding |
| 10 | [RESPONSIVE](./10-RESPONSIVE.md) | Breakpoints, drawer móvil, print |
| 11 | [MIGRATION](./11-MIGRATION.md) | Estrategia de branches, orden de rollout, gotchas |

**Referencia visual:** [`reference/legalia_v5.html`](./reference/legalia_v5.html)

---

## Resumen del cambio visual

**De:** verde pastel + sans genérico + cards redondeadas radius 12 + layout cuadriculado genérico.

**A:** navy + gold + paper cream + serif display (Fraunces) + monospace para meta + layout editorial tipo diario (masthead, dos columnas, numerales romanos, hairlines dobles).

Principios:
- **Editorial, no startup.** La app tiene que leerse como una revista jurídica digital, no un SaaS más.
- **Tipografía es el 80% del trabajo.** Fraunces en display + Newsreader en prosa + Plex Mono en metadata hacen todo el trabajo pesado.
- **Densidad controlada.** Bordes finos, shadows sutiles, espaciado generoso sin ser vacío.
- **Sin emoji, sin gradientes chillones, sin iconos redondeados.** Si hace falta un acento: gold, number romano, "§", "¶", "◆".

---

## Checklist global

- [ ] 01 Tokens aplicados
- [ ] 02 Fonts cargadas y propagadas
- [ ] 03 Sidebar refactoreado
- [ ] 04 Dashboard con masthead
- [ ] 05 Chat con citas
- [ ] 06 Escritos + editor A4
- [ ] 07 Casos listado + detalle
- [ ] 08 Calculadoras + widget
- [ ] 09 Landing + auth + onboarding
- [ ] 10 Responsive revisado en 5 viewports
- [ ] 11 Merge a main según plan

---

## Contacto

Dudas del rediseño → volver al mockup `reference/legalia_v5.html`.
Dudas del sistema paraguas DSF → `dsf-system-v3.html` en la raíz del proyecto origen.
Dudas de tokens canónicos → `colors_and_type.css` en la raíz.

**Éxitos.**
