import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowRight, History, Scale, Briefcase, Gavel } from "lucide-react";
import Link from "next/link";
import type { EscritoTemplate } from "@/types";

const FUERO_META: Record<
  string,
  { label: string; color: string; border: string; bg: string; icon: React.ElementType }
> = {
  laboral:   { label: "Laboral",   color: "text-blue-700",    border: "border-l-blue-500",    bg: "bg-blue-50",    icon: Briefcase },
  civil:     { label: "Civil",     color: "text-emerald-700", border: "border-l-emerald-500", bg: "bg-emerald-50", icon: Scale },
  comercial: { label: "Comercial", color: "text-violet-700",  border: "border-l-violet-500",  bg: "bg-violet-50",  icon: Gavel },
  penal:     { label: "Penal",     color: "text-red-700",     border: "border-l-red-500",     bg: "bg-red-50",     icon: Gavel },
  familia:   { label: "Familia",   color: "text-amber-700",   border: "border-l-amber-500",   bg: "bg-amber-50",   icon: Scale },
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

export default async function EscritosPage() {
  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("escrito_templates")
    .select("*")
    .eq("activo", true)
    .order("created_at");

  const typedTemplates = (templates as EscritoTemplate[] | null) ?? [];
  const fueros = [...new Set(typedTemplates.map((t) => t.fuero))];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0f172a]">
          Generar escrito
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Seleccioná el tipo de escrito. Lo generamos en formato procesal correcto para tu jurisdicción.
        </p>
      </div>

      {/* ── Filter tabs ─────────────────────────────────────── */}
      {fueros.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <span className="rounded-xl border border-[#1e3a5f] bg-[#1e3a5f] px-4 py-1.5 text-sm font-semibold text-white">
            Todos
          </span>
          {fueros.map((fuero) => {
            const meta = FUERO_META[fuero];
            return (
              <span
                key={fuero}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 transition-all hover:border-[#1e3a5f] hover:text-[#1e3a5f]"
              >
                {meta?.label ?? fuero}
              </span>
            );
          })}
        </div>
      )}

      {/* ── Template grid ───────────────────────────────────── */}
      {typedTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <FileText className="h-6 w-6 text-slate-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-700">Plantillas en camino</p>
            <p className="mt-1 text-sm text-slate-500">
              Pronto habrá plantillas disponibles. Volvé más tarde.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {typedTemplates.map((template, i) => {
            const meta = FUERO_META[template.fuero] ?? {
              label:  template.fuero,
              color:  "text-slate-700",
              border: "border-l-slate-400",
              bg:     "bg-slate-50",
              icon:   FileText,
            };
            const description =
              FUERO_DESCRIPTIONS[template.fuero] ??
              "Escrito judicial con formato procesal argentino correcto.";

            const delayClass = `delay-${(i % 4) * 100}`;

            return (
              <Link key={template.id} href={`/escritos/nuevo/${template.id}`}>
                <div
                  className={`card-hover animate-fade-in-up group flex h-full cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm border-l-4 ${meta.border} ${delayClass}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
                      <meta.icon className={`h-5 w-5 ${meta.color}`} />
                    </div>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-[#1e3a5f]" />
                  </div>

                  <h3 className="mt-4 text-base font-bold text-[#0f172a] leading-snug">
                    {template.nombre_display}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                    {description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`rounded-md text-[10px] font-semibold uppercase tracking-wide ${meta.bg} ${meta.color} border-0`}
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
            );
          })}
        </div>
      )}

      {/* ── History link ────────────────────────────────────── */}
      <Link href="/escritos/historial">
        <div className="card-hover group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <History className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="font-semibold text-[#0f172a]">Historial de escritos</p>
              <p className="text-xs text-slate-500">Ver todos los escritos que generaste</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-[#1e3a5f]" />
        </div>
      </Link>
    </div>
  );
}
