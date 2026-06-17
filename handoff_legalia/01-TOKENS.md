# 01 — Design Tokens

> **Archivo:** `app/globals.css`
> **Qué hace:** reemplaza paleta verde actual (#7FB069) con paleta editorial navy + gold. Mantiene todas las variables de shadcn/radix intactas.

---

## Reemplazar el bloque `:root` entero

Buscar el bloque actual `:root { ... }` en `app/globals.css` y reemplazar por esto:

```css
:root {
  /* ===== Marca LegalIA — Editorial ===== */
  --brand-navy:       #1a2332;   /* Primary — ink law-review */
  --brand-navy-2:     #242d3d;   /* Hover / 2nd level */
  --brand-navy-3:     #3a4256;   /* Borders activos, iconos */
  --brand-gold:       #b8944a;   /* Accent — gilded */
  --brand-gold-2:     #c9a65e;   /* Hover gold */
  --brand-gold-pale:  #f0e6cc;   /* Bg de badges, highlights */
  --brand-red:        #c24f3f;   /* Error / vencimiento urgente */
  --brand-green:      #4a7c59;   /* Success / presentado */
  --brand-paper:      #f5f1e8;   /* Paper cream */
  --brand-paper-2:    #ede6d3;   /* Paper 2nd */
  --brand-paper-3:    #e3d9bf;   /* Paper 3rd, bordes deco */
  --brand-ink:        #2a2f3a;   /* Body text primario */
  --brand-ink-2:      #4a5268;   /* Body text secundario */
  --brand-mute:       #8b8878;   /* Meta, captions */

  /* ===== Shadcn overrides (mapeo a paleta editorial) ===== */
  --background:       #fafaf7;   /* off-white warm */
  --foreground:       var(--brand-navy);
  --card:             #ffffff;
  --card-foreground:  var(--brand-navy);
  --popover:          #ffffff;
  --popover-foreground: var(--brand-navy);
  --primary:          var(--brand-navy);
  --primary-foreground: #ffffff;
  --secondary:        var(--brand-paper);
  --secondary-foreground: var(--brand-navy);
  --muted:            var(--brand-paper-2);
  --muted-foreground: var(--brand-mute);
  --accent:           var(--brand-gold-pale);
  --accent-foreground: var(--brand-navy);
  --destructive:      var(--brand-red);
  --destructive-foreground: #ffffff;
  --border:           oklch(from var(--brand-navy) l c h / 0.12);
  --input:            oklch(from var(--brand-navy) l c h / 0.18);
  --ring:             var(--brand-gold);
  --radius:           0.375rem;  /* 6px — menos redondo que antes */

  /* ===== Shadows (más sobrios) ===== */
  --shadow-sm: 0 1px 2px oklch(from var(--brand-navy) l c h / 0.04);
  --shadow:    0 1px 3px oklch(from var(--brand-navy) l c h / 0.06), 0 1px 2px oklch(from var(--brand-navy) l c h / 0.04);
  --shadow-md: 0 4px 6px oklch(from var(--brand-navy) l c h / 0.06), 0 2px 4px oklch(from var(--brand-navy) l c h / 0.04);
  --shadow-lg: 0 10px 15px oklch(from var(--brand-navy) l c h / 0.08), 0 4px 6px oklch(from var(--brand-navy) l c h / 0.04);
}
```

## Utilidades globales

Agregar al final de `globals.css`:

```css
/* Paper backgrounds (para dashboard, casos) */
.bg-paper-rules {
  background:
    repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent 31px,
      oklch(from var(--brand-navy) l c h / 0.04) 31px,
      oklch(from var(--brand-navy) l c h / 0.04) 32px
    ),
    var(--brand-paper);
}

/* Masthead meta — fechado editorial */
.masthead-meta {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--brand-mute);
  display: flex;
  gap: 14px;
  align-items: center;
}
.masthead-meta > * + *::before {
  content: "·";
  margin-right: 14px;
  color: var(--brand-mute);
  opacity: 0.5;
}

/* Overline (labels pequeños uppercase) */
.t-overline {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--brand-mute);
}

/* Card editorial (reemplaza Card de shadcn donde corresponda) */
.card-editorial {
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  position: relative;
}
.card-editorial.accent-top-gold::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: var(--brand-gold);
  border-radius: var(--radius) var(--radius) 0 0;
}

/* Disclaimer band (caja con fondo paper + borde gold) */
.disclaimer-band {
  background: var(--brand-gold-pale);
  border-left: 3px solid var(--brand-gold);
  padding: 12px 14px;
  color: var(--brand-navy);
  font-size: 11px;
  line-height: 1.5;
}

/* Status dot compacto */
.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  vertical-align: middle;
}
.status-dot--green { background: var(--brand-green); }
.status-dot--gold { background: var(--brand-gold); }
.status-dot--red { background: var(--brand-red); }
```

## Mapeo Tailwind (`tailwind.config.ts`)

Si el proyecto usa Tailwind v3:

```ts
theme: {
  extend: {
    colors: {
      'brand-navy': 'var(--brand-navy)',
      'brand-navy-2': 'var(--brand-navy-2)',
      'brand-gold': 'var(--brand-gold)',
      'brand-gold-pale': 'var(--brand-gold-pale)',
      'brand-red': 'var(--brand-red)',
      'brand-green': 'var(--brand-green)',
      'brand-paper': 'var(--brand-paper)',
      'brand-paper-2': 'var(--brand-paper-2)',
      'brand-paper-3': 'var(--brand-paper-3)',
      'brand-ink': 'var(--brand-ink)',
      'brand-ink-2': 'var(--brand-ink-2)',
      'brand-mute': 'var(--brand-mute)',
    }
  }
}
```

Si usa v4 con `@theme inline` en globals.css, mapear así:

```css
@theme inline {
  --color-brand-navy: var(--brand-navy);
  --color-brand-gold: var(--brand-gold);
  --color-brand-paper: var(--brand-paper);
  /* etc. */
}
```

## Qué NO cambiar

- No tocar `--radius` si otras páginas dependen de valores específicos (settings, admin). Mejor agregar `--radius-editorial: 0.375rem` y usarlo puntualmente.
- No eliminar variables legacy que existan — pueden estar usadas en componentes no refactorizados aún.

## ✅ Checklist

- [ ] Bloque `:root` reemplazado en `app/globals.css`
- [ ] Utilidades globales agregadas al final
- [ ] Tailwind config actualizado
- [ ] `npm run build` pasa sin errores
- [ ] Probar `/` — no debería haber cambios visuales aún (solo variables)

## 🔗 Siguiente
→ `02-TYPOGRAPHY.md`
