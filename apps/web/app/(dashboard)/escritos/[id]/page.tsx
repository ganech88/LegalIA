import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EscritoEditor } from "@/components/escritos/editor";

export default async function EscritoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: escrito } = await supabase
    .from("escritos")
    .select("*")
    .eq("id", id)
    .single();

  if (!escrito) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">{escrito.titulo}</h1>
      <EscritoEditor escrito={escrito} />
    </div>
  );
}
