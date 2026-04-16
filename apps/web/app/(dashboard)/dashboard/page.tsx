import { createClient } from "@/lib/supabase/server";
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
import { DashboardClient } from "@/components/dashboard/dashboard-client";

const PLAN_LABELS: Record<Plan, string> = {
  free: "Gratis",
  profesional: "Profesional",
  estudio: "Estudio",
};

const PLAN_COLORS: Record<Plan, string> = {
  free: "bg-slate-100 text-slate-600",
  profesional: "bg-amber-100 text-amber-700",
  estudio: "bg-indigo-100 text-indigo-700",
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
  const escritosUsados = profile?.escritos_generados_mes ?? 0;
  const consultasUsadas = profile?.consultas_ia_mes ?? 0;

  const escritosPct =
    limits.escritos_mes === Infinity
      ? 0
      : Math.min(100, (escritosUsados / limits.escritos_mes) * 100);

  const consultasPct =
    limits.consultas_mes === Infinity
      ? 0
      : Math.min(100, (consultasUsadas / limits.consultas_mes) * 100);

  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <DashboardClient
      greeting={greeting}
      firstName={firstName}
      plan={plan}
      planLabel={PLAN_LABELS[plan]}
      planColor={PLAN_COLORS[plan]}
      escritosUsados={escritosUsados}
      consultasUsadas={consultasUsadas}
      escritosLimit={limits.escritos_mes}
      consultasLimit={limits.consultas_mes}
      escritosPct={escritosPct}
      consultasPct={consultasPct}
    />
  );
}
