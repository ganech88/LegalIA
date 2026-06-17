# 08 — Calculadoras

> Nuevas rutas `/calculadoras/*` + widget embebido en dashboard.

## Calculadoras incluidas

1. **Art. 245 LCT** — Indemnización por despido sin causa
2. **Ley 24.557 (ART)** — Indemnización por accidente laboral
3. **Intereses BNA/CNAT** — Tasa activa y acta CNAT
4. **Actualización por IPC / RIPTE** — Valores históricos

---

## Layout base `/calculadoras`

Grid de cards, estilo editorial:

```tsx
<div className="bg-paper-rules min-h-screen">
  <Topbar breadcrumb={["Workspace", "Calculadoras"]} />
  <div className="px-10 py-8">
    <header className="mb-8 pb-6 border-b border-[var(--brand-navy)]">
      <div className="masthead-meta mb-2"><span>HERRAMIENTAS DE CÁLCULO</span></div>
      <h1 className="font-serif text-4xl font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
        Calculadoras legales
      </h1>
      <p className="mt-2 text-[15px] text-[var(--brand-ink-2)] max-w-[600px]">
        Cálculos verificados según legislación y jurisprudencia vigente. Índices actualizados al último período disponible.
      </p>
    </header>
    <div className="grid grid-cols-3 gap-4">
      <CalcCard
        num="I"
        title="Indemnización art. 245 LCT"
        desc="Antigüedad · preaviso · integración mes · SAC"
        href="/calculadoras/art-245"
      />
      <CalcCard num="II" title="Accidente laboral — Ley 24.557" desc="ILP · ILT · gran invalidez · muerte" href="/calculadoras/art-ley-24557" />
      <CalcCard num="III" title="Intereses" desc="Tasa activa BNA · acta CNAT 2658/2664/2783" href="/calculadoras/intereses" />
      <CalcCard num="IV" title="Actualización IPC / RIPTE" desc="Indexación de créditos laborales" href="/calculadoras/actualizacion" />
    </div>
  </div>
</div>
```

### CalcCard

```tsx
function CalcCard({ num, title, desc, href }: Props) {
  return (
    <Link href={href} className="group card-editorial p-5 block transition-all hover:border-[var(--brand-gold)] hover:-translate-y-0.5">
      <div className="font-serif text-3xl font-semibold italic text-[var(--brand-gold)] mb-2">{num}</div>
      <h3 className="font-serif text-[17px] font-semibold text-[var(--brand-navy)] leading-tight mb-1.5">{title}</h3>
      <p className="text-[12px] text-[var(--brand-mute)] leading-relaxed">{desc}</p>
      <div className="mt-4 pt-3 border-t border-border text-[11px] text-[var(--brand-navy)] font-semibold">
        Abrir calculadora →
      </div>
    </Link>
  );
}
```

---

## Calculadora art. 245 LCT `/calculadoras/art-245`

Dos columnas: inputs (izq), resultado detallado (der).

```tsx
<div className="grid grid-cols-[1fr_1.2fr] gap-8">
  {/* Inputs */}
  <div className="card-editorial">
    <div className="border-b border-border px-6 py-4 bg-gradient-to-b from-white to-[var(--brand-paper)]">
      <h3 className="font-serif text-lg font-semibold text-[var(--brand-navy)]">Datos del trabajador</h3>
      <p className="text-[11px] text-[var(--brand-mute)] mt-0.5">Art. 245, 232, 233 LCT</p>
    </div>
    <div className="px-6 py-5 space-y-4">
      <Field label="Mejor remuneración mensual normal y habitual" type="currency" value={mejorRem} onChange={setMejorRem} helper="Promedio o mejor según lo más favorable (Vizzoti)" />
      <Field label="Fecha de ingreso" type="date" value={fechaIngreso} onChange={setFechaIngreso} />
      <Field label="Fecha de despido" type="date" value={fechaDespido} onChange={setFechaDespido} />
      <Field label="Convenio colectivo" type="select" options={CCT_OPTIONS} value={cct} onChange={setCCT} helper="Para aplicar tope art. 245 (3× promedio CCT)" />
      <label className="flex items-center gap-2 text-[13px]">
        <input type="checkbox" checked={aplicaVizzoti} onChange={e => setAplicaVizzoti(e.target.checked)} />
        Aplicar doctrina Vizzoti (tope 67%)
      </label>
    </div>
  </div>

  {/* Resultado */}
  <div className="card-editorial accent-top-gold">
    <div className="border-b border-border px-6 py-4">
      <h3 className="font-serif text-lg font-semibold text-[var(--brand-navy)]">Liquidación</h3>
    </div>
    <div className="px-6 py-5">
      {/* Tabla rubros */}
      <table className="w-full text-[13px]">
        <tbody>
          <RubroRow label="Antigüedad · art. 245" detail={`${antigüedad} años × $${mejorRem}`} value={indAntiguedad} />
          <RubroRow label="Preaviso · art. 232" detail={preavisoMeses === 1 ? "1 mes" : "2 meses"} value={preaviso} />
          <RubroRow label="Integración mes · art. 233" detail={`${diasIntegracion} días`} value={integracion} />
          <RubroRow label="SAC s/ preaviso + integración" value={sacPreaviso} />
          <RubroRow label="Vacaciones proporcionales" value={vacaciones} />
          <RubroRow label="SAC proporcional" value={sacProp} />
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-[var(--brand-navy)]">
            <td colSpan={2} className="pt-3 font-serif text-[15px] font-semibold text-[var(--brand-navy)]">Total estimado</td>
            <td className="pt-3 text-right font-serif text-2xl font-semibold text-[var(--brand-navy)]">
              {formatCurrency(total)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-5 flex gap-2">
        <button onClick={generarEscrito} className="flex-1 rounded bg-[var(--brand-navy)] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--brand-navy-2)]">
          Generar demanda con estos datos →
        </button>
        <button onClick={exportarPDF} className="rounded border border-[var(--brand-gold)] bg-[var(--brand-gold-pale)] px-3 py-2.5 text-[13px] text-[var(--brand-navy)]">
          ↓ PDF
        </button>
      </div>

      <div className="disclaimer-band mt-4">
        <div className="text-[11px]">
          <b>Cálculo orientativo.</b> Verificar topes actualizados y jurisprudencia aplicable.
        </div>
      </div>
    </div>
  </div>
</div>
```

