# 01 — Design Tokens

> **Archivo a modificar:** `apps/web/app/globals.css`
> **Estrategia:** reemplazo parcial. Se mantiene toda la estructura de `@theme inline` y `@layer base`; se reescriben los valores de las CSS variables dentro de `:root` y `.dark`, y se eliminan/reemplazan las utilidades custom (gradient-text, btn-shimmer, card-premium).

---

## Paso 1 — Reemplazar el bloque `:root`

**Ubicar** el bloque que empieza con `/* ─── LegalIA Design Tokens ─── */` y termina antes de `.dark {`.

**Reemplazar por:**

```css
/* ─── LegalIA Design Tokens — Editorial v5 ─────────────────── */
:root {
  /* Brand — Editorial Legal */
  --brand-navy:       #0b1e3a;
  --brand-navy-2:     #142847;
  --brand-navy-ink:   #0a1628;

  --brand-paper:      #faf7f1;   /* warm cream — background principal */
  --brand-paper-2:    #f3eee1;   /* hover, sidebar light states */
  --brand-paper-3:    #ebe3ce;   /* terciario, dividers fuertes */

  --brand-gold:       #b8902f;   /* acento primario */
  --brand-gold-2:     #d4a94a;   /* acento claro — highlights */
  --brand-gold-pale:  #f0e4c2;   /* badges, citas, chips */

  --brand-ink:        #1a1a1a;
  --brand-ink-2:      #3a3a3a;
  --brand-mute:       #6b6657;

  --brand-red:        #a8331c;   /* vencimientos, destructive */
  --brand-green:      #2d6a3e;   /* activo, success */

  /* shadcn tokens — mapeados a editorial */
  --background:          oklch(0.976 0.012 85);   /* ~#faf7f1 paper */
  --foreground:          oklch(0.18 0.01 60);     /* ~#1a1a1a ink */

  --card:                oklch(1 0 0);            /* white puro — solo sobre paper */
  --card-foreground:     oklch(0.18 0.01 60);

  --popover:             oklch(1 0 0);
  --popover-foreground:  oklch(0.18 0.01 60);

  /* Primary = navy profundo */
  --primary:             oklch(0.20 0.05 258);    /* ~#0b1e3a */
  --primary-foreground:  oklch(0.976 0.012 85);

  /* Secondary = paper-2 */
  --secondary:           oklch(0.945 0.018 80);   /* ~#f3eee1 */
  --secondary-foreground: oklch(0.20 0.05 258);

  /* Muted = paper-3 con texto mute */
  --muted:               oklch(0.92 0.022 80);    /* ~#ebe3ce */
  --muted-foreground:    oklch(0.48 0.015 75);    /* ~#6b6657 */

  /* Accent = gold (NO amber) */
  --accent:              oklch(0.67 0.12 78);     /* ~#b8902f */
  --accent-foreground:   oklch(0.15 0.03 258);

  /* Destructive = red legal */
  --destructive:         oklch(0.50 0.17 30);     /* ~#a8331c */

  /* Borders */
  --border:              oklch(0.20 0.05 258 / 0.12);  /* navy-12% */
  --input:               oklch(0.20 0.05 258 / 0.18);
  --ring:                oklch(0.67 0.12 78);

  /* Charts — tonos cálidos sobrios */
  --chart-1: oklch(0.20 0.05 258);   /* navy */
  --chart-2: oklch(0.67 0.12 78);    /* gold */
  --chart-3: oklch(0.50 0.17 30);    /* red */
  --chart-4: oklch(0.45 0.08 155);   /* green */
  --chart-5: oklch(0.75 0.09 78);    /* gold pale */

  /* Radius — editorial = más angular */
  --radius: 0.375rem;  /* 6px base (antes 0.625rem) */

  /* Sidebar — deep navy */
  --sidebar:                       oklch(0.16 0.045 258);
  --sidebar-foreground:            oklch(0.90 0.02 85);
  --sidebar-primary:               oklch(0.67 0.12 78);
  --sidebar-primary-foreground:    oklch(0.15 0.03 258);
  --sidebar-accent:                oklch(0.22 0.05 258);
  --sidebar-accent-foreground:     oklch(0.95 0.015 85);
  --sidebar-border:                oklch(1 0 0 / 0.08);
  --sidebar-ring:                  oklch(0.67 0.12 78);
}
```

