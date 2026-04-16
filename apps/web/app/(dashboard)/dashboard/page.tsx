import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { PLAN_LIMITS } from "@/types";
import type { Plan } from "@/types";

const PLAN_LABELS: Record<Plan, string> = {
  free:         "Gratis",
  profesional:  "Profesional",
  estudio:      "Estudio",
};

const PLAN_COLORS: Record<Plan, string> = {
  free:         "bg-slate-100 text-slate-600",
  profesional:  "bg-amber-100 text-amber-700",
  estudio:      "bg-indigo-100 text-indigo-700",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const plan = (profile?.plan ?? "free") as Plan;
  const limits = PLAN_LIMITS[plan];
  const escritosUsados   = profile?.escritos_generados_mes ?? 0;
  const consultasUsadas  = profile?.consultas_ia_mes ?? 0;

  const escritosPct = limits.escritos_mes === Infinity
    ? 0
    : Math.min(100, (escritosUsados / limits.escritos_mes) * 100);

  const consultasPct = limits.consultas_mes === Infinity
    ? 0
    : Math.min(100, (consultasUsadas / limits.consultas_mes) * 100);

  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Welcome header ──────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{greeting},</p>
          <h1 className="mt-0.5 text-3xl font-extrabold tracking-tight text-[#0f172a]">
            {firstName || "abogado/a"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {new Date().toLocaleDateString("es-AR", {
              weekday: "long",
              year:    "numeric",
              month:   "long",
              day:     "numeric",
            })}
          </p>
        </div>
        {plan === "free" && (
          <Link href="/config">
            <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 transition-all hover:bg-amber-100">
              <Zap className="h-4 w-4" />
              Mejorar plan
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        )}
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Escritos */}
        <div className="animate-fade-in-up delay-100 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
              <FileText className="h-4.5 w-4.5 text-blue-600" style={{ width: "1.125rem", height: "1.125rem" }} />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              Este mes
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Escritos generados
            </p>
            <p className="mt-1 text-3xl font-extrabold text-[#0f172a]">
              {escritosUsados}
              <span className="ml-1 text-lg font-medium text-slate-400">
                / {limits.escritos_mes === Infinity ? "∞" : limits.escritos_mes}
              </span>
            </p>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="progress-animated h-full rounded-full bg-blue-500 transition-all"
              style={
                {
                  "--progress-width": `${escritosPct}%`,
                  width: `${escritosPct}%`,
                } as React.CSSProperties
              }
            />
          </div>
        </div>

        {/* Consultas IA */}
        <div className="animate-fade-in-up delay-200 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
              <MessageSquare className="h-4.5 w-4.5 text-emerald-600" style={{ width: "1.125rem", height: "1.125rem" }} />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <Sparkles className="h-3 w-3" />
              IA activa
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Consultas IA
            </p>
            <p className="mt-1 text-3xl font-extrabold text-[#0f172a]">
              {consultasUsadas}
              <span className="ml-1 text-lg font-medium text-slate-400">
                / {limits.consultas_mes === Infinity ? "∞" : limits.consultas_mes}
              </span>
            </p>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="progress-animated h-full rounded-full bg-emerald-500 transition-all"
              style={
                {
                  "--progress-width": `${consultasPct}%`,
                  width: `${consultasPct}%`,
                } as React.CSSProperties
              }
            />
          </div>
        </div>

        {/* Plan */}
        <div className="animate-fade-in-up delay-300 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
              <Zap className="h-4.5 w-4.5 text-amber-600" style={{ width: "1.125rem", height: "1.125rem" }} />
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${PLAN_COLORS[plan]}`}>
              {PLAN_LABELS[plan]}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tu plan
            </p>
            <p className="mt-1 text-3xl font-extrabold text-[#0f172a] capitalize">
              {PLAN_LABELS[plan]}
            </p>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {plan === "free"
              ? "Upgrade para escritos ilimitados y consultas sin límite"
              : "Plan activo — todas las funciones disponibles"}
          </p>
        </div>
      </div>

      {/* ── Quick actions ────────────────────────────────────── */}
      <div>
        <h2 className="mb-4 text-base font-bold text-[#0f172a]">Acciones rápidas</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/escritos">
            <div className="card-hover animate-fade-in-up delay-100 group flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-[#1e3a5f]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a]">Generar escrito</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Demandas, cartas documento, contestaciones y más
                </p>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                5 plantillas disponibles
              </div>
            </div>
          </Link>

          <Link href="/asistente">
            <div className="card-hover animate-fade-in-up delay-200 group flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-[#1e3a5f]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a]">Asistente IA</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Consultá sobre legislación y jurisprudencia argentina
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                <Sparkles className="h-3 w-3" />
                Con citas verificadas
              </div>
            </div>
          </Link>

          <Link href="/casos">
            <div className="card-hover animate-fade-in-up delay-300 group flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600">
                  <FolderOpen className="h-5 w-5 text-white" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-[#1e3a5f]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a]">Mis casos</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Gestioná tus expedientes y escritos vinculados
                </p>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                Mini CRM jurídico
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Recent activity placeholder ──────────────────────── */}
      <div className="animate-fade-in-up delay-400">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#0f172a]">Actividad reciente</h2>
          <Link href="/escritos/historial" className="text-xs font-medium text-[#1d4ed8] hover:underline">
            Ver todo
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {escritosUsados === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Clock className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="font-medium text-slate-700">Todavía no generaste escritos</p>
                <p className="mt-1 text-sm text-slate-400">
                  Cuando generes tu primer escrito, va a aparecer acá.
                </p>
              </div>
              <Link href="/escritos">
                <button className="mt-2 rounded-xl bg-[#1e3a5f] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#1d4ed8]">
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
      </div>
    </div>
  );
}
