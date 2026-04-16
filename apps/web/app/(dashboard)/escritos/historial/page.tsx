import { createClient } from "@/lib/supabase/server";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/formatters";

export default async function HistorialPage() {
  const supabase = await createClient();
  const { data: escritos } = await supabase
    .from("escritos")
    .select("id, titulo, tipo, fuero, jurisdiccion, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Historial de escritos</h1>
        <p className="mt-1 text-slate-500">Tus escritos generados anteriormente</p>
      </div>

      {!escritos?.length ? (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <FileText className="h-6 w-6 text-slate-400" />
            </div>
            <CardTitle className="text-lg">No hay escritos todavía</CardTitle>
            <CardDescription>
              <Link href="/escritos" className="text-slate-900 hover:underline">
                Generá tu primer escrito
              </Link>
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {escritos.map((escrito) => (
            <Link key={escrito.id} href={`/escritos/${escrito.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{escrito.titulo}</CardTitle>
                    <span className="text-sm text-slate-500">
                      {formatDate(escrito.created_at)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{escrito.fuero}</Badge>
                    <Badge variant="outline">{escrito.jurisdiccion}</Badge>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
