# LegalIA — Design Handoff v5 "Editorial Legal"

> Paquete de implementación para Claude Code. Transforma LegalIA del estilo actual (indigo/blue moderno) al sistema visual **Editorial Legal** (navy profundo + gold + Fraunces serif) manteniendo toda la lógica funcional intacta.

---

## 📌 Contexto

**Repo:** `ganech88/LegalIA` (main → Vercel)
**Stack detectado:**
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 (con `@theme inline`)
- shadcn/ui (style: `base-nova`)
- Base UI (`@base-ui/react`)
- Supabase (auth, db, RLS ya configurado)
- Framer Motion + Lucide + Sonner (toaster)

**Estructura relevante:**
```
apps/web/
├── app/
│   ├── (auth)/       login, register, onboarding
│   ├── (dashboard)/  dashboard, asistente, escritos, casos
│   ├── api/          chat, generate-escrito
│   ├── globals.css   ← tokens viven acá
│   ├── layout.tsx    ← fonts se declaran acá
│   └── page.tsx      ← landing (30KB, hay mucho por refactorizar)
└── components/
    ├── ui/           shadcn primitives (button, card, badge, input...)
    ├── layout/sidebar.tsx
    ├── dashboard/dashboard-client.tsx
    ├── escritos/    dynamic-form, editor, escritos-client
    └── casos/casos-client.tsx
```

---

## 🎯 Objetivo del handoff

Aplicar el sistema visual del **mockup v5** (`reference/legalia_v5.html`) sobre el codebase existente **sin romper lógica, sin cambiar contratos de API, sin tocar Supabase**.

**Fidelidad visual:** pixel-perfect al mockup.
**Funcionalidad:** 100% preservada — todo lo que hoy funciona debe seguir funcionando.
**Deploy:** rama `design/editorial-v5` → PR → Vercel preview → aprobar → merge a main.

---

## 📚 Índice de archivos del handoff

Leelos **en orden**. Cada archivo tiene su propio checklist de implementación.

| # | Archivo | Qué hace |
|---|---------|----------|
| 00 | [README.md](./README.md) | Este archivo. Empezá acá. |
| 01 | [01-DESIGN-TOKENS.md](./01-DESIGN-TOKENS.md) | Reemplazo completo de `globals.css` |
| 02 | [02-TYPOGRAPHY.md](./02-TYPOGRAPHY.md) | Swap de fonts: Fraunces + Inter + JetBrains Mono |
| 03 | [03-SIDEBAR.md](./03-SIDEBAR.md) | Refactor de `components/layout/sidebar.tsx` |
| 04 | [04-DASHBOARD.md](./04-DASHBOARD.md) | Masthead + stats editoriales + two-col |
| 05 | [05-ASISTENTE-CHAT.md](./05-ASISTENTE-CHAT.md) | Chat con citas verificables estilo editorial |
| 06 | [06-ESCRITOS.md](./06-ESCRITOS.md) | Listado, formulario dinámico y editor |
| 07 | [07-CASOS.md](./07-CASOS.md) | Listado de casos tipo expediente |
| 08 | [08-CALCULADORAS.md](./08-CALCULADORAS.md) | Widget art. 245 LCT |
| 09 | [09-LANDING-AUTH.md](./09-LANDING-AUTH.md) | Landing, login, register, onboarding |
| 10 | [10-RESPONSIVE.md](./10-RESPONSIVE.md) | Breakpoints y comportamientos mobile |
| 11 | [11-MIGRATION-PLAN.md](./11-MIGRATION-PLAN.md) | Branch strategy, orden de commits, QA |
| — | [reference/legalia_v5.html](./reference/legalia_v5.html) | Mockup HTML original de referencia |

---

## 🎨 Resumen del sistema visual

### Paleta (reemplaza la actual)

| Token | Valor | Uso |
|-------|-------|-----|
| `--navy` | `#0b1e3a` | Sidebar, headers, titulares |
| `--navy-2` | `#142847` | Sidebar gradient end, acentos |
| `--paper` | `#faf7f1` | Background principal (papel) |
| `--paper-2` | `#f3eee1` | Cards secundarios, hover |
| `--paper-3` | `#ebe3ce` | Estados terciarios |
| `--gold` | `#b8902f` | Acento principal (reemplaza amber) |
| `--gold-2` | `#d4a94a` | Acento claro (highlights) |
| `--gold-pale` | `#f0e4c2` | Badges, chips de citas |
| `--ink` | `#1a1a1a` | Texto body |
| `--mute` | `#6b6657` | Meta, labels |
| `--red` | `#a8331c` | Vencimientos |
| `--green` | `#2d6a3e` | Estados activos |

