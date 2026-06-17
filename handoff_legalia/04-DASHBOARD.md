# 04 — Dashboard Refactor

> **Archivo:** `app/(dashboard)/dashboard/page.tsx` + `components/dashboard/*`
> **Qué hace:** transforma dashboard en portada de diario editorial — masthead header, stats como deck de noticias, dos columnas principales con tabla de escritos + casos activos, widget calculadora embebido.

---

## Estructura general

```
┌──────────────────────────────────────────────────────┐
│ TOPBAR (breadcrumb + search + user menu)             │
├──────────────────────────────────────────────────────┤
│ MASTHEAD — "Panel de trabajo" fraunces + meta        │
├──────────────────────────────────────────────────────┤
│ [stat 1] [stat 2] [stat 3] [stat 4]                  │
├──────────────────────────────────────────────────────┤
│ ┌─────────────────────┬──────────────────────────┐  │
│ │                     │                          │  │
│ │ Escritos recientes  │  Casos activos           │  │
│ │ (tabla editorial)   │  (lista compacta)        │  │
│ │                     │                          │  │
│ │                     │  ─────                   │  │
│ │                     │  Calculadora widget      │  │
│ │                     │  (dark navy + gold CTA)  │  │
│ └─────────────────────┴──────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## Página principal

```tsx
export default async function DashboardPage() {
  const user = await getCurrentUser();
  const stats = await getStats(user.id);
  const escritos = await getRecentEscritos(user.id, 8);
  const casos = await getActiveCasos(user.id, 6);

  return (
    <div className="bg-paper-rules min-h-screen">
      <Topbar breadcrumb={["Workspace"]} />
      <div className="px-10 py-8">
        <Masthead user={user} />
        <StatsGrid stats={stats} />
        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6 mt-6">
          <EscritosRecent escritos={escritos} />
          <aside>
            <CasosActivos casos={casos} />
            <CalculadoraWidget />
          </aside>
        </div>
      </div>
    </div>
  );
}
```

---

## Masthead

```tsx
function Masthead({ user }: { user: User }) {
  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
  return (
    <header className="mb-8 pb-6 border-b-[3px] border-double border-[var(--brand-navy)]">
      <div className="masthead-meta mb-3">
        <span>WORKSPACE</span>
        <span>{today.toUpperCase()}</span>
        <span>ED. {user.plan === "pro" ? "PROFESIONAL" : "GRATIS"}</span>
      </div>
      <h1 className="font-[var(--font-display)] text-[clamp(2.5rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-[var(--brand-navy)]">
        Buen día,{" "}
        <em className="italic text-[var(--brand-gold)]">Dra. {user.apellido}</em>.
      </h1>
      <p className="mt-3 max-w-[640px] text-[15px] leading-[1.55] text-[var(--brand-ink-2)] font-[var(--font-serif)]">
        Tenés <strong>{stats.pendientes}</strong> escritos pendientes de revisión
        y <strong>{stats.vencimientos}</strong> vencimiento{stats.vencimientos !== 1 && "s"} esta semana.
      </p>
    </header>
  );
}
```

---

## Stats grid

```tsx
function StatsGrid({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
      <StatCard num="I"   label="Escritos / mes"   value={stats.escritos_mes}   sub={`de ${stats.escritos_limite} en tu plan`} trend="+12%" />
      <StatCard num="II"  label="Casos activos"    value={stats.casos_activos}  sub={`${stats.casos_urgentes} con vencimiento`} trend={stats.casos_urgentes > 0 ? "urgente" : undefined} urgent={stats.casos_urgentes > 0} />
      <StatCard num="III" label="Consultas IA"     value={stats.consultas_mes}  sub="este mes" />
      <StatCard num="IV"  label="Tiempo ahorrado"  value={`${stats.horas}h`}    sub="estimado por IA" />
    </div>
  );
}

