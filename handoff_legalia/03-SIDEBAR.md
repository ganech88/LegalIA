# 03 — Sidebar Refactor

> **Archivo:** `apps/web/components/layout/sidebar.tsx` (o la ruta real del sidebar actual)
> **Qué hace:** reemplaza sidebar verde pastel por sidebar navy editorial con numerales romanos.

---

## Estructura visual

- Fondo: `var(--brand-navy)` con degrade sutil hacia `--brand-navy-2` abajo.
- Ancho fijo: **260px** desktop, drawer móvil.
- Logo bloque: cuadrado gold sobre navy con `L` en Fraunces italic.
- Items: numeral romano en gold a la izquierda + label Plex Sans.
- Divisores: hairlines en gold @ 20% opacity.
- Sección "plan" al pie: card navy-2 con progress bar gold.

---

## Código completo

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { num: "I",   label: "Dashboard",    href: "/dashboard" },
  { num: "II",  label: "Asistente IA", href: "/asistente" },
  { num: "III", label: "Escritos",     href: "/escritos",   badge: 3 },
  { num: "IV",  label: "Casos",        href: "/casos" },
  { num: "V",   label: "Calculadoras", href: "/calculadoras" },
  { num: "VI",  label: "Biblioteca",   href: "/biblioteca" },
];

const secondary = [
  { num: "VII",  label: "Configuración", href: "/settings" },
  { num: "VIII", label: "Ayuda",         href: "/help" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 flex h-screen w-[260px] flex-col bg-gradient-to-b from-[var(--brand-navy)] to-[var(--brand-navy-2)] text-white">
      {/* Logo block */}
      <Link href="/dashboard" className="flex items-center gap-3 border-b border-[var(--brand-gold)]/20 px-5 py-5">
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded bg-[var(--brand-gold)] font-[var(--font-display)] text-[22px] font-bold italic text-[var(--brand-navy)]">
          L
        </div>
        <div className="leading-tight">
          <div className="font-[var(--font-display)] text-[18px] font-semibold tracking-[-0.01em]">LegalIA</div>
          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--brand-gold)]/80">Ed. Jurídica AR</div>
        </div>
      </Link>

      {/* Masthead meta */}
      <div className="border-b border-[var(--brand-gold)]/15 px-5 py-3">
        <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-white/50">
          <span>WORKSPACE</span>
          <span className="text-[var(--brand-gold)]/80">
            {new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "short" }).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="px-2 pb-2 text-[10px] uppercase tracking-[0.16em] text-[var(--brand-gold)]/70 font-mono">
          ◆ Workspace
        </div>
        <ul className="space-y-0.5">
          {nav.map(item => (
            <NavItem key={item.href} item={item} active={pathname.startsWith(item.href)} />
          ))}
        </ul>

        <div className="mt-6 px-2 pb-2 text-[10px] uppercase tracking-[0.16em] text-[var(--brand-gold)]/70 font-mono">
          ◇ Cuenta
        </div>
        <ul className="space-y-0.5">
          {secondary.map(item => (
            <NavItem key={item.href} item={item} active={pathname.startsWith(item.href)} />
          ))}
        </ul>
      </nav>

      {/* Plan card */}
      <div className="border-t border-[var(--brand-gold)]/20 p-4">
        <div className="rounded bg-[var(--brand-navy-2)] border border-[var(--brand-gold)]/25 p-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--brand-gold)]">Plan profesional</div>
            <div className="font-[var(--font-display)] text-[11px] italic text-[var(--brand-gold)]">§</div>
          </div>
          <div className="font-[var(--font-display)] text-[22px] font-semibold leading-none mb-1">
            18<span className="text-[14px] text-white/50 font-normal">/30</span>
          </div>
          <div className="text-[10px] text-white/60 mb-2">escritos este mes</div>
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-[var(--brand-gold)]" style={{ width: "60%" }} />
          </div>
        </div>
      </div>

      {/* User */}
      <div className="flex items-center gap-3 border-t border-[var(--brand-gold)]/20 bg-black/20 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-gold)] font-[var(--font-display)] text-sm font-bold text-[var(--brand-navy)]">
          MS
        </div>
        <div className="flex-1 min-w-0">
          <div className="truncate text-[13px] font-medium">Dra. María Salerno</div>
          <div className="truncate font-mono text-[10px] text-white/50">CPACF T° 472 F° 108</div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ item, active }: { item: any; active: boolean }) {
  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "group flex items-center gap-3 rounded px-2.5 py-2 text-[13px] transition-colors",
          active
            ? "bg-[var(--brand-gold)]/12 text-white"
            : "text-white/75 hover:bg-white/5 hover:text-white"
        )}
      >
        <span className={cn(
          "w-6 font-[var(--font-display)] text-[12px] italic text-right",
          active ? "text-[var(--brand-gold)]" : "text-white/40 group-hover:text-[var(--brand-gold)]/80"
        )}>
          {item.num}
        </span>
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className="rounded bg-[var(--brand-gold)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--brand-navy)]">
            {item.badge}
          </span>
        )}
        {active && <span className="h-1 w-1 rounded-full bg-[var(--brand-gold)]" />}
      </Link>
    </li>
  );
}
```

---

## Drawer móvil

Si el sidebar actual ya tiene lógica de drawer (usualmente via shadcn `Sheet`), mantener el wrapper pero reemplazar el contenido con `<Sidebar />` de arriba.

Si no existe, agregar en `app/(dashboard)/layout.tsx`:

```tsx
<div className="min-h-screen">
  {/* Desktop sidebar */}
  <div className="hidden lg:block">
    <Sidebar />
  </div>
  {/* Mobile drawer */}
  <Sheet open={open} onOpenChange={setOpen}>
    <SheetContent side="left" className="w-[260px] p-0 bg-[var(--brand-navy)]">
      <Sidebar />
    </SheetContent>
  </Sheet>
  <main className="lg:pl-[260px]">{children}</main>
</div>
```

---

## ✅ Checklist

- [ ] Sidebar navy con logo gold + Fraunces
- [ ] Numerales romanos en cada item, alineados a la izquierda
- [ ] Sección masthead-meta con fecha dinámica
- [ ] Plan card al pie con progress bar gold
- [ ] User footer con matrícula en mono
- [ ] Drawer móvil funciona
- [ ] Estado activo con bg gold semi-transparente

## 🔗 Siguiente
→ `04-DASHBOARD.md`
