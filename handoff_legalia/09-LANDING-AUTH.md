# 09 — Landing + Login + Register + Onboarding

> **Archivos:** `app/page.tsx` (30KB — landing pública), `app/(auth)/login/page.tsx`, `register/page.tsx`, `onboarding/page.tsx`

---

## Landing `/`

La landing actual es grande (30KB). Hay que refactorizarla con el sistema editorial. Estructura propuesta:

### Secciones (en orden)
1. **Nav bar** — logo LegalIA + links Productos / Precios / Blog / Login · CTA "Empezar"
2. **Hero editorial** — masthead (ciudad · fecha · edición), headline Fraunces BIG con `<em>`, subhero, CTA dual
3. **Credibility bar** — "Confiado por [X] abogados argentinos" + logos de colegios (CPACF, CASI, CALM...)
4. **Features tríptico** — 3 columnas con number I/II/III, título serif, descripción
5. **Demo en vivo** — screenshot del dashboard + chat, bordeado como card-editorial
6. **Precios** — 3 planes como columnas editoriales, plan Profesional destacado con gold top rail
7. **FAQ** — acordeón simple
8. **Footer** — dark navy con links + disclaimer

### Hero

```tsx
<section className="border-b-[3px] border-double border-[var(--brand-navy)] pb-16">
  <div className="mx-auto max-w-[1200px] px-10 pt-20">
    <div className="masthead-meta mb-6">
      <span>BUENOS AIRES · AR</span>
      <span>{formatDateAR(new Date()).toUpperCase()}</span>
      <span>AÑO II · ED. PÚBLICA</span>
    </div>
    <h1 className="font-serif text-[clamp(3rem,7vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-[var(--brand-navy)] max-w-[1000px]">
      La herramienta<br/>
      <em className="italic text-[var(--brand-gold)]">editorial</em> del abogado<br/>
      argentino moderno.
    </h1>
    <p className="mt-8 max-w-[640px] text-[18px] leading-[1.6] text-[var(--brand-ink-2)]">
      Generá escritos con formato procesal, consultá legislación argentina con citas verificadas, calculá indemnizaciones y gestioná tus expedientes. Todo con IA entrenada en derecho argentino.
    </p>
    <div className="mt-10 flex flex-wrap gap-3">
      <Link href="/register" className="rounded bg-[var(--brand-navy)] px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-[var(--brand-navy-2)]">
        Probar gratis →
      </Link>
      <Link href="#demo" className="rounded border border-[var(--brand-navy)] bg-transparent px-6 py-3.5 text-[15px] font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-paper-2)]">
        Ver demo
      </Link>
    </div>
    <div className="mt-6 text-[12px] text-[var(--brand-mute)]">
      3 escritos gratis al mes · sin tarjeta · cancelá cuando quieras
    </div>
  </div>
</section>
```

### Pricing

```tsx
<section className="py-20 bg-[var(--brand-paper-2)]">
  <div className="mx-auto max-w-[1200px] px-10">
    <header className="text-center mb-12">
      <div className="t-overline text-[var(--brand-gold)] mb-2">◆ PRECIOS</div>
      <h2 className="font-serif text-5xl font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
        Planes que escalan con tu estudio
      </h2>
    </header>
    <div className="grid grid-cols-3 gap-0 border border-border bg-white rounded overflow-hidden">
      <PlanCol name="Gratis" price="$0" highlights={["3 escritos/mes", "20 consultas IA", "Calculadoras básicas"]} />
      <PlanCol name="Profesional" price="$12.000/mes" featured highlights={["30 escritos/mes", "Consultas IA ilimitadas", "Todas las calculadoras", "Mini CRM de casos"]} />
      <PlanCol name="Estudio" price="$25.000/mes" highlights={["Escritos ilimitados", "Hasta 5 usuarios", "Prioridad de soporte", "Branding personalizado"]} />
    </div>
  </div>
</section>
```

### PlanCol

```tsx
function PlanCol({ name, price, highlights, featured }: Props) {
  return (
    <div className={cn(
      "relative p-8 border-r border-border last:border-r-0",
      featured && "bg-[var(--brand-paper)]"
    )}>
      {featured && (
        <>
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--brand-gold)]" />
          <div className="absolute top-3 right-3 rounded-full bg-[var(--brand-gold)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-navy)]">
            Más elegido
          </div>
        </>
      )}
      <div className="t-overline text-[var(--brand-mute)] mb-2">{name.toUpperCase()}</div>
      <div className="font-serif text-4xl font-semibold text-[var(--brand-navy)] mb-6 tracking-[-0.02em]">
        {price}
      </div>
      <ul className="space-y-2.5 mb-8">
        {highlights.map(h => (
          <li key={h} className="flex gap-2 text-[13px] text-[var(--brand-ink-2)]">
            <span className="text-[var(--brand-gold)]">§</span>
            {h}
          </li>
        ))}
      </ul>
      <button className={cn(
        "w-full rounded px-4 py-2.5 text-sm font-semibold",
        featured
          ? "bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy-2)]"
          : "border border-[var(--brand-navy)] text-[var(--brand-navy)] hover:bg-[var(--brand-paper-2)]"
      )}>
        Empezar con {name} →
      </button>
    </div>
  );
}
```

---

## Login `/login`

Split screen: izquierda form, derecha "quote editorial" grande sobre paper-2.

