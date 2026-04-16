"use client";

import { motion } from "framer-motion";
import {
  FileText,
  MessageSquare,
  FolderOpen,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Clock,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { Plan } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

interface DashboardClientProps {
  greeting: string;
  firstName: string;
  plan: Plan;
  planLabel: string;
  planColor: string;
  escritosUsados: number;
  consultasUsadas: number;
  escritosLimit: number;
  consultasLimit: number;
  escritosPct: number;
  consultasPct: number;
}

export function DashboardClient({
  greeting,
  firstName,
  plan,
  planLabel,
  planColor,
  escritosUsados,
  consultasUsadas,
  escritosLimit,
  consultasLimit,
  escritosPct,
  consultasPct,
}: DashboardClientProps) {
  return (
    <div className="space-y-8">
      {/* ── Welcome header ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <p className="text-sm font-medium text-slate-500">{greeting},</p>
          <h1 className="mt-0.5 heading-serif text-3xl text-[#0f172a]">
            {firstName || "abogado/a"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {new Date().toLocaleDateString("es-AR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        {plan === "free" && (
          <Link href="/config">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="group inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2.5 text-sm font-medium text-amber-700 shadow-sm transition-all hover:shadow-md hover:shadow-amber-100"
            >
              <Zap className="h-4 w-4" />
              Mejorar plan
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </motion.div>
          </Link>
        )}
      </motion.div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-3"
      >
        {/* Escritos */}
        <motion.div
          variants={fadeUp}
          custom={0}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-[0_8px_30px_rgba(59,130,246,0.08)] hover:border-blue-200/60"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-[0.06]"
          />
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 shadow-sm shadow-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              Este mes
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Escritos generados
            </p>
            <p className="mt-1 text-3xl font-extrabold text-[#0f172a]">
              {escritosUsados}
              <span className="ml-1 text-lg font-medium text-slate-400">
                / {escritosLimit === Infinity ? "\u221e" : escritosLimit}
              </span>
            </p>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${escritosPct}%` }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
            />
          </div>
        </motion.div>

        {/* Consultas IA */}
        <motion.div
          variants={fadeUp}
          custom={1}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.08)] hover:border-emerald-200/60"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-[0.06]"
          />
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 shadow-sm shadow-emerald-100">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <Sparkles className="h-3 w-3" />
              IA activa
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Consultas IA
            </p>
            <p className="mt-1 text-3xl font-extrabold text-[#0f172a]">
              {consultasUsadas}
              <span className="ml-1 text-lg font-medium text-slate-400">
                / {consultasLimit === Infinity ? "\u221e" : consultasLimit}
              </span>
            </p>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${consultasPct}%` }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
            />
          </div>
        </motion.div>

        {/* Plan */}
        <motion.div
          variants={fadeUp}
          custom={2}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-[0_8px_30px_rgba(217,119,6,0.08)] hover:border-amber-200/60"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-[0.06]"
          />
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 shadow-sm shadow-amber-100">
              <Zap className="h-5 w-5 text-amber-600" />
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${planColor}`}
            >
              {planLabel}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Tu plan
            </p>
            <p className="mt-1 text-3xl font-extrabold text-[#0f172a] capitalize">
              {planLabel}
            </p>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {plan === "free"
              ? "Upgrade para escritos ilimitados y consultas sin límite"
              : "Plan activo — todas las funciones disponibles"}
          </p>
        </motion.div>
      </motion.div>

      {/* ── Quick actions ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="mb-4 text-base font-bold text-[#0f172a]">Acciones rápidas</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              href: "/escritos",
              icon: FileText,
              bg: "bg-blue-600",
              hoverGlow: "group-hover:shadow-blue-500/10",
              title: "Generar escrito",
              desc: "Demandas, cartas documento, contestaciones y más",
              tag: "5 plantillas disponibles",
              tagColor: "text-blue-600",
            },
            {
              href: "/asistente",
              icon: MessageSquare,
              bg: "bg-emerald-600",
              hoverGlow: "group-hover:shadow-emerald-500/10",
              title: "Asistente IA",
              desc: "Consultá sobre legislación y jurisprudencia argentina",
              tag: "Con citas verificadas",
              tagColor: "text-emerald-600",
              sparkle: true,
            },
            {
              href: "/casos",
              icon: FolderOpen,
              bg: "bg-amber-600",
              hoverGlow: "group-hover:shadow-amber-500/10",
              title: "Mis casos",
              desc: "Gestioná tus expedientes y escritos vinculados",
              tag: "Mini CRM jurídico",
              tagColor: "text-amber-600",
            },
          ].map((item, i) => (
            <Link key={item.href} href={item.href}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.35 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
                className={`group flex h-full cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${item.hoverGlow}`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bg} shadow-lg shadow-slate-200`}
                  >
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-[#1e3a5f]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0f172a]">{item.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
                </div>
                <div
                  className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${item.tagColor}`}
                >
                  {item.sparkle && <Sparkles className="h-3 w-3" />}
                  {item.tag}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Recent activity ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0f172a]">Actividad reciente</h2>
          <Link
            href="/escritos/historial"
            className="text-xs font-medium text-[#1d4ed8] hover:underline"
          >
            Ver todo
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {escritosUsados === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                  <Clock className="h-6 w-6 text-slate-400" />
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-2 rounded-2xl opacity-20"
                  style={{
                    background: "radial-gradient(circle, #94a3b8, transparent)",
                  }}
                />
              </div>
              <div>
                <p className="font-semibold text-slate-700">
                  Todavía no generaste escritos
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Cuando generes tu primer escrito, va a aparecer acá.
                </p>
              </div>
              <Link href="/escritos">
                <button className="mt-2 rounded-xl bg-[#1e3a5f] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#1e3a5f]/20 transition-all hover:bg-[#1d4ed8] hover:shadow-xl">
                  Generar mi primer escrito
                </button>
              </Link>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Tus escritos recientes aparecerán acá.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
