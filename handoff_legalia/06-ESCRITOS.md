# 06 — Escritos (Listado + Formulario + Editor)

> **Archivos:** `escritos-client.tsx`, `dynamic-form.tsx`, `editor.tsx` + páginas en `app/(dashboard)/escritos/`

---

## 6.1 Listado `/escritos`

Layout editorial con:
- Masthead pequeño (h1 Fraunces "Escritos" + meta)
- Grid de templates (5 cards con number roman I-V, título serif, subtítulo, usage count mono)
- Historial abajo (tabla simple con columnas: Título · Caso · Fecha · Estado · Acciones)

```tsx
<div className="bg-paper-rules min-h-screen">
  <Topbar breadcrumb={["Workspace", "Escritos"]} />

  <div className="px-10 py-8">
    <header className="mb-8 pb-6 border-b border-[var(--brand-navy)]">
      <div className="masthead-meta mb-3">
        <span>GENERADOR DE ESCRITOS</span>
        <span>{templates.length} PLANTILLAS DISPONIBLES</span>
      </div>
      <h1 className="font-serif text-4xl font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
        Plantillas de escritos
      </h1>
      <p className="mt-2 text-[15px] text-[var(--brand-ink-2)] max-w-[600px]">
        Generá borradores con formato procesal argentino. Cada plantilla es ajustable al caso.
      </p>
    </header>

    <section className="grid grid-cols-2 gap-0 border border-border rounded overflow-hidden bg-white mb-10">
      {templates.map((t, i) => (
        <TemplateCard key={t.id} tpl={t} num={toRoman(i + 1)} />
      ))}
    </section>

    <section>
      <h2 className="font-serif text-2xl font-semibold text-[var(--brand-navy)] mb-4">
        Tus escritos recientes
      </h2>
      <EscritosTable items={recentEscritos} />
    </section>
  </div>
</div>
```

### TemplateCard

```tsx
function TemplateCard({ tpl, num }: { tpl: Template; num: string }) {
  return (
    <Link
      href={`/escritos/nuevo/${tpl.id}`}
      className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-r border-border p-5 transition-colors hover:bg-[var(--brand-paper)]"
    >
      <div className="w-8 text-center font-serif text-2xl font-semibold italic text-[var(--brand-gold)]">
        {num}
      </div>
      <div>
        <h4 className="font-serif text-[15px] font-semibold text-[var(--brand-navy)]">{tpl.nombre_display}</h4>
        <p className="text-[11px] text-[var(--brand-mute)] mt-0.5 leading-[1.5]">{tpl.descripcion}</p>
        <div className="mt-1.5 flex gap-1.5">
          {tpl.jurisdiccion.map(j => (
            <span key={j} className="font-mono text-[10px] text-[var(--brand-mute)] uppercase tracking-wider">{j}</span>
          ))}
        </div>
      </div>
      <div className="text-right text-[10px] text-[var(--brand-mute)] uppercase tracking-wider">
        Usada
        <div className="font-mono text-[11px] text-[var(--brand-navy)] font-semibold">{tpl.usage_count}×</div>
      </div>
    </Link>
  );
}
```

### EscritosTable

```tsx
function EscritosTable({ items }: { items: Escrito[] }) {
  return (
    <div className="overflow-hidden rounded border border-border bg-white">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="bg-[var(--brand-paper-2)] text-[10px] uppercase tracking-[0.12em] text-[var(--brand-navy)]">
            <th className="px-4 py-3 font-semibold">Título</th>
            <th className="px-4 py-3 font-semibold">Expediente</th>
            <th className="px-4 py-3 font-semibold">Jurisdicción</th>
            <th className="px-4 py-3 font-semibold">Fecha</th>
            <th className="px-4 py-3 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map(e => (
            <tr key={e.id} className="border-t border-border hover:bg-[var(--brand-paper)]">
              <td className="px-4 py-3">
                <Link href={`/escritos/${e.id}`} className="font-serif font-medium text-[var(--brand-navy)] hover:text-[var(--brand-gold)]">
                  {e.titulo}
                </Link>
              </td>
              <td className="px-4 py-3 font-mono text-[11px] text-[var(--brand-navy)]">{e.expediente ?? "—"}</td>
              <td className="px-4 py-3 text-[var(--brand-ink-2)]">{e.jurisdiccion}</td>
              <td className="px-4 py-3 text-[var(--brand-mute)] font-mono text-[11px]">
                {new Date(e.created_at).toLocaleDateString("es-AR")}
              </td>
              <td className="px-4 py-3 text-right">
                <button className="text-[11px] text-[var(--brand-navy)] border-b border-[var(--brand-gold)] pb-px">
                  Abrir →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 6.2 Formulario `/escritos/nuevo/[templateId]`

Dos columnas: `1fr 1.2fr`. Izquierda el form, derecha preview en vivo del prompt armado.

```tsx
<div className="bg-paper-rules min-h-screen">
  <Topbar breadcrumb={["Workspace", "Escritos", "Nuevo"]} />
  <div className="px-10 py-8">
    <header className="mb-6">
      <div className="masthead-meta mb-2">
        <span>PLANTILLA {toRoman(n)}</span>
        <span>{template.fuero.toUpperCase()}</span>
      </div>
      <h1 className="font-serif text-3xl font-semibold text-[var(--brand-navy)] tracking-[-0.025em]">
        {template.nombre_display}
      </h1>
    </header>

    <div className="grid grid-cols-[1fr_1.2fr] gap-8">
      <div className="card-editorial">
        <div className="border-b border-border px-6 py-4 bg-gradient-to-b from-white to-[var(--brand-paper)]">
          <h3 className="font-serif text-lg font-semibold text-[var(--brand-navy)]">Datos del caso</h3>
        </div>
        <div className="px-6 py-5">
          <DynamicForm
            schema={template.campos_requeridos}
            onSubmit={handleGenerate}
            submitLabel="Generar borrador"
          />
        </div>
      </div>

      <div className="card-editorial accent-top-gold">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-serif text-lg font-semibold text-[var(--brand-navy)]">
            Vista preliminar del prompt
            <span className="num-badge ml-2">sonnet 4.6</span>
          </h3>
        </div>
        <pre className="px-6 py-5 font-mono text-[11px] leading-[1.7] text-[var(--brand-ink-2)] whitespace-pre-wrap">
          {previewPrompt}
        </pre>
      </div>
    </div>
  </div>
