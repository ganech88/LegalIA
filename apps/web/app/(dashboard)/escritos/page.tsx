import { createClient } from "@/lib/supabase/server";
import { FileText, History } from "lucide-react";
import type { EscritoTemplate } from "@/types";
import { EscritosClient } from "@/components/escritos/escritos-client";

export default async function EscritosPage() {
  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("escrito_templates")
    .select("*")
    .eq("activo", true)
    .order("created_at");

  const typedTemplates = (templates as EscritoTemplate[] | null) ?? [];

  return <EscritosClient templates={typedTemplates} />;
}