---

## Paso 2 — Reemplazar el bloque `.dark`

```css
.dark {
  --background:          oklch(0.14 0.03 258);        /* navy-ink */
  --foreground:          oklch(0.94 0.015 85);
  --card:                oklch(0.18 0.035 258);
  --card-foreground:     oklch(0.94 0.015 85);
  --popover:             oklch(0.18 0.035 258);
  --popover-foreground:  oklch(0.94 0.015 85);
  --primary:             oklch(0.67 0.12 78);         /* gold toma protagonismo */
  --primary-foreground:  oklch(0.14 0.03 258);
  --secondary:           oklch(0.22 0.04 258);
  --secondary-foreground: oklch(0.94 0.015 85);
  --muted:               oklch(0.22 0.04 258);
  --muted-foreground:    oklch(0.68 0.02 85);
  --accent:              oklch(0.67 0.12 78);
  --accent-foreground:   oklch(0.14 0.03 258);
  --destructive:         oklch(0.62 0.18 30);
  --border:              oklch(1 0 0 / 0.08);
  --input:               oklch(1 0 0 / 0.12);
  --ring:                oklch(0.67 0.12 78);
  --sidebar:                    oklch(0.11 0.025 258);
  --sidebar-foreground:         oklch(0.90 0.02 85);
  --sidebar-primary:            oklch(0.67 0.12 78);
  --sidebar-primary-foreground: oklch(0.14 0.03 258);
  --sidebar-accent:             oklch(0.18 0.035 258);
  --sidebar-accent-foreground:  oklch(0.95 0.015 85);
  --sidebar-border:             oklch(1 0 0 / 0.08);
  --sidebar-ring:               oklch(0.67 0.12 78);
}
```

---

## Paso 3 — Agregar utilidades editoriales (nuevas)

**Agregar al final del archivo**, reemplazando las utilidades `.gradient-text`, `.btn-shimmer`, `.card-premium`, `.glass-*` que dejan de tener sentido en este sistema:

