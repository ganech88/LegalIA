import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { EscritoTemplate } from "@/types";
import { EscritosClient } from "@/components/escritos/escritos-client";

export default async function EscritosPage({
  searchParams,
}: {
  searchParams: Promise<{ subtipo?: string; caso?: string }>;
}) {
  const supabase = await createClient();
  const { subtipo, caso } = await searchParams;
  const casoId = caso && /^[0-9a-f-]{36}$/i.test(caso) ? caso : undefined;
  const { data: templates } = await supabase
    .from("escrito_templates")
    .select("*")
    .eq("activo", true)
    .order("created_at");

  const typedTemplates = (templates as EscritoTemplate[] | null) ?? [];

  // Atajo desde las calculadoras: /escritos?subtipo=despido_sin_causa abre
  // directamente la plantilla (con el prellenado en sessionStorage).
  if (subtipo) {
    const t = typedTemplates.find((x) => x.subtipo === subtipo);
    if (t) redirect(`/escritos/nuevo/${t.id}${casoId ? `?caso=${casoId}` : ""}`);
  }

  return <EscritosClient templates={typedTemplates} casoId={casoId} />;
}
