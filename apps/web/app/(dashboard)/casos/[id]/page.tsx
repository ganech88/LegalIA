import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { CasoTimeline } from "@/components/casos/caso-timeline";
import { PortalToggle } from "@/components/casos/portal-toggle";
import { CasoNotas } from "@/components/casos/caso-notas";
import { CasoDocumentos } from "@/components/casos/caso-documentos";
import { Badge } from "@/components/ui/badge";
import type { Caso } from "@/types";

const ESTADO: Record<string, string> = { activo: "Activo", archivado: "Archivado", finalizado: "Finalizado" };

/**
 * Detalle del caso — el "expediente vivo" en una sola pantalla: datos, partes,
 * portal del cliente, timeline de escritos y plazos, notas cronológicas y
 * documentos adjuntos, con acciones que ya vienen vinculadas al caso.
 */
export default async function CasoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();

  const [{ data: caso }, { data: notas }, { data: docs }, { data: { user } }] = await Promise.all([
    supabase.from("casos").select("*").eq("id", id).maybeSingle(),
    supabase.from("caso_notas").select("id, contenido, created_at, user_id").eq("caso_id", id).order("created_at", { ascending: false }).limit(100),
    supabase.from("caso_documentos").select("id, nombre, storage_path, mime, bytes, created_at, user_id").eq("caso_id", id).order("created_at", { ascending: false }).limit(100),
    supabase.auth.getUser(),
  ]);
  if (!caso) notFound();
  const c = caso as Caso & { portal_token?: string | null; portal_habilitado?: boolean };

  return (
    <PageShell crumbs={[{ label: "Casos", href: "/casos" }, { label: c.caratula.slice(0, 60) }]}>
      <header className="mb-6 border-b border-[var(--brand-navy)] pb-5">
        <div className="masthead-meta mb-2"><span>EXPEDIENTE</span><span>{ESTADO[c.estado] ?? c.estado}</span></div>
        <h1 className="font-[var(--font-display)] text-[clamp(1.5rem,3vw,2.1rem)] font-semibold leading-tight tracking-[-0.02em] text-[var(--brand-navy)]">
          {c.caratula}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {c.expediente && <Badge variant="outline">Exp. {c.expediente}</Badge>}
          <Badge variant="secondary">{c.fuero}</Badge>
          <Badge variant="outline">{c.jurisdiccion}</Badge>
          {c.juzgado && <Badge variant="outline">{c.juzgado}</Badge>}
        </div>
        {(c.cliente_nombre || c.contraparte_nombre) && (
          <p className="mt-2 text-[13px] text-[var(--brand-ink-2)]">
            <strong>{c.cliente_nombre ?? "—"}</strong> c/ <strong>{c.contraparte_nombre ?? "—"}</strong>
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/escritos?caso=${c.id}`} className="rounded bg-[var(--brand-navy)] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[var(--brand-navy-2)]">
            + Generar escrito para este caso
          </Link>
          <Link href={`/agenda?caso=${c.id}`} className="rounded border border-[var(--brand-navy)] px-3 py-1.5 text-[12px] font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-paper-2)]">
            + Agendar plazo
          </Link>
          <Link href={`/agenda/cedula`} className="rounded border border-border px-3 py-1.5 text-[12px] font-semibold text-[var(--brand-ink-2)] hover:border-[var(--brand-gold)]">
            Subir cédula
          </Link>
          <Link href={`/casos`} className="rounded border border-border px-3 py-1.5 text-[12px] font-semibold text-[var(--brand-ink-2)] hover:border-[var(--brand-gold)]">
            Editar datos
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="card-editorial p-5">
            <CasoTimeline casoId={c.id} />
          </section>
          <section className="card-editorial p-5">
            <CasoNotas casoId={c.id} userId={user?.id ?? ""} initial={(notas ?? []) as { id: string; contenido: string; created_at: string; user_id: string }[]} />
          </section>
        </div>
        <div className="space-y-6">
          <section className="card-editorial p-5">
            <h2 className="mb-1 font-[var(--font-display)] text-[15px] font-semibold text-[var(--brand-navy)]">Portal del cliente</h2>
            <PortalToggle casoId={c.id} initialToken={c.portal_token ?? null} initialHabilitado={Boolean(c.portal_habilitado)} />
          </section>
          <section className="card-editorial p-5">
            <CasoDocumentos casoId={c.id} userId={user?.id ?? ""} initial={(docs ?? []) as { id: string; nombre: string; storage_path: string; mime: string | null; bytes: number | null; created_at: string; user_id: string }[]} />
          </section>
          {c.notas && (
            <section className="card-editorial p-5">
              <h2 className="mb-2 font-[var(--font-display)] text-[15px] font-semibold text-[var(--brand-navy)]">Observaciones</h2>
              <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--brand-ink-2)]">{c.notas}</p>
            </section>
          )}
        </div>
      </div>
    </PageShell>
  );
}