function StatCard({ num, label, value, sub, trend, urgent }: Props) {
  return (
    <div className="card-editorial p-5">
      <div className="flex items-baseline justify-between mb-1">
        <span className="t-overline text-[var(--brand-mute)]">{label}</span>
        <span className="font-[var(--font-display)] italic text-[var(--brand-gold)] text-sm">{num}</span>
      </div>
      <div className="font-[var(--font-display)] text-[40px] font-semibold leading-none text-[var(--brand-navy)] tracking-[-0.02em] mt-2">
        {value}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="text-[var(--brand-mute)]">{sub}</span>
        {trend && (
          <span className={cn(
            "font-mono uppercase tracking-wider",
            urgent ? "text-[var(--brand-red)]" : "text-[var(--brand-green)]"
          )}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
```

---

## Escritos recientes (tabla)

```tsx
function EscritosRecent({ escritos }: { escritos: Escrito[] }) {
  return (
    <section className="card-editorial">
      <header className="flex items-center justify-between border-b border-border px-6 py-4 bg-gradient-to-b from-white to-[var(--brand-paper)]">
        <div>
          <h2 className="font-[var(--font-display)] text-xl font-semibold text-[var(--brand-navy)] tracking-[-0.01em]">
            Escritos recientes
          </h2>
          <div className="t-overline text-[var(--brand-mute)] mt-0.5">
            Últimos {escritos.length} · orden cronológico
          </div>
        </div>
        <Link href="/escritos" className="text-[12px] text-[var(--brand-navy)] border-b border-[var(--brand-gold)] pb-px hover:text-[var(--brand-gold)]">
          Ver todos →
        </Link>
      </header>
      <ul>
        {escritos.map((e, i) => <EscritoRow key={e.id} escrito={e} idx={i + 1} />)}
      </ul>
    </section>
  );
}

function EscritoRow({ escrito, idx }: { escrito: Escrito; idx: number }) {
  return (
    <li className="flex items-center gap-4 border-b border-[oklch(from_var(--primary)_l_c_h_/_0.06)] px-6 py-3.5 last:border-b-0 hover:bg-[var(--brand-paper)]">
      <span className="font-[var(--font-display)] italic text-[var(--brand-gold)] text-sm w-5">
        {toRoman(idx)}
      </span>
      <Link href={`/escritos/${escrito.id}`} className="flex-1 min-w-0">
        <div className="font-[var(--font-serif)] text-[14px] font-medium text-[var(--brand-navy)] leading-tight truncate">
          {escrito.titulo}
        </div>
        <div className="text-[11px] text-[var(--brand-mute)] mt-0.5 font-mono">
          {escrito.tipo.toUpperCase()} · EXP {escrito.expediente ?? "S/N"} · {timeAgo(escrito.updated_at)}
        </div>
      </Link>
      <StatusBadge estado={escrito.estado} />
    </li>
  );
}

function StatusBadge({ estado }: { estado: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    borrador:   { bg: "bg-[var(--brand-paper-2)]",   fg: "text-[var(--brand-ink-2)]", label: "Borrador" },
    revision:   { bg: "bg-[var(--brand-gold-pale)]", fg: "text-[var(--brand-navy)]",  label: "Revisión" },
    presentado: { bg: "bg-[#e6f0e9]",                fg: "text-[var(--brand-green)]", label: "Presentado" },
  };
  const s = map[estado] ?? map.borrador;
  return (
    <span className={cn("rounded px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em]", s.bg, s.fg)}>
      {s.label}
    </span>
  );
}
```

---

## Casos activos (lista compacta)

```tsx
function CasosActivos({ casos }: { casos: Caso[] }) {
  return (
    <section className="card-editorial mb-6">
      <header className="border-b border-border px-5 py-4">
        <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)]">
          Casos activos
        </h2>
        <div className="t-overline text-[var(--brand-mute)] mt-0.5">{casos.length} abiertos</div>
      </header>
      <ul>
        {casos.map(c => (
          <li key={c.id} className="border-b border-[oklch(from_var(--primary)_l_c_h_/_0.06)] px-5 py-3 last:border-b-0">
            <Link href={`/casos/${c.id}`} className="block">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono text-[10px] text-[var(--brand-gold)]">EXP {c.expediente ?? "S/N"}</span>
                {c.vencimiento_dias !== null && c.vencimiento_dias <= 3 && (
                  <span className="font-mono text-[9px] font-bold uppercase text-[var(--brand-red)]">
                    VTO {c.vencimiento_dias === 0 ? "HOY" : `${c.vencimiento_dias}D`}
                  </span>
                )}
              </div>
              <div className="font-[var(--font-serif)] text-[13px] font-medium text-[var(--brand-navy)] leading-snug line-clamp-2">
                {c.caratula}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

---

## Topbar

```tsx
function Topbar({ breadcrumb }: { breadcrumb: string[] }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-white/80 backdrop-blur px-10 py-3 sticky top-0 z-30">
      <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
        {breadcrumb.map((b, i) => (
          <span key={i} className={cn("flex items-center gap-2", i === breadcrumb.length - 1 && "text-[var(--brand-navy)]")}>
            {i > 0 && <span className="text-[var(--brand-gold)]/50">/</span>}
            {b}
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <SearchInput />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
```

---

## Helpers

```tsx
function toRoman(n: number): string {
  const r = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return r[n] ?? String(n);
}

function timeAgo(d: Date | string): string {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600_000);
  if (h < 1) return "hace minutos";
  if (h < 24) return `hace ${h}h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `hace ${days}d`;
  return new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}
```

---

## ✅ Checklist

- [ ] Masthead con fraunces big headline + meta
- [ ] 4 stat cards con numerales romanos
- [ ] Stats muestran datos reales (fetch desde supabase)
- [ ] Tabla escritos con status badges
- [ ] Casos activos con badge de vencimiento rojo < 3 días
- [ ] Calc widget navy embebido (importar desde `08-CALCULADORAS.md`)
- [ ] Topbar con breadcrumb mono
- [ ] Responsive: 1-col en `< xl`

## 🔗 Siguiente
→ `05-CHAT.md`