```tsx
<div className="grid grid-cols-[1fr_1.1fr] min-h-screen">
  {/* Form */}
  <div className="flex flex-col justify-between p-10 bg-[var(--brand-paper)]">
    <Link href="/" className="flex items-center gap-2.5">
      <div className="flex h-[34px] w-[34px] items-center justify-center rounded bg-[var(--brand-navy)] font-serif text-xl font-bold italic text-[var(--brand-gold)]">L</div>
      <span className="font-serif text-xl font-semibold text-[var(--brand-navy)]">LegalIA</span>
    </Link>

    <div className="max-w-[400px] mx-auto w-full">
      <div className="masthead-meta mb-4"><span>INGRESO</span><span>v2.4</span></div>
      <h1 className="font-serif text-4xl font-semibold text-[var(--brand-navy)] tracking-[-0.025em] mb-2">
        Bienvenido<em className="italic text-[var(--brand-gold)]"> de vuelta.</em>
      </h1>
      <p className="text-[14px] text-[var(--brand-mute)] mb-8">
        Ingresá para continuar con tus escritos y casos.
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field label="Contraseña" type="password" value={password} onChange={setPassword} />
        <button type="submit" className="w-full rounded bg-[var(--brand-navy)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)]">
          Ingresar
        </button>
      </form>
      <div className="mt-4 flex justify-between text-[12px]">
        <Link href="/forgot" className="text-[var(--brand-navy)] border-b border-[var(--brand-gold)] pb-px">¿Olvidaste tu contraseña?</Link>
        <Link href="/register" className="text-[var(--brand-navy)]">Crear cuenta →</Link>
      </div>
    </div>

    <div className="text-[11px] text-[var(--brand-mute)]">
      © 2026 Desarrollo sin Fronteras
    </div>
  </div>

  {/* Quote */}
  <div className="hidden lg:flex bg-gradient-to-br from-[var(--brand-paper-2)] to-[var(--brand-paper-3)] p-10 items-center justify-center relative">
    <div className="absolute top-10 left-10 right-10 masthead-meta">
      <span>EL ABOGADO</span><span>ED. DIGITAL</span>
    </div>
    <blockquote className="max-w-[500px]">
      <div className="font-serif text-6xl font-semibold text-[var(--brand-gold)] italic leading-none mb-4">"</div>
      <p className="font-serif text-2xl font-medium text-[var(--brand-navy)] leading-tight tracking-[-0.01em]">
        Ahorro 4 horas por semana en redacción de escritos, sin perder rigor técnico.
      </p>
      <footer className="mt-6 flex items-center gap-3">
        <div className="h-px w-8 bg-[var(--brand-gold)]" />
        <div>
          <div className="text-[13px] font-semibold text-[var(--brand-navy)]">Dra. María Salerno</div>
          <div className="text-[11px] text-[var(--brand-mute)] font-mono">CPACF · Laboralista</div>
        </div>
      </footer>
    </blockquote>
  </div>
</div>
```

**Register** — mismo split, form más largo (nombre, matrícula, colegio, especialidad).

---

## Onboarding `/onboarding`

Wizard de 4 pasos. Progress indicator editorial (números romanos + rail gold).

```tsx
<div className="min-h-screen bg-paper-rules flex items-center justify-center p-8">
  <div className="w-full max-w-[720px] card-editorial">
    <div className="border-b border-border px-8 py-5 bg-gradient-to-b from-white to-[var(--brand-paper)]">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-3">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className="flex items-center gap-3 flex-1 last:flex-initial">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border font-serif text-[13px] font-semibold",
              n === step  ? "bg-[var(--brand-navy)] text-white border-[var(--brand-navy)]"
              : n < step  ? "bg-[var(--brand-gold)] text-[var(--brand-navy)] border-[var(--brand-gold)]"
                          : "bg-white text-[var(--brand-mute)] border-border"
            )}>
              {toRoman(n)}
            </div>
            {n < 4 && <div className={cn("flex-1 h-[2px]", n < step ? "bg-[var(--brand-gold)]" : "bg-border")} />}
          </div>
        ))}
      </div>
      <div className="t-overline text-[var(--brand-mute)]">
        Paso {toRoman(step)} de IV
      </div>
      <h2 className="font-serif text-2xl font-semibold text-[var(--brand-navy)] tracking-[-0.02em]">
        {stepTitle}
      </h2>
    </div>
    <div className="px-8 py-6">
      {/* step content */}
    </div>
    <div className="flex justify-between px-8 py-4 border-t border-border bg-[var(--brand-paper)]">
      <button onClick={back} className="text-[13px] text-[var(--brand-mute)] hover:text-[var(--brand-navy)]">← Volver</button>
      <button onClick={next} className="rounded bg-[var(--brand-navy)] px-5 py-2 text-[13px] font-semibold text-white">
        {step === 4 ? "Empezar ahora →" : "Continuar →"}
      </button>
    </div>
  </div>
</div>
```

### Pasos sugeridos
- I · **Tu perfil**: nombre, matrícula, colegio (CPACF, CASI, CALM…)
- II · **Especialidad**: multi-select (laboral, civil, familia, penal, comercial)
- III · **Jurisdicción principal**: CABA / PBA / Córdoba / Nacional / Otra
- IV · **Plan**: seleccionar Gratis / Profesional (botón destacado)

---

## ✅ Checklist
- [ ] Landing con hero editorial + pricing + FAQ
- [ ] Login con split screen quote
- [ ] Register mismo patrón
- [ ] Onboarding wizard con progress romano
- [ ] Todos los flows de Supabase auth siguen funcionando (no tocar la lógica)

## 🔗 Siguiente
→ `10-RESPONSIVE.md`