### RubroRow

```tsx
function RubroRow({ label, detail, value }: { label: string; detail?: string; value: number }) {
  return (
    <tr className="border-b border-[oklch(from_var(--primary)_l_c_h_/_0.06)]">
      <td className="py-2.5 pr-2">
        <div className="font-medium text-[var(--brand-navy)]">{label}</div>
        {detail && <div className="text-[11px] text-[var(--brand-mute)] mt-0.5">{detail}</div>}
      </td>
      <td className="py-2.5 text-right font-mono text-[13px] text-[var(--brand-ink)]">
        {formatCurrency(value)}
      </td>
    </tr>
  );
}
```

---

## Widget embebido en dashboard

Compacto, dark navy fondo, gold CTA — mirar el mockup v5, sección `.calc-widget`.

```tsx
function CalculadoraWidget({ ultimoCaso }: { ultimoCaso?: Caso }) {
  return (
    <div className="relative overflow-hidden rounded bg-gradient-to-br from-[var(--brand-navy)] to-[var(--brand-navy-2)] p-5 text-white mb-6">
      {/* Círculos decorativos */}
      <div aria-hidden className="absolute -top-8 -right-8 h-30 w-30 rounded-full border border-[var(--brand-gold)] opacity-20" style={{ width: 120, height: 120 }} />
      <div aria-hidden className="absolute -top-16 -right-16 h-45 w-45 rounded-full border border-[var(--brand-gold)] opacity-10" style={{ width: 180, height: 180 }} />

      <div className="relative z-10">
        <div className="text-[10px] tracking-[0.16em] uppercase text-[var(--brand-gold-2)] mb-1.5">
          ◆ Calculadora · art. 245 LCT
        </div>
        <h4 className="font-serif text-[22px] font-semibold mb-1 tracking-[-0.01em]">Indemnización por despido</h4>
        <p className="text-[12px] opacity-80 mb-3.5">
          {ultimoCaso ? <>Último cálculo del caso <span className="font-mono">EXP {ultimoCaso.expediente}</span></> : "Sin cálculos recientes"}
        </p>
        <Link href="/calculadoras/art-245" className="inline-block rounded bg-[var(--brand-gold)] px-3.5 py-2 text-[12px] font-bold text-[var(--brand-navy)] hover:bg-[var(--brand-gold-2)]">
          Abrir calculadora →
        </Link>
      </div>
    </div>
  );
}
```

---

## Lógica de cálculo (`lib/legal/calculadoras.ts`)

Ya existe en el repo. NO tocar la matemática, solo asegurar que la función exportada acepta los mismos inputs del form nuevo. Si las props difieren, hacer un adapter.

---

## ✅ Checklist

- [ ] 4 calc cards en `/calculadoras`
- [ ] Calc art. 245 con inputs + tabla rubros + total grande
- [ ] Botón "Generar demanda con estos datos" que pasa los valores al generador
- [ ] Widget compacto en dashboard
- [ ] Exportar PDF del cálculo (opcional fase 2)

## 🔗 Siguiente
→ `09-LANDING-AUTH.md`
