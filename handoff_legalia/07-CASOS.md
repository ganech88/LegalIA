# 07 — Casos (Listado y Detalle)

> **Archivo:** `apps/web/components/casos/casos-client.tsx` + `app/(dashboard)/casos/page.tsx`

---

## Listado de casos

```tsx
<div className="bg-paper-rules min-h-screen">
  <Topbar breadcrumb={["Workspace", "Casos"]} />
  <div className="px-10 py-8">
    <header className="flex items-end justify-between mb-6 pb-5 border-b border-[var(--brand-navy)]">
      <div>
        <div className="masthead-meta mb-2">
          <span>EXPEDIENTES</span>
          <span>{activos} ACTIVOS · {archivados} ARCHIVADOS</span>
        </div>
        <h1 className="font-serif text-4xl font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
          Mis casos
        </h1>
      </div>
      <button className="rounded bg-[var(--brand-navy)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-navy-2)]">
        + Nuevo caso
      </button>
    </header>

    {/* Filtros */}
    <div className="flex gap-2 mb-4">
      {["Todos", "Activos", "Con vencimiento", "Archivados"].map(f => (
        <button key={f} className="rounded-full border border-border bg-white px-3 py-1 text-[11px] text-[var(--brand-navy)] hover:border-[var(--brand-gold)]">
          {f}
        </button>
      ))}
    </div>

    {/* Tabla / lista */}
    <div className="card-editorial overflow-hidden">
      {casos.map(c => <CasoRow key={c.id} caso={c} />)}
    </div>
  </div>
</div>
```

### CasoRow

```tsx
function CasoRow({ caso }: { caso: Caso }) {
  const vence = caso.proximo_vencimiento ? daysTo(caso.proximo_vencimiento) : null;
  return (
    <Link href={`/casos/${caso.id}`} className="flex items-center gap-4 border-b border-[oklch(from_var(--primary)_l_c_h_/_0.06)] px-5 py-4 last:border-b-0 transition-colors hover:bg-[var(--brand-paper)]">
      <span className="font-mono text-[11px] text-[var(--brand-navy)] bg-[var(--brand-paper)] px-2 py-1 rounded border border-border">
        {caso.expediente ?? "S/N"}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-serif text-[15px] font-medium text-[var(--brand-navy)] leading-tight">
          {caso.caratula}
        </div>
        <div className="text-[11px] text-[var(--brand-mute)] mt-0.5">
          {caso.fuero.toUpperCase()} · {caso.juzgado ?? "—"} · {caso.jurisdiccion} · {caso.escritos_count ?? 0} escritos
        </div>
      </div>
      {vence !== null && vence <= 3 ? (
        <span className="rounded px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] bg-[#f6e6e2] text-[var(--brand-red)]">
          Vto. {vence === 0 ? "HOY" : `en ${vence}d`}
        </span>
      ) : (
        <span className="rounded px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] bg-[#e6f0e9] text-[var(--brand-green)]">
          {caso.estado}
        </span>
      )}
    </Link>
  );
}
```

---

## Detalle `/casos/[id]`

Dos columnas: timeline + escritos vinculados + documentos (izq), metadata del caso + partes (der).

```tsx
<div className="bg-paper-rules min-h-screen">
  <Topbar breadcrumb={["Workspace", "Casos", caso.caratula]} />
  <div className="px-10 py-8">
    <header className="mb-6">
      <div className="masthead-meta mb-2">
        <span className="font-mono">EXP {caso.expediente}</span>
        <span>{caso.fuero.toUpperCase()}</span>
      </div>
      <h1 className="font-serif text-3xl font-semibold text-[var(--brand-navy)] tracking-[-0.025em]">
        {caso.caratula}
      </h1>
    </header>

    <div className="grid grid-cols-[1.5fr_1fr] gap-8">
      <div>
        {/* Timeline */}
        <div className="card-editorial mb-6">
          <div className="border-b border-border px-6 py-4"><h3 className="font-serif text-lg font-semibold text-[var(--brand-navy)]">Cronología</h3></div>
          <Timeline events={caso.timeline} />
        </div>
        {/* Escritos vinculados */}
        <div className="card-editorial">
          <div className="border-b border-border px-6 py-4 flex justify-between">
            <h3 className="font-serif text-lg font-semibold text-[var(--brand-navy)]">Escritos vinculados</h3>
            <Link href={`/escritos/nuevo?caso=${caso.id}`} className="text-[11px] text-[var(--brand-navy)] border-b border-[var(--brand-gold)]">+ Nuevo</Link>
          </div>
          {/* rows igual que EscritosTable pero filtrados por caso */}
        </div>
      </div>

      <aside>
        <div className="card-editorial mb-4 accent-top-gold">
          <div className="px-6 py-4"><h3 className="font-serif text-base font-semibold text-[var(--brand-navy)]">Partes</h3></div>
          <div className="px-6 pb-4 space-y-3">
            <KV label="Actor" value={caso.cliente_nombre} />
            <KV label="Demandado" value={caso.contraparte_nombre} />
            <KV label="Juzgado" value={caso.juzgado} mono />
            <KV label="Jurisdicción" value={caso.jurisdiccion} />
            <KV label="Estado" value={caso.estado} />
          </div>
        </div>
        <div className="card-editorial">
          <div className="px-6 py-4 border-b border-border"><h3 className="font-serif text-base font-semibold text-[var(--brand-navy)]">Notas</h3></div>
          <textarea className="w-full font-serif text-[14px] leading-relaxed p-6 bg-transparent outline-none" defaultValue={caso.notas} placeholder="Notas del caso…" />
        </div>
      </aside>
    </div>
  </div>
</div>
```

### KV + Timeline helpers

```tsx
function KV({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2 text-[13px]">
      <span className="t-overline text-[var(--brand-mute)]">{label}</span>
      <span className={cn("text-[var(--brand-ink)]", mono && "font-mono text-[12px]")}>{value ?? "—"}</span>
    </div>
  );
}

function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative px-6 py-5">
      {events.map((e, i) => (
        <li key={e.id} className="relative pl-6 pb-5 last:pb-0 border-l border-border ml-2">
          <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-[var(--brand-gold)] ring-4 ring-white" />
          <div className="font-mono text-[10px] text-[var(--brand-gold)] uppercase tracking-wider mb-1">
            {new Date(e.date).toLocaleDateString("es-AR")}
          </div>
          <div className="font-serif text-[14px] font-medium text-[var(--brand-navy)]">{e.title}</div>
          {e.detail && <div className="text-[12px] text-[var(--brand-ink-2)] mt-0.5">{e.detail}</div>}
        </li>
      ))}
    </ol>
  );
}
```

---

## ✅ Checklist
- [ ] Listado con filtros y rows tipo expediente
- [ ] Badge de vencimiento rojo si < 3 días
- [ ] Detalle con 2 col: timeline + metadata
- [ ] Notas textarea serif auto-save
- [ ] Vincular escritos existentes

## 🔗 Siguiente
→ `08-CALCULADORAS.md`
