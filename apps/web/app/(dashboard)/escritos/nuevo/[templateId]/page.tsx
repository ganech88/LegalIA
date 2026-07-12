import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DynamicForm } from "@/components/escritos/dynamic-form";
import type { EscritoTemplate } from "@/types";

/**
 * Datos FICTICIOS para el modo demo (?demo=1): el abogado nuevo ve el
 * generador funcionando en 60 segundos sin cargar nada. Nombres inventados.
 */
const DEMO_DATA: Record<string, Record<string, string>> = {
  despido_sin_causa: {
    actor_nombre: "Juan Ejemplo Pérez",
    actor_dni: "28.555.123",
    actor_domicilio: "Av. Siempreviva 742, CABA",
    actor_domicilio_electronico: "20285551234@notificaciones.pjn.gov.ar",
    demandado_nombre: "Comercial Ficticia S.A.",
    demandado_cuit: "30-71234567-8",
    demandado_domicilio: "Av. Corrientes 1234, CABA",
    fecha_ingreso: "2019-03-11",
    fecha_despido: "2026-05-30",
    mejor_remuneracion: "1850000",
    categoria: "Vendedor B",
    cct: "CCT 130/75 (Empleados de Comercio)",
    jornada: "Completa, lunes a sábado",
    jurisdiccion: "CABA",
    hechos: "El actor trabajó más de 7 años como vendedor. El 30/05/2026 fue despedido sin causa mediante telegrama, sin abonarse la liquidación final ni entregarse los certificados del art. 80 LCT. Fue intimado fehacientemente por CD y la demandada no pagó.",
    rubros_reclamados: "Indemnización por antigüedad, preaviso, integración mes de despido, SAC y vacaciones proporcionales, art. 2 ley 25.323, multa art. 80 LCT",
  },
};

export default async function NuevoEscritoPage({
  params,
  searchParams,
}: {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{ demo?: string }>;
}) {
  const { templateId } = await params;
  const { demo } = await searchParams;
  const supabase = await createClient();

  const { data: template } = await supabase
    .from("escrito_templates")
    .select("*")
    .eq("id", templateId)
    .eq("activo", true)
    .single();

  if (!template) notFound();

  const typedTemplate = template as unknown as EscritoTemplate;
  const demoValues = demo === "1" ? DEMO_DATA[typedTemplate.subtipo ?? ""] : undefined;

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

      {demoValues && (
        <div className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
          <strong>Modo demostración:</strong> pre-cargamos un caso ficticio para que veas LegalIA
          en acción. Tocá <strong>Generar escrito</strong> tal cual está, o reemplazá los datos por los de tu caso.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Datos del caso</CardTitle>
          <CardDescription>
            Completá los datos para generar el escrito. Los campos con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicForm template={typedTemplate} initialValues={demoValues} />
        </CardContent>
      </Card>
    </div>
  );
}
