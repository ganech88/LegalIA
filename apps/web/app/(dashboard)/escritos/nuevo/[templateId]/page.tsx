import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DynamicForm } from "@/components/escritos/dynamic-form";
import type { EscritoTemplate } from "@/types";

export default async function NuevoEscritoPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const supabase = await createClient();

  const { data: template } = await supabase
    .from("escrito_templates")
    .select("*")
    .eq("id", templateId)
    .eq("activo", true)
    .single();

  if (!template) notFound();

  const typedTemplate = template as unknown as EscritoTemplate;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {typedTemplate.nombre_display}
        </h1>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="secondary">{typedTemplate.fuero}</Badge>
          {typedTemplate.jurisdiccion.map((j) => (
            <Badge key={j} variant="outline">{j}</Badge>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del caso</CardTitle>
          <CardDescription>
            Completá los datos para generar el escrito. Los campos con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicForm template={typedTemplate} />
        </CardContent>
      </Card>
    </div>
  );
}