```css
/* ─── Editorial utilities ──────────────────────────────────── */

/* Warm paper background with faint horizontal rules */
.bg-paper-rules {
  background:
    repeating-linear-gradient(0deg,
      transparent 0 39px,
      rgba(11, 30, 58, 0.015) 39px 40px),
    var(--brand-paper);
}

/* Editorial top rule — 3px double navy */
.rule-double {
  border-bottom: 3px double var(--brand-navy);
}

/* Editorial card — flat, bordered, subtle shadow */
.card-editorial {
  background: #fff;
  border: 1px solid oklch(from var(--primary) l c h / 0.12);
  border-radius: 4px;
  box-shadow: 0 1px 0 oklch(from var(--primary) l c h / 0.04);
}

/* Section number badge */
.num-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  background: var(--brand-navy);
  color: var(--brand-gold-2);
  padding: 3px 7px;
  border-radius: 3px;
  letter-spacing: 0.1em;
  font-weight: 400;
  text-transform: uppercase;
}

/* Inline citation chip */
.cite-chip {
  display: inline-block;
  background: var(--brand-gold-pale);
  color: var(--brand-navy);
  padding: 1px 7px;
  border-radius: 3px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  border: 1px solid var(--brand-gold);
}

/* Drop cap serif — first letter styling */
.drop-cap::first-letter {
  font-family: var(--font-serif);
  font-size: 3em;
  font-weight: 600;
  float: left;
  line-height: 0.9;
  margin: 0.15em 0.1em 0 0;
  color: var(--brand-gold);
  font-style: italic;
}

/* Masthead headline — large serif italic */
.headline-masthead {
  font-family: var(--font-serif);
  font-weight: 600;
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  line-height: 0.98;
  letter-spacing: -0.035em;
  color: var(--brand-navy);
}
.headline-masthead em {
  font-style: italic;
  color: var(--brand-gold);
}

/* Masthead meta (date, edition) */
.masthead-meta {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-mute);
}
.masthead-meta b { color: var(--brand-navy); font-weight: 600; }

/* Stat value — big serif number */
.stat-value {
  font-family: var(--font-serif);
  font-size: 2.375rem; /* 38px */
  font-weight: 600;
  color: var(--brand-navy);
  letter-spacing: -0.03em;
  line-height: 1;
}
.stat-value sup {
  font-size: 0.37em;
  color: var(--brand-mute);
  font-weight: 500;
  margin-left: 4px;
}

/* Stat label — uppercase small caps */
.stat-label {
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--brand-mute);
}

/* Gold hairline accent (top of aside panels) */
.accent-top-gold {
  position: relative;
}
.accent-top-gold::before {
  content: '';
  position: absolute;
  top: -1px; left: -1px; right: -1px;
  height: 3px;
  background: var(--brand-gold);
}

/* Sidebar active item — gold left rail */
.sidebar-active-rail {
  position: relative;
}
.sidebar-active-rail::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 2px;
  background: var(--brand-gold);
  border-radius: 0 2px 2px 0;
}

/* Legal disclaimer band */
.disclaimer-band {
  background: var(--brand-gold-pale);
  border: 1px solid var(--brand-gold);
  border-radius: 4px;
  color: var(--brand-navy-ink);
  padding: 16px 20px;
  font-size: 12px;
  line-height: 1.6;
  position: relative;
  display: flex;
  gap: 12px;
}
.disclaimer-band::before {
  content: '§';
  font-family: var(--font-serif);
  font-size: 28px;
  color: var(--brand-gold);
  line-height: 1;
  font-weight: 700;
  flex-shrink: 0;
}
.disclaimer-band b { color: var(--brand-navy); font-weight: 700; }
```

---

## Paso 4 — Eliminar (o refactor) utilidades legacy

**Borrar** estas utilidades del archivo actual:
- `.gradient-text` → reemplazar cualquier uso por `.heading-serif` o color sólido navy
- `.gradient-text-amber` → mismo
- `.btn-shimmer` → reemplazar por `<Button variant="default">` estándar (ahora navy)
- `.card-premium` → reemplazar por `.card-editorial`
- `.glass` / `.glass-dark` → eliminar (no se usa en editorial)

**Mantener:**
- `@theme inline` bloque (no cambiar)
- `@layer base` (no cambiar)
- Animaciones (`fade-in-up`, `scale-in`, `slide-up`, `typing-dot`, `progress-bar`) — se usan
- `.heading-serif`, `.text-balance`, `::selection`, scrollbar styling — se mantienen
- `@media (prefers-reduced-motion)` — se mantiene

---

## Paso 5 — Ajustar `::selection`

```css
::selection {
  background-color: rgba(184, 144, 47, 0.25);  /* gold-25% */
  color: var(--brand-navy);
}
```

---

## ✅ Checklist

- [ ] `:root` reemplazado con tokens editorial
- [ ] `.dark` reemplazado
- [ ] Utilidades editorial agregadas al final
- [ ] `.gradient-text*`, `.btn-shimmer`, `.card-premium`, `.glass*` eliminados
- [ ] `::selection` ajustado
- [ ] Build de Tailwind compila sin warnings: `pnpm --filter web build`
- [ ] Inspeccionar `/dashboard` visualmente: el background debe verse **cream (paper)** no white puro; sidebar **navy profundo**, el accent **gold** (ya no amber naranja).

---

## 🔗 Siguiente

→ `02-TYPOGRAPHY.md`
