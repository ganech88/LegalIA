import { createClient } from "@/lib/supabase/server";
import type { Caso } from "@/types";
import { CasosClient } from "@/components/casos/casos-client";

export default async function CasosPage() {
  const supabase = await createClient();
  const { data: casos } = await supabase
    .from("casos")
    .select("*")
    .order("updated_at", { ascending: false });

  return (
    <div className="bg-paper-rules min-h-screen">
      {/* Topbar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <span>Workspace</span>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Casos</span>
        </nav>
      </header>
      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
        <CasosClient initialCasos={(casos as Caso[]) ?? []} />
      </div>
    </div>
  );
}
