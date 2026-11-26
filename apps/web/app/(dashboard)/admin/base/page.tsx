import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageShell } from "@/components/layout/page-shell";
import { NORMAS_INFOLEG } from "@/lib/legal/infoleg";
import { IngestaNormas } from "@/components/admin/ingesta-normas";

/** Base legal del asistente: qué normas están cargadas y carga de las que faltan (solo administradores). */
export const dynamic = "force-dynamic";

export default async function BaseLegalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();
  if (!user || !admin) notFound();
  const { data: yo } = await admin.from("profiles").select("es_admin").eq("id", user.id).maybeSingle();
  if (!(yo as { es_admin?: boolean } | null)?.es_admin) notFound();

  const normas = await Promise.all(
    NORMAS_INFOLEG.map(async (n) => {
      const { count } = await admin.from("legal_knowledge").select("id", { count: "exact", head: true }).eq("source_name", n.source_name);
      return { clave: n.clave, nombre: n.source_name, infolegId: n.infolegId, cargados: count ?? 0 };
    }),
  );
  const { count: total } = await admin.from("legal_knowledge").select("id", { count: "exact", head: true });

  return (
    <PageShell crumbs={[{ label: "Administración" }, { label: "Base legal" }]}>
      <header className="mb-8 border-b border-[var(--brand-navy)] pb-6">
        <div className="masthead-meta mb-2"><span>ADMINISTRACIÓN</span></div>
        <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-[var(--brand-navy)]">Base legal del asistente</h1>
        <p className="mt-2 max-w-[680px] text-[13px] text-[var(--brand-ink-2)]">
          {total ?? 0} artículos cargados. El asistente solo puede citar con certeza lo que está acá. «Probar» descarga la norma de InfoLeg y la revisa sin tocar la base; «Cargar» la reemplaza por el texto actualizado.
        </p>
      </header>
      <section className="card-editorial p-6">
        <IngestaNormas normas={normas} />
      </section>
    </PageShell>
  );
}