> **Importante:** el sistema usa *warm tones* (paper cream) no white puro. Nunca uses `bg-white` puro salvo en cards que ya estén sobre paper.

### Tipografía

| Uso | Font | Weight |
|-----|------|--------|
| Headlines editoriales (h1 masthead, card titles grandes) | **Fraunces** (serif, optical) | 500-700 |
| Body, nav, buttons, labels | **Inter** | 400-700 |
| Números de expediente, stats, citas, kbd | **JetBrains Mono** | 400-500 |

**Declarar en `app/layout.tsx`** — ver `02-TYPOGRAPHY.md`.

### Border radius

Reducir a **4px** (radius-md) y **6px-8px** (radius-lg/xl). El sistema actual tiene radius demasiado grande (0.625rem base). Editorial legal = más angular, menos "rounded friendly".

### Sombras

Planas. Reemplazar shadows pesados por `0 1px 0 rgba(11,30,58,0.04)` tipo "periódico" y un `border` de 1px.

---

## ⚠️ Principios de implementación

1. **No romper APIs:** ningún cambio toca `app/api/*` ni `lib/supabase/*` ni `lib/ai/*`.
2. **No cambiar data flow:** los hooks, server components y server actions se mantienen idénticos. Solo cambia JSX + CSS.
3. **Respetar shadcn:** los componentes `ui/*` se actualizan vía CSS variables (`globals.css`) + tweaks puntuales, no se reescriben desde cero.
4. **Framer Motion queda:** las animaciones existentes se preservan; si hace falta agregar motion para los elementos nuevos, seguir el patrón existente en `sidebar.tsx`.
5. **Dark mode:** el repo tiene `.dark` variant definido. Ajustar los tokens dark para el sistema editorial (navy más profundo, paper pasa a ink oscuro con cálidos).
6. **i18n:** toda UI en **español argentino formal**. Mantener copy existente; solo adaptar labels nuevos (ej: "Workspace" → "Workspace" ok; "Últimos escritos" se mantiene).
7. **A11y:** contrast ratios AA mínimo. Texto sobre `paper` = `ink` (negro suave), nunca gris claro. Sobre `navy` = `paper` o `gold-2`.

---

## 🧪 Checklist de QA funcional post-refactor

Antes de mergear a main, verificar que funcionan:
- [ ] Login/register flow (Supabase auth)
- [ ] Onboarding wizard (4 pasos)
- [ ] Dashboard carga stats reales del usuario
- [ ] Chat con el asistente IA (streaming de respuesta)
- [ ] Generar un escrito completo (form → API → editor → export DOCX)
- [ ] Crear/editar/archivar un caso
- [ ] Sidebar navigation activa correcta en cada ruta
- [ ] Dark mode toggle funciona (si existía)
- [ ] PWA install prompt no se rompe
- [ ] Mobile: sidebar drawer abre/cierra OK
- [ ] Vercel preview deploy sin errores de build

---

## 🚀 Orden de implementación recomendado

```
1. Crear rama:      git checkout -b design/editorial-v5
2. 01-DESIGN-TOKENS (cambia globals.css) → commit
3. 02-TYPOGRAPHY    (cambia layout.tsx)  → commit
4. 03-SIDEBAR       (refactor sidebar)   → commit
5. 04-DASHBOARD     (dashboard-client)   → commit
6. 05-ASISTENTE     (chat)               → commit
7. 06-ESCRITOS      → commit
8. 07-CASOS         → commit
9. 08-CALCULADORAS  → commit
10. 09-LANDING-AUTH → commit
11. 10-RESPONSIVE   QA + fixes           → commit
12. Abrir PR, esperar Vercel preview, QA funcional, merge.
```

Ver detalles en `11-MIGRATION-PLAN.md`.

---

## 📞 Si algo no cuadra

- Consultá primero `CLAUDE.md` en la raíz del repo (tiene stack, reglas de desarrollo, schema DB).
- El mockup de referencia `reference/legalia_v5.html` es la fuente de verdad visual.
- Si hay conflicto entre "pixel perfect al mockup" y "no romper lógica funcional" → gana **no romper la lógica**. El visual se ajusta.
