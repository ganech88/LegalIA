# 11 — Migration Plan & Branch Strategy

> Cómo aplicar todo este handoff sin romper lo que funciona.

---

## Principios

1. **No tocar lógica de negocio.** Todo lo que hay en `lib/ai/`, `lib/legal/`, `app/api/`, `supabase/` queda igual. Solo tocamos la capa de presentación.
2. **Un PR por doc.** Cada archivo 01-10 es un PR chico y revisable.
3. **Feature flag opcional.** Si querés comparar old-vs-new en staging, usar `NEXT_PUBLIC_UI=editorial` flag.
4. **Rollback siempre posible.** Tags de git antes de cada fase.

---

## Estrategia de branches

```
main (producción actual)
  └── design/editorial          # branch paraguas, long-lived
        ├── design/01-tokens    # PR 1
        ├── design/02-typography
        ├── design/03-sidebar
        ├── design/04-dashboard
        ├── design/05-chat
        ├── design/06-escritos
        ├── design/07-casos
        ├── design/08-calculadoras
        ├── design/09-landing-auth
        └── design/10-responsive
```

Cada sub-branch se mergea a `design/editorial`. Cuando todo está listo y testeado, `design/editorial` → `main`.

Si necesitás shippar un hotfix a `main` mientras tanto, rebasá `design/editorial` sobre `main` al día.

---

## Orden de implementación recomendado

**Fase 1 — Fundaciones (invisible al usuario, deploy silencioso)**
1. `01-TOKENS.md` → agregar variables sin usarlas
2. `02-TYPOGRAPHY.md` → cargar Fraunces + Newsreader + IBM Plex sin romper body existente

**Deploy de fase 1 a staging, verificar que no regresión visual.**

**Fase 2 — Chrome (sidebar + topbar)**
3. `03-SIDEBAR.md` → nuevo sidebar navy con numerales
- Este es el cambio más visible. Sacar screenshots antes/después.

**Deploy fase 2, pedir feedback interno 48h.**

**Fase 3 — Páginas de alto tráfico**
4. `04-DASHBOARD.md`
5. `05-CHAT.md`
6. `06-ESCRITOS.md` ⚠️ este es el más grande, testear a fondo

**Fase 4 — Páginas secundarias**
7. `07-CASOS.md`
8. `08-CALCULADORAS.md`
9. `09-LANDING-AUTH.md` — landing pública al final para no arruinar SEO/conversión hasta tener confianza

**Fase 5 — Pulido**
10. `10-RESPONSIVE.md` — pasada final verificando breakpoints

---

## Feature flag (opcional)

Si querés poder togglear entre UI vieja y nueva durante Fase 3–4:

```ts
// lib/ui-flag.ts
export function useEditorialUI() {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_UI === "editorial";
  }
  const cookie = document.cookie.includes("ui=editorial");
  const env = process.env.NEXT_PUBLIC_UI === "editorial";
  return cookie || env;
}
```

Y en cada página grande:
```tsx
const editorial = useEditorialUI();
return editorial ? <DashboardEditorial /> : <DashboardLegacy />;
```

Cuando todo esté confirmado, borrar la versión legacy y el flag.

**Nota:** este approach duplica código temporalmente. Solo vale la pena si tenés usuarios en producción y no podés arriesgar downtime visual. Si el producto aún es beta, mejor reemplazar directo.

---

## Checklist pre-merge a main

Antes de mergear `design/editorial` → `main`:

- [ ] Lighthouse score no baja más de 5 puntos en Performance
- [ ] Contraste WCAG AA validado en todos los textos (navy sobre paper está en el borde — verificar)
- [ ] Impresión A4 del editor de escritos se ve correcta
- [ ] Sidebar drawer funciona en móvil real (no solo devtools)
- [ ] Todos los flows de Supabase auth siguen funcionando end-to-end
- [ ] `npm run build` sin warnings nuevos
- [ ] Bundle size no crece más de 50KB (fonts son el riesgo principal — confirmar `display: swap`)
- [ ] Modo dark: decidir — por ahora **NO hay dark mode**. Confirmar con el equipo antes de agregarlo.

---

## Gotchas conocidos

### Fuentes
- Fraunces tiene que cargar con weight 500–700 mínimo. Si solo carga 400, los headlines se ven débiles.
- IBM Plex Mono es para metadata (expedientes, fechas, IDs). NO usar para body.
- El fallback Georgia es aceptable; si FOUT molesta, agregar `font-display: optional` en fase 2.

### Colores
- `--brand-navy #1a2332` en text body es AA pero justo. Para párrafos largos (>150 palabras) usar `--brand-ink #2a2f3a`.
- `--brand-gold #b8944a` NO tiene suficiente contraste para texto sobre white. Solo usar para acentos, separadores, numerales decorativos, nunca body.
- `--brand-red #c24f3f` es el único rojo. No introducir otros.

### Tailwind + CSS variables
- Si usás Tailwind v3, las variables deben mapearse en `tailwind.config.ts`:
  ```ts
  theme: { extend: { colors: {
    'brand-navy': 'var(--brand-navy)',
    'brand-gold': 'var(--brand-gold)',
    // ...
  }}}
  ```
- Si estás en v4, con `@theme inline` directo en `globals.css` alcanza.

### Editor de escritos
- El preview A4 (794×1123) tiene que caber en el viewport con scroll. No forzar escala, dejar que el usuario haga zoom con cmd+/–.
- `contenteditable` tiene bugs conocidos con backspace al inicio de línea; usar TipTap o Lexical si los problemas son muchos. Fuera de scope de este handoff.

---

## Qué NO está incluido en el handoff

Cosas que probablemente querés hacer después pero que no cubrimos acá:

- **Dark mode.** El sistema editorial funciona bien en light. Si quieren dark, es otro handoff.
- **Theming por colegio.** Ej: variante CPACF con colores del colegio. Fase futura.
- **Onboarding interactivo con tooltips.** Solo cubrimos el wizard de 4 pasos.
- **Settings page.** No está refactorizada. Aplicar los mismos principios: cards editoriales, masthead meta, formularios tipo nota al pie.
- **Admin panel.** Fuera de scope.
- **Email templates.** Los mails transaccionales siguen con el template viejo hasta que alguien los refactorice.

---

## Contactos + referencias

- **Mockup de referencia:** `handoff_legalia/reference/legalia-v5-editorial.html` — abrir este HTML mientras implementás para comparar pixel a pixel.
- **Design system global:** ver `dsf-system-v3.html` en la raíz del proyecto para el paraguas DSF + todos los hermanos (Portero, Cuotis, Dictamen).
- **Tokens canónicos:** `colors_and_type.css` en raíz del proyecto.

---

## ✅ Fin del handoff

Si seguiste los 11 docs, tenés:
- Un LegalIA completamente rebrandeado al sistema editorial
- Sidebar navy con numerales romanos
- Dashboard tipo masthead de diario
- Chat con citas editoriales
- Editor de escritos con preview A4 procesal
- 4 calculadoras con look de liquidación
- Landing + auth + onboarding coherentes
- Responsive desktop-first

Cualquier inconsistencia: siempre ganan los tokens de `01-TOKENS.md` y la referencia visual del mockup v5.

**Éxitos.**
