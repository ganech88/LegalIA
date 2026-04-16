import { createClient } from "@/lib/supabase/server";
import type { Caso } from "@/types";
import { CasosClient } from "@/components/casos/casos-client";

export default async function CasosPage() {
  const supabase = await createClient();
  const { data: casos } = await supabase
    .from("casos")
    .select("*")
    .order("updated_at", { ascending: false });

  return <CasosClient initialCasos={(casos as Caso[]) ?? []} />;
}
