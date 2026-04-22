"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const nav = [
  { num: "I",   label: "Dashboard",    href: "/dashboard" },
  { num: "II",  label: "Escritos",     href: "/escritos" },
  { num: "III", label: "Asistente IA", href: "/asistente" },
  { num: "IV",  label: "Casos",        href: "/casos" },
  { num: "V",   label: "Calculadoras", href: "/calculadoras" },
];

const secondary = [
  { num: "VI",  label: "Configuracion", href: "/config" },
];

interface SidebarProps {
  userName?: string;
  plan?: string;
  escritosUsados?: number;
  escritosLimit?: number;
}

export function Sidebar({ userName, plan = "free", escritosUsados = 0, escritosLimit = 3 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  const planLabel = plan === "profesional" ? "PLAN PROFESIONAL" : plan === "estudio" ? "PLAN ESTUDIO" : "PLAN GRATUITO";
  const pct = escritosLimit === Infinity ? 0 : Math.min(100, Math.round((escritosUsados / escritosLimit) * 100));
  const mesAbrev = new Date().toLocaleDateString("es-AR", { month: "short" }).toUpperCase().replace(".", "");
  const initials = userName
    ? userName.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase()
    : "AB";

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 border-b border-[var(--brand-gold)]/20 px-5 py-5">
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded bg-[var(--brand-gold)] font-[var(--font-display)] text-[22px] font-bold italic text-[var(--brand-navy)]">
          L
        </div>
        <div className="leading-tight">
          <div className="font-[var(--font-display)] text-[18px] font-semibold tracking-[-0.01em] text-white">LegalIA</div>
          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--brand-gold)]/80">Ed. Juridica AR</div>
        </div>
      </Link>

      {/* User info */}
      {userName && (
        <div className="border-b border-[var(--brand-gold)]/15 px-5 py-3">
          <div className="text-[13px] font-medium text-white truncate">{userName}</div>
          <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/50 mt-0.5">
            WORKSPACE · {new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "short" }).toUpperCase()}
          </div>
        </div>
      )}

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="px-2 pb-2 text-[10px] uppercase tracking-[0.16em] text-[var(--brand-gold)]/70 font-mono">
          ◆ Workspace
        </div>
        <ul className="space-y-0.5">
          {nav.map(item => (
            <NavItem key={item.href} item={item} active={pathname === item.href || pathname.startsWith(item.href + "/")} onNavigate={() => setOpen(false)} />
          ))}
        </ul>

        <div className="mt-6 px-2 pb-2 text-[10px] uppercase tracking-[0.16em] text-[var(--brand-gold)]/70 font-mono">
          ◇ Cuenta
        </div>
        <ul className="space-y-0.5">
          {secondary.map(item => (
            <NavItem key={item.href} item={item} active={pathname === item.href || pathname.startsWith(item.href + "/")} onNavigate={() => setOpen(false)} />
          ))}
        </ul>
      </nav>

      {/* Plan usage */}
      <div className="border-t border-[var(--brand-gold)]/20 px-4 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/70">{planLabel}</div>
          <div className="font-mono text-[11px] font-bold text-[var(--brand-gold)]">{pct}% · {mesAbrev}</div>
        </div>
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10 mb-1.5">
          <div className="h-full bg-[var(--brand-gold)] transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="font-mono text-[10px] text-white/50">
          {escritosUsados}/{escritosLimit === Infinity ? "∞" : escritosLimit} escritos · consultas {plan === "free" ? "20/mes" : "ilim."}
        </div>
      </div>

      {/* User + logout */}
      <div className="flex items-center gap-3 border-t border-[var(--brand-gold)]/20 bg-black/20 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-gold)] font-[var(--font-display)] text-sm font-bold text-[var(--brand-navy)]">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="truncate text-[13px] font-medium text-white">{userName || "Mi cuenta"}</div>
          <div className="truncate font-mono text-[10px] text-white/50">{planLabel}</div>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Cerrar sesion"
          className="rounded-lg p-1.5 text-white/50 transition-all hover:bg-white/[0.06] hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        aria-label="Abrir menu"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded bg-[var(--brand-navy)] shadow-lg lg:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: "linear-gradient(180deg, var(--brand-navy) 0%, var(--brand-navy-2) 100%)" }}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="sticky top-0 hidden h-screen w-[260px] flex-col lg:flex"
        style={{ background: "linear-gradient(180deg, var(--brand-navy) 0%, var(--brand-navy-2) 100%)" }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

function NavItem({ item, active, onNavigate }: { item: { num: string; label: string; href: string }; active: boolean; onNavigate: () => void }) {
  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
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
        {active && <span className="h-1 w-1 rounded-full bg-[var(--brand-gold)]" />}
      </Link>
    </li>
  );
}
