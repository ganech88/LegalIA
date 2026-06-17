# 10 — Responsive & Breakpoints

> El sistema editorial está diseñado desktop-first (1440px+). Móvil es soporte, no prioridad — abogados usan desktop.

## Breakpoints

```css
/* Tailwind defaults + nuestros overrides */
--bp-sm: 640px;   /* móvil landscape */
--bp-md: 768px;   /* tablet portrait */
--bp-lg: 1024px;  /* tablet landscape / desktop chico */
--bp-xl: 1280px;  /* desktop estándar */
--bp-2xl: 1440px; /* desktop ancho (objetivo primario) */
```

## Reglas por zona

### Sidebar
- `lg:` en adelante: sidebar fijo 260px
- `< lg`: sidebar colapsa a drawer con overlay, trigger desde topbar hamburger

```tsx
<aside className={cn(
  "fixed inset-y-0 left-0 z-40 w-[260px] bg-[var(--brand-navy)] text-white transition-transform lg:translate-x-0 lg:sticky",
  drawerOpen ? "translate-x-0" : "-translate-x-full"
)}>
```

### Dashboard main area
- `xl`: grid 2-col (1fr 1.2fr) → escritos recientes + casos activos lado a lado
- `lg`: grid 2-col con col derecha comprimida
- `< lg`: 1-col, cards apiladas

### Stats grid
- `2xl`: 4-col
- `lg`: 3-col
- `md`: 2-col
- `< md`: 1-col

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
```

### Chat/Asistente
- `xl`: citas panel a la derecha (320px)
- `< xl`: citas panel abajo expandible

### Escritos editor
- `xl`: editor + IA panel lado a lado
- `< xl`: IA panel en bottom sheet (trigger flotante)

### Login / Register
- `lg`: split screen (form + quote)
- `< lg`: solo form, quote oculto

### Landing
- `lg`: 3-col pricing + tríptico de features
- `md`: 2-col con "Profesional" full-width arriba
- `< md`: stack 1-col

## Tipografía responsive

Usar `clamp()` para headlines:

```css
h1.masthead {
  font-size: clamp(2rem, 5vw, 3.5rem);
}

.hero-display {
  font-size: clamp(2.5rem, 7vw, 5.5rem);
  line-height: 0.98;
}
```

Body text queda fijo (14-15px) en todos los breakpoints — legibilidad > fluidity.

## Densidad

- Desktop (`lg+`): padding generoso (px-10 py-8 en páginas, p-5/p-6 en cards)
- Tablet (`md`): reducir a px-6 py-6
- Móvil (`< md`): px-4 py-4

Pattern helper:
```tsx
<div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
```

## Componentes que cambian visualmente

| Componente      | Desktop                        | Móvil (< lg)                     |
|-----------------|--------------------------------|----------------------------------|
| Sidebar         | Fijo 260px                     | Drawer con overlay               |
| Topbar          | Breadcrumb + search + actions  | Hamburger + logo + avatar        |
| Masthead meta   | Row flex                       | Stack vertical, meta solo fecha  |
| Stat card       | Numero XL + label              | Numero M + label compacto        |
| Tabla escritos  | 5 columnas                     | Card por fila, metadata bajo título |
| Dashboard split | 2 col                          | 1 col, orden: stats → escritos → casos → widget |
| Chat            | 3 paneles (sidebar + chat + citas) | Solo chat, citas en sheet    |
| Pricing         | 3-col cards                    | 1-col, featured primero          |

## Qué NO hacer responsive

- **No escalar el mockup completo con transform**. Rompe accesibilidad del sidebar.
- **No ocultar features pesados en móvil** (calculadoras, editor). Mostrar con layout adaptado, no quitarlos.
- **No forzar hamburger en desktop**. El sidebar fijo es parte de la identidad.

## Testing mínimo

Probar en:
- 1920×1080 (monitor externo)
- 1440×900 (MacBook 14)
- 1280×800 (laptop base)
- 768×1024 (iPad portrait) — el caso crítico, muchos abogados consultan desde tablet en tribunales
- 390×844 (iPhone 14) — para login y dashboard read-only

## Print

Para el editor de escritos, el preview A4 es el output primario impreso. Ver `06-ESCRITOS.md`.

Para PDFs de calculadoras, usar `window.print()` con un stylesheet dedicado:

```css
@media print {
  .no-print { display: none !important; }
  body { background: white; }
  .card-editorial { border: none; box-shadow: none; }
}
```

## 🔗 Siguiente
→ `11-MIGRATION.md`
