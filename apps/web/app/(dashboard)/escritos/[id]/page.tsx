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
    <div className="bg-paper-rules min-h-screen">
      <header className="sticky top-0 z-20 flex items-center border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <span>Workspace</span>
          <span className="opacity-40">/</span>
          <span>Escritos</span>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Editor</span>
        </nav>
      </header>
      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
        <EscritoEditor escrito={escrito} />
      </div>
    </div>
  );
}
