import { createClient } from "@/lib/supabase/server";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { EscritoTemplate } from "@/types";

const FUERO_COLORS: Record<string, string> = {
  laboral: "bg-blue-50 text-blue-700",
  civil: "bg-green-50 text-green-700",
  comercial: "bg-purple-50 text-purple-700",
  penal: "bg-red-50 text-red-700",
  familia: "bg-amber-50 text-amber-700",
};

export default async function EscritosPage() {
  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("escrito_templates")
    .select("*")
    .eq("activo", true)
    .order("created_at");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Generar escrito</h1>
        <p className="mt-1 text-slate-500">
          Seleccioná el tipo de escrito que necesitás generar
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(templates as EscritoTemplate[] | null)?.map((template) => (
          <Link key={template.id} href={`/escritos/nuevo/${template.id}`}>
            <Card className="group hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <FileText className="h-5 w-5 text-slate-600" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
                <CardTitle className="text-lg">{template.nombre_display}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant="secondary" className={FUERO_COLORS[template.fuero] || ""}>
                    {template.fuero}
                  </Badge>
                  {template.jurisdiccion.map((j: string) => (
                    <Badge key={j} variant="outline" className="text-xs">
                      {j}
                    </Badge>
                  ))}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="border-t pt-6">
        <Link href="/escritos/historial">
          <Card className="group hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Ver historial de escritos generados
                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
