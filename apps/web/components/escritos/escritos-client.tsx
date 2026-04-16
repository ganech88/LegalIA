"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  ArrowRight,
  History,
  Scale,
  Briefcase,
  Gavel,
  PenTool,
} from "lucide-react";
import Link from "next/link";
import type { EscritoTemplate } from "@/types";

const FUERO_META: Record<
  string,
  {
    label: string;
    color: string;
    border: string;
    bg: string;
    glow: string;
    icon: React.ElementType;
  }
> = {
  laboral: {
    label: "Laboral",
    color: "text-blue-700",
    border: "border-l-blue-500",
    bg: "bg-blue-50",
    glow: "group-hover:shadow-blue-500/8",
    icon: Briefcase,
  },
  civil: {
    label: "Civil",
    color: "text-emerald-700",
    border: "border-l-emerald-500",
    bg: "bg-emerald-50",
    glow: "group-hover:shadow-emerald-500/8",
    icon: Scale,
  },
  comercial: {
    label: "Comercial",
    color: "text-violet-700",
    border: "border-l-violet-500",
    bg: "bg-violet-50",
    glow: "group-hover:shadow-violet-500/8",
    icon: Gavel,
  },
  penal: {
    label: "Penal",
    color: "text-red-700",
    border: "border-l-red-500",
    bg: "bg-red-50",
    glow: "group-hover:shadow-red-500/8",
    icon: Gavel,
  },
  familia: {
    label: "Familia",
    color: "text-amber-700",
    border: "border-l-amber-500",
    bg: "bg-amber-50",
    glow: "group-hover:shadow-amber-500/8",
    icon: Scale,
  },
};

const FUERO_DESCRIPTIONS: Record<string, string> = {
  laboral:
    "Demandas por despido, contestaciones, recursos y documentos de práctica laboral conforme LCT y CCTs.",
  civil:
    "Escritos para procesos civiles ordinarios y sumarísimos, conforme al CCCN y CPCCN.",
  comercial:
    "Documentos societarios, contratos y litigios comerciales. CCCN, Ley 19.550.",
  penal:
    "Recursos, presentaciones y escritos para fuero penal federal y provincial.",
  familia:
    "Alimentos, régimen comunicacional, divorcio y procesos de familia. Ley 26.994.",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

interface EscritosClientProps {
  templates: EscritoTemplate[];
}

export function EscritosClient({ templates }: EscritosClientProps) {
  const fueros = [...new Set(templates.map((t) => t.fuero))];

  return (
    <div className="space-y-8">
      {/* ── Header ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="heading-serif text-3xl text-[#0f172a]">
            Generar escrito
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Seleccioná el tipo de escrito. Lo generamos en formato procesal
            correcto para tu jurisdicción.
          </p>
        </div>
        <Link href="/escritos/personalizado">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="group hidden items-center gap-2 rounded-xl border border-[#d97706]/30 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 shadow-sm transition-all hover:shadow-md hover:shadow-amber-100 sm:inline-flex"
          >
            <PenTool className="h-4 w-4" />
            Escrito personalizado
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </motion.div>
        </Link>
      </motion.div>

      {/* ── Filter tabs ─────────────────────────────────────── */}
      {fueros.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-wrap gap-2"
        >
          <span className="rounded-xl border border-[#1e3a5f] bg-[#1e3a5f] px-4 py-1.5 text-sm font-semibold text-white shadow-sm shadow-[#1e3a5f]/10">
            Todos
          </span>
          {fueros.map((fuero) => {
            const meta = FUERO_META[fuero];
            return (
              <span
                key={fuero}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-[#1e3a5f] hover:text-[#1e3a5f] hover:shadow-md"
              >
                {meta?.label ?? fuero}
              </span>
            );
          })}
        </motion.div>
      )}

      {/* ── Template grid ───────────────────────────────────── */}
      {templates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <FileText className="h-7 w-7 text-slate-400" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-700">
              Plantillas en camino
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Pronto habrá plantillas disponibles. Volvé más tarde.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid gap-4 md:grid-cols-2"
        >
          {templates.map((template, i) => {
            const meta = FUERO_META[template.fuero] ?? {
              label: template.fuero,
              color: "text-slate-700",
              border: "border-l-slate-400",
              bg: "bg-slate-50",
              glow: "",
              icon: FileText,
            };
            const description =
              FUERO_DESCRIPTIONS[template.fuero] ??
              "Escrito judicial con formato procesal argentino correcto.";

            return (
              <motion.div key={template.id} variants={fadeUp} custom={i}>
                <Link href={`/escritos/nuevo/${template.id}`}>
                  <div
                    className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-l-4 ${meta.border} ${meta.glow}`}
                  >
                    {/* Subtle glow on hover */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-[0.05]"
                      style={{
                        background: meta.color.includes("blue")
                          ? "#1d4ed8"
                          : meta.color.includes("emerald")
                          ? "#059669"
                          : meta.color.includes("violet")
                          ? "#7c3aed"
                          : meta.color.includes("red")
                          ? "#dc2626"
                          : "#d97706",
                      }}
                    />
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.bg} shadow-sm transition-transform duration-300 group-hover:scale-110`}
                      >
                        <meta.icon className={`h-5 w-5 ${meta.color}`} />
                      </div>
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-[#1e3a5f]" />
                    </div>

                    <h3 className="mt-4 text-base font-bold leading-snug text-[#0f172a]">
                      {template.nombre_display}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                      {description}
                    </p>

                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                      <Badge
                        variant="secondary"
                        className={`rounded-md border-0 text-[10px] font-semibold uppercase tracking-wide ${meta.bg} ${meta.color}`}
                      >
                        {meta.label}
                      </Badge>
                      {template.jurisdiccion.map((j: string) => (
                        <Badge
                          key={j}
                          variant="outline"
                          className="rounded-md border-slate-200 text-[10px] font-medium text-slate-500"
                        >
                          {j}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── Custom + History links ──────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/escritos/personalizado" className="sm:hidden">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group flex cursor-pointer items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <PenTool className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">Escrito personalizado</p>
                <p className="text-xs text-amber-700/70">Cualquier tipo de escrito</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-amber-400 transition-all group-hover:translate-x-1 group-hover:text-amber-600" />
          </motion.div>
        </Link>

        <Link href="/escritos/historial" className="sm:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <History className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <p className="font-semibold text-[#0f172a]">
                  Historial de escritos
                </p>
                <p className="text-xs text-slate-500">
                  Ver todos los escritos que generaste
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-[#1e3a5f]" />
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
