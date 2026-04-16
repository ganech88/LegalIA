import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, FolderOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PLAN_LIMITS } from "@/types";
import type { Plan } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const plan = (profile?.plan ?? "free") as Plan;
  const limits = PLAN_LIMITS[plan];
  const escritosUsados = profile?.escritos_generados_mes ?? 0;
  const consultasUsadas = profile?.consultas_ia_mes ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Hola, {profile?.full_name || ""}
        </h1>
        <p className="mt-1 text-slate-500">
          Bienvenido a LegalIA — tu asistente legal con inteligencia artificial
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Escritos este mes</CardDescription>
            <CardTitle className="text-2xl">
              {escritosUsados} / {limits.escritos_mes === Infinity ? "∞" : limits.escritos_mes}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-slate-900 transition-all"
                style={{
                  width: `${Math.min(100, (escritosUsados / (limits.escritos_mes === Infinity ? 100 : limits.escritos_mes)) * 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Consultas IA este mes</CardDescription>
            <CardTitle className="text-2xl">
              {consultasUsadas} / {limits.consultas_mes === Infinity ? "∞" : limits.consultas_mes}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-slate-900 transition-all"
                style={{
                  width: `${Math.min(100, (consultasUsadas / (limits.consultas_mes === Infinity ? 100 : limits.consultas_mes)) * 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Plan actual</CardDescription>
            <CardTitle className="text-2xl capitalize">{plan}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              {plan === "free" ? "Actualizá para más escritos y consultas" : "Plan activo"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="group hover:shadow-md transition-shadow">
          <Link href="/escritos">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>
              <CardTitle className="text-lg">Generar escrito</CardTitle>
              <CardDescription>
                Demandas, cartas documento, contestaciones y más
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="group hover:shadow-md transition-shadow">
          <Link href="/asistente">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>
              <CardTitle className="text-lg">Asistente IA</CardTitle>
              <CardDescription>
                Consultá sobre legislación y jurisprudencia argentina
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="group hover:shadow-md transition-shadow">
          <Link href="/casos">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                  <FolderOpen className="h-5 w-5 text-amber-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>
              <CardTitle className="text-lg">Mis casos</CardTitle>
              <CardDescription>
                Gestioná tus expedientes y escritos vinculados
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  );
}