</div>
```

### DynamicForm styling

Inputs editoriales, labels en overline:

```tsx
// Cada Field del schema se renderiza así:
<label className="block mb-4">
  <span className="t-overline text-[var(--brand-navy)] block mb-1.5">
    {field.label}
    {field.required && <span className="text-[var(--brand-gold)] ml-1">*</span>}
  </span>
  <input
    type={field.type}
    className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] transition-colors focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
    {...field.props}
  />
  {field.helper && (
    <span className="mt-1 block text-[11px] text-[var(--brand-mute)]">{field.helper}</span>
  )}
</label>
```

Select y textarea siguen el mismo patrón.

Botón submit:

```tsx
<button
  type="submit"
  disabled={isLoading}
  className="w-full rounded bg-[var(--brand-navy)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-navy-2)] disabled:opacity-50"
>
  {isLoading ? "Generando…" : "Generar borrador →"}
</button>
```

---

## 6.3 Editor `/escritos/[id]`

El editor existente (editor.tsx) se mantiene funcional. Cambiar solo el chrome:

```tsx
<div className="bg-paper-rules min-h-screen">
  <Topbar breadcrumb={["Workspace", "Escritos", escrito.titulo]} />

  <div className="px-10 py-6">
    {/* Header de acciones */}
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="masthead-meta mb-1">
          <span>ESCRITO · {escrito.tipo.toUpperCase()}</span>
          <span>{escrito.jurisdiccion}</span>
        </div>
        <h1 className="font-serif text-2xl font-semibold text-[var(--brand-navy)] tracking-[-0.02em]">
          {escrito.titulo}
        </h1>
      </div>
      <div className="flex gap-2">
        <button className="rounded border border-border bg-white px-3 py-2 text-[12px] hover:border-[var(--brand-gold)]">
          Regenerar
        </button>
        <button className="rounded border border-[var(--brand-gold)] bg-[var(--brand-gold-pale)] px-3 py-2 text-[12px] text-[var(--brand-navy)] font-semibold hover:bg-[var(--brand-gold)] hover:text-white">
          ↓ Exportar DOCX
        </button>
      </div>
    </div>

    {/* Editor card con papel legal */}
    <div className="card-editorial" style={{ minHeight: "calc(100vh - 240px)" }}>
      <div className="flex items-center justify-between border-b border-border px-8 py-3 bg-[var(--brand-paper-2)] text-[10px] uppercase tracking-[0.12em] text-[var(--brand-navy)]">
        <span>Borrador · {wordCount} palabras</span>
        <span className="font-mono">Auto-guardado · {lastSavedAgo}</span>
      </div>

      {/* Inner con tipografía serif para el texto legal */}
      <div className="px-12 py-10 max-w-[820px] mx-auto">
        <TextareaEditor
          value={contenido}
          onChange={setContenido}
          className="w-full font-serif text-[15px] leading-[1.8] text-[var(--brand-ink)] bg-transparent outline-none resize-none"
          style={{ minHeight: "600px" }}
        />
      </div>
    </div>
  </div>
</div>
```

**Detalle clave:** el texto del escrito se muestra en **Fraunces serif 15px line-height 1.8** — mimetiza un documento legal sobre papel. El chrome (header, toolbar) queda en Inter.

---

## ✅ Checklist

- [ ] Listado con grid de templates numerados
- [ ] Tabla de escritos recientes con mono para fechas/expedientes
- [ ] Form dinámico con inputs editoriales (overline labels, gold focus ring)
- [ ] Preview de prompt en panel derecho con mono
- [ ] Editor con tipografía serif para el contenido
- [ ] Export DOCX sigue funcionando (sin cambios en la API)

## 🔗 Siguiente

→ `07-CASOS.md`
