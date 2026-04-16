"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
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
  { href: "/dashboard", label: "Inicio", icon: Scale },
  { href: "/escritos", label: "Escritos", icon: FileText },
  { href: "/asistente", label: "Asistente IA", icon: MessageSquare },
  { href: "/casos", label: "Casos", icon: FolderOpen },
  { href: "/config", label: "Configuración", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const NavLink = ({ item }: { item: (typeof NAV_ITEMS)[number] }) => {
    const isActive =
      pathname === item.href || pathname.startsWith(item.href + "/");

    return (
      <Link
        href={item.href}
        onClick={() => setOpen(false)}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl py-2.5 px-3 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-white/[0.08] text-white"
            : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-[#d97706]"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
        <item.icon
          className={cn(
            "h-[1.125rem] w-[1.125rem] shrink-0 transition-colors",
            isActive
              ? "text-[#fbbf24]"
              : "text-slate-500 group-hover:text-slate-300"
          )}
        />
        {item.label}
        {item.href === "/asistente" && (
          <span className="ml-auto flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-[#fbbf24] opacity-70" />
          </span>
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5 border-b border-white/[0.06]">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e3a5f] shadow-lg shadow-[#1e3a5f]/30">
          <Scale className="h-4 w-4 text-white" />
          <div
            aria-hidden
            className="absolute inset-0 rounded-lg opacity-50"
            style={{
              background:
                "conic-gradient(from 0deg, transparent, rgba(212,160,40,0.15), transparent)",
              animation: "spin 20s linear infinite",
            }}
          />
        </div>
        <span className="text-lg font-bold text-white">
          Legal<span className="text-[#fbbf24]">IA</span>
        </span>
        <span className="ml-auto rounded-md bg-[#d97706]/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#fbbf24]">
          Beta
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
          Herramientas
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.slice(0, 4).map((item) => (
            <li key={item.href}>
              <NavLink item={item} />
            </li>
          ))}
        </ul>

        <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
          Cuenta
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.slice(4).map((item) => (
            <li key={item.href}>
              <NavLink item={item} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="shrink-0 space-y-3 p-4 border-t border-white/[0.06]">
        <div className="rounded-xl bg-white/[0.04] p-3 backdrop-blur-sm">
          <p className="text-[10px] leading-relaxed text-slate-500">
            LegalIA es una herramienta de asistencia. El abogado es responsable
            de revisar todo contenido generado antes de su presentación.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#1d4ed8] text-xs font-bold text-white shadow-lg">
            AB
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-slate-300">
              Mi cuenta
            </div>
            <div className="text-[10px] text-slate-500">Plan Gratis</div>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="rounded-lg p-1.5 text-slate-500 transition-all hover:bg-white/[0.06] hover:text-slate-300"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        aria-label="Abrir menú"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f172a] shadow-lg shadow-black/20 md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <X className="h-5 w-5 text-white" />
        ) : (
          <Menu className="h-5 w-5 text-white" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background: "linear-gradient(180deg, #0a0f1e 0%, #0f172a 50%, #111827 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col md:flex"
        style={{
          background: "linear-gradient(180deg, #0a0f1e 0%, #0f172a 50%, #111827 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
