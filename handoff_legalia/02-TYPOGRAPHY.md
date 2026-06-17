# 02 — Typography

> **Archivos:** `app/layout.tsx` + `app/globals.css`
> **Qué hace:** carga Fraunces (display serif), Newsreader (body serif), IBM Plex Sans (UI sans), IBM Plex Mono (meta/expedientes) desde Next/font.

---

## `app/layout.tsx`

Reemplazar el bloque de fonts actual:

```tsx
import { Fraunces, Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es-AR"
      className={`${fraunces.variable} ${newsreader.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

**Nota:** si hay providers (SessionProvider, ThemeProvider…) entre `<html>` y `<body>`, mantenerlos. Solo agregar las variables al className del `<html>`.

---

## `app/globals.css`

Agregar al bloque `@layer base`:

```css
@layer base {
  html {
    font-family: var(--font-sans);
  }
  body {
    font-family: var(--font-sans);
    color: var(--brand-ink);
    background: var(--background);
  }

  /* Display serif para headlines, hero, masthead */
  .font-display, h1.display, .masthead-headline {
    font-family: var(--font-display);
    font-feature-settings: "ss01", "ss02";
  }

  /* Body serif para prosa larga, escritos, quotes */
  .font-serif, .prose-editorial, blockquote.editorial {
    font-family: var(--font-serif);
  }

  /* Monospace para expedientes, fechas, IDs, meta */
  .font-mono, code, .expediente {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
  }

  /* Reset headings a display serif por defecto */
  h1, h2, h3 {
    font-family: var(--font-display);
    color: var(--brand-navy);
    letter-spacing: -0.02em;
    font-weight: 600;
  }
  h4, h5, h6 {
    font-family: var(--font-display);
    color: var(--brand-navy);
    font-weight: 600;
  }
}
```

---

## Mapeo Tailwind

### v4 con `@theme inline` (recomendado):

```css
@theme inline {
  --font-sans: var(--font-sans);
  --font-serif: var(--font-serif);
  --font-display: var(--font-display);
  --font-mono: var(--font-mono);
}
```

Esto te da `font-display`, `font-serif`, `font-mono` como clases automáticamente.

### v3 en `tailwind.config.ts`:

```ts
theme: {
  extend: {
    fontFamily: {
      sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      serif: ["var(--font-serif)", "Georgia", "serif"],
      display: ["var(--font-display)", "Georgia", "serif"],
      mono: ["var(--font-mono)", "Menlo", "monospace"],
    }
  }
}
```

---

## Reglas de uso (documentar para el equipo)

| Familia        | Uso                                              | Ejemplos                                    |
|----------------|--------------------------------------------------|---------------------------------------------|
| **Fraunces**   | Display grande, h1-h3, hero, números romanos     | "Mis escritos", hero "La herramienta editorial" |
| **Newsreader** | Prosa larga, citas, contenido de escritos A4     | Cuerpo de demandas, blockquotes, FAQ        |
| **IBM Plex Sans** | UI, labels, botones, body general             | Sidebar items, form labels, CTA buttons     |
| **IBM Plex Mono** | Meta, expedientes, IDs, fechas, códigos       | "EXP 12345/2025", "HOY · 14:32", `--font-mono` en tablas numéricas |

**Reglas duras:**
- Nunca Fraunces en tamaños < 20px (pierde detalle).
- Nunca mono en párrafos largos.
- `<em>` dentro de Fraunces activa italic — usar para enfatizar palabras clave en headlines (ver hero landing).
- Peso por defecto en Fraunces = 600 (semibold). 400 se ve anémico.

---

## Variables de escala (opcional pero útil)

```css
:root {
  --text-xs:  11px;
  --text-sm:  12px;
  --text-base: 14px;
  --text-md:  15px;
  --text-lg:  17px;
  --text-xl:  20px;
  --text-2xl: 24px;
  --text-3xl: 28px;
  --text-4xl: 36px;
  --text-5xl: 48px;
  --text-6xl: 64px;
  --text-7xl: 88px;
}
```

Body UI = `--text-base` (14px).
Body reading = `--text-md` (15px) en prose-editorial.
H1 masthead = `--text-6xl` con `clamp()` responsive.
Meta + overlines = `--text-xs` (11px) o 10px directo.

---

## Performance

- Las 4 fonts sumadas pesan ~180KB con subsets latinos.
- `display: swap` evita FOIT.
- Si bundle size preocupa, bajar Plex Sans a weights `[400, 600]` (salteás 500 y 700).

---

## Fallbacks probados

En CSS, poner siempre fallbacks explícitos:

```css
body { font-family: var(--font-sans), system-ui, -apple-system, sans-serif; }
h1 { font-family: var(--font-display), Georgia, "Times New Roman", serif; }
.font-mono { font-family: var(--font-mono), Menlo, Consolas, monospace; }
```

---

## ✅ Checklist

- [ ] 4 fuentes cargadas en `layout.tsx`
- [ ] Variables propagadas en `<html>`
- [ ] Reglas base en globals.css
- [ ] Tailwind mapeo aplicado
- [ ] Probar `/login` — el título debería mostrarse en Fraunces
- [ ] DevTools → Network → verificar que no se cargan fuentes duplicadas
- [ ] Lighthouse Performance no baja > 5 puntos

## 🔗 Siguiente
→ `03-SIDEBAR.md`
