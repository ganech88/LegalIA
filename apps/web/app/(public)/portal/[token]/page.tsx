import { createAdminClient } from "@/lib/supabase/admin";
import { PoweredBy } from "@/components/layout/powered-by";
import { CalendarClock, CheckCircle2, FileText, Scale } from "lucide-react";

/**
 * Portal del cliente: el abogado comparte un link por caso (token no
 * adivinable) y su cliente ve el estado en lenguaje claro, sin cuenta.
 * Mata el "¿cómo va mi juicio?" telefónico y pone la marca del estudio
 * (y de LegalIA) frente al cliente final.
 *
 * Privacidad: solo se muestra si portal_habilitado = true; datos mínimos.
 */

export const dynamic = "force-dynamic";

const ESTADOS: Record<string, { label: string; explicacion: string }> = {
  activo: { label: "En trámite", explicacion: "Tu caso está activo y en movimiento. Tu abogado está trabajando en las próximas presentaciones." },
  archivado: { label: "Archivado", explicacion: "El caso se encuentra archivado. Consultá a tu abogado por los detalles." },
  finalizado: { label: "Finalizado", explicacion: "El caso concluyó. Consultá a tu abogado por los pasos posteriores si los hubiera." },
};

export default async function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();

  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  let caso: {
    id: string; caratula: string; estado: string; fuero: string; jurisdiccion: string;
    juzgado: string | null; expediente: string | null; user_id: string; updated_at: string;
  } | null = null;

  if (admin && uuidRe.test(token)) {
    const { data } = await admin
      .from("casos")
      .select("id, caratula, estado, fuero, jurisdiccion, juzgado, expediente, user_id, updated_at")
      .eq("portal_token", token)
      .eq("portal_habilitado", true)
      .maybeSingle();
    caso = data;
  }

  if (!caso || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--brand-paper)] p-6">
        <div className="max-w-[420px] text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded bg-[var(--brand-navy)] font-serif text-2xl font-bold italic text-[var(--brand-gold)]">L</div>
          <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--brand-navy)]">Enlace no disponible</h1>
          <p className="mt-2 text-[13.5px] text-[var(--brand-mute)]">
            Este enlace no existe o el acceso fue desactivado. Consultá a tu abogado para obtener uno nuevo.
          </p>
        </div>
      </div>
    );
  }

  const hoy = new Date().toISOString().slice(0, 10);
  const [{ data: vencimientos }, { data: escritos }, { data: abogado }] = await Promise.all([
    admin
      .from("vencimientos")
      .select("titulo, fecha_vencimiento, estado, tipo")
      .eq("caso_id", caso.id)
      .order("fecha_vencimiento", { ascending: true })
      .limit(20),
    admin
      .from("escritos")
      .select("titulo, created_at")
      .eq("caso_id", caso.id)
      .order("created_at", { ascending: false })
      .limit(10),
    admin
      .from("profiles")
      .select("full_name, estudio_nombre, matricula, colegio_abogados")
      .eq("id", caso.user_id)
      .maybeSingle(),
  ]);

  const proximos = (vencimientos ?? []).filter((v) => v.estado === "pendiente" && v.fecha_vencimiento >= hoy);
  const cumplidos = (vencimientos ?? []).filter((v) => v.estado === "cumplido");
  const estadoInfo = ESTADOS[caso.estado] ?? ESTADOS.activo;
  const estudio = abogado?.estudio_nombre || abogado?.full_name || "Tu estudio jurídico";
  const fmt = (iso: string) => iso.slice(0, 10).split("-").reverse().join("/");

  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="border-b border-border bg-[rgba(250,250,247,0.9)] px-4 py-4 md:px-10">
        <div className="mx-auto flex max-w-[760px] items-center justify-between">
          <div>
            <p className="font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)]">{estudio}</p>
            {abogado?.full_name && abogado?.estudio_nombre && (
              <p className="text-[11px] text-[var(--brand-mute)]">
                {abogado.full_name}{abogado.matricula ? ` · Mat. ${abogado.matricula}` : ""}{abogado.colegio_abogados ? ` · ${abogado.colegio_abogados}` : ""}
              </p>
            )}
          </div>
          <span className="rounded-full border border-[var(--brand-gold)]/50 bg-[var(--brand-gold)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--brand-navy)]">
            Portal del cliente
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[760px] px-4 py-8 md:px-6 md:py-10">
        <div className="masthead-meta mb-2"><span>ESTADO DE TU CASO</span></div>
        <h1 className="font-[var(--font-display)] text-[clamp(1.4rem,3vw,1.9rem)] font-semibold leading-tight tracking-[-0.02em] text-[var(--brand-navy)]">
          {caso.caratula}
        </h1>
        <p className="mt-1 text-[12px] text-[var(--brand-mute)]">
          {caso.expediente ? `Expediente ${caso.expediente} · ` : ""}{caso.juzgado ?? ""} {caso.jurisdiccion ? `· ${caso.jurisdiccion}` : ""}
        </p>

        <div className="mt-5 rounded border border-border bg-white p-5">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-[var(--brand-gold)]" />
            <span className="text-[14px] font-bold text-[var(--brand-navy)]">{estadoInfo.label}</span>
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--brand-ink-2)]">{estadoInfo.explicacion}</p>
        </div>

        {proximos.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-[var(--brand-navy)]">Próximas fechas importantes</h2>
            <div className="space-y-2">
              {proximos.map((v, i) => (
                <div key={i} className="flex items-center gap-3 rounded border border-border bg-white px-4 py-3">
                  <CalendarClock className="h-4 w-4 shrink-0 text-[var(--brand-gold)]" />
                  <div>
                    <p className="text-[13px] font-medium text-[var(--brand-ink)]">{v.titulo}</p>
                    <p className="text-[11px] text-[var(--brand-mute)]">{fmt(v.fecha_vencimiento)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(escritos ?? []).length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-[var(--brand-navy)]">Trabajo realizado</h2>
            <div className="space-y-1.5">
              {(escritos ?? []).map((e, i) => (
                <div key={i} className="flex items-center gap-3 rounded border border-border bg-white px-4 py-2.5">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--brand-mute)]" />
                  <p className="text-[12.5px] text-[var(--brand-ink-2)]">{e.titulo}</p>
                </div>
              ))}
              {cumplidos.length > 0 && (
                <div className="flex items-center gap-3 rounded border border-border bg-white px-4 py-2.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <p className="text-[12.5px] text-[var(--brand-ink-2)]">{cumplidos.length} gestión(es) procesal(es) ya cumplida(s)</p>
                </div>
              )}
            </div>
          </section>
        )}

        <p className="mt-8 rounded border border-border bg-[var(--brand-paper-2)] px-4 py-3 text-[11.5px] leading-relaxed text-[var(--brand-mute)]">
          Esta página es informativa y la actualiza tu abogado. Ante cualquier duda sobre tu caso,
          contactalo directamente. Última actualización del caso: {fmt(caso.updated_at)}.
        </p>

        <footer className="mt-8 flex items-center justify-between border-t border-border pt-5">
          <PoweredBy />
          <p className="text-[10.5px] text-[var(--brand-mute)]">Hecho con LegalIA · legaliapp.com</p>
        </footer>
      </main>
    </div>
  );
}
