"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  Scale,
  FileText,
  MessageSquare,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Inicio",        icon: Scale },
  { href: "/escritos",  label: "Escritos",       icon: FileText },
  { href: "/asistente", label: "Asistente IA",   icon: MessageSquare },
  { href: "/casos",     label: "Casos",          icon: FolderOpen },
  { href: "/config",    label: "Configuración",  icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();
  const [open, setOpen]   = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const NavLink = ({ item }: { item: (typeof NAV_ITEMS)[number] }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

    return (
      <Link
        href={item.href}
        onClick={() => setOpen(false)}
        className={cn(
          "group relative flex items-center gap-3 rounded-r-xl py-2.5 pr-3 text-sm font-medium transition-all duration-200",
          isActive
            ? "nav-active bg-[#1e3a5f]/60 text-white"
            : "pl-3 text-slate-400 hover:bg-[#1e3a5f]/40 hover:text-slate-200"
        )}
      >
        <item.icon
          className={cn(
            "h-4.5 w-4.5 shrink-0 transition-colors",
            isActive ? "text-[#fbbf24]" : "text-slate-500 group-hover:text-slate-300"
          )}
          style={{ width: "1.125rem", height: "1.125rem" }}
        />
        {item.label}
        {item.href === "/asistente" && (
          <Sparkles
            className="ml-auto h-3 w-3 text-[#fbbf24] opacity-70"
            aria-label="IA"
          />
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        aria-label="Abrir menú"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f172a] shadow-lg md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r transition-transform duration-300 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
          borderColor: "rgba(255,255,255,0.07)",
        }}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-2.5 px-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e3a5f]">
            <Scale className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">
            Legal<span className="text-[#fbbf24]">IA</span>
          </span>
          <span className="ml-auto rounded-md bg-[#d97706]/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#fbbf24]">
            Beta
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            Herramientas
          </p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.slice(0, 4).map((item) => (
              <li key={item.href}>
                <NavLink item={item} />
              </li>
            ))}
          </ul>

          <p className="mb-2 mt-6 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            Cuenta
          </p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.slice(4).map((item) => (
              <li key={item.href}>
                <NavLink item={item} />
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="shrink-0 p-4 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Legal disclaimer */}
          <div className="rounded-lg bg-[#1e3a5f]/30 p-3">
            <p className="text-[10px] leading-relaxed text-slate-500">
              LegalIA es una herramienta de asistencia. El abogado es responsable de revisar todo contenido generado antes de su presentación.
            </p>
          </div>

          {/* User row + logout */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-xs font-bold text-white">
              AB
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-slate-300">Mi cuenta</div>
              <div className="text-[10px] text-slate-500">Plan Gratis</div>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-[#1e3a5f]/40 hover:text-slate-300"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
