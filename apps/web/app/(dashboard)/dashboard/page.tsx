import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/types";
import type { Plan } from "@/types";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

const PLAN_LABELS: Record<Plan, string> = {
  free: "Gratis",
  profesional: "Profesional",
  estudio: "Estudio",
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
  const fullName = profile?.full_name ?? "";
  const firstName = fullName.split(" ")[0] ?? "";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos dias" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  const { data: casos } = await supabase
    .from("casos")
    .select("id, caratula, expediente, fuero, jurisdiccion, juzgado, estado, updated_at")
    .eq("estado", "activo")
    .order("updated_at", { ascending: false })
    .limit(5);

  const { count: casosCount } = await supabase
    .from("casos")
    .select("*", { count: "exact", head: true })
    .eq("estado", "activo");

  const { data: recentEscritos } = await supabase
    .from("escritos")
    .select("id, titulo, tipo, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentConsultas } = await supabase
    .from("consultas_ia")
    .select("id, pregunta, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  type ActivityItem = { tipo: "escrito" | "consulta" | "caso"; texto: string; fecha: string };
  const activity: ActivityItem[] = [];

  if (recentEscritos) {
    for (const e of recentEscritos) {
      activity.push({ tipo: "escrito", texto: `Generaste escrito: ${e.titulo}`, fecha: e.created_at });
    }
  }
  if (recentConsultas) {
    for (const c of recentConsultas) {
      const preview = c.pregunta.length > 60 ? c.pregunta.slice(0, 60) + "..." : c.pregunta;
      activity.push({ tipo: "consulta", texto: `Consulta IA: ${preview}`, fecha: c.created_at });
    }
  }

  activity.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  const topActivity = activity.slice(0, 8);

  return (
    <DashboardClient
      greeting={greeting}
      firstName={firstName}
      plan={plan}
      planLabel={PLAN_LABELS[plan]}
      escritosUsados={escritosUsados}
      consultasUsadas={consultasUsadas}
      escritosLimit={limits.escritos_mes}
      consultasLimit={limits.consultas_mes}
      casosActivos={casosCount ?? 0}
      userName={fullName}
      casos={(casos ?? []).map(c => ({
        id: c.id,
        caratula: c.caratula,
        expediente: c.expediente,
        fuero: c.fuero,
        jurisdiccion: c.jurisdiccion,
        juzgado: c.juzgado,
        estado: c.estado,
      }))}
      actividad={topActivity}
    />
  );
}
