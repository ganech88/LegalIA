import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageShell } from "@/components/layout/page-shell";
import { consumoDesde } from "@/lib/ai/consumo";

/**
 * Panel de consumo de IA (solo administradores: profiles.es_admin).
 * Costos ESTIMADOS: tokens por largo de texto × precio de lista.
 */

export const dynamic = "force-dynamic";

const usd = (n: number) => `US$ ${n.toFixed(n < 1 ? 3 : 2)}`;
const miles = (n: number) => new Intl.NumberFormat("es-AR").format(Math.round(n));

export default async function ConsumoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();
  if (!user || !admin) notFound();
  const { data: yo } = await admin.from("profiles").select("es_admin").eq("id", user.id).maybeSingle();
  if (!(yo as { es_admin?: boolean } | null)?.es_admin) notFound();

  const ahora = new Date();
  const hoy = new Date(ahora); hoy.setUTCHours(0, 0, 0, 0);
  const hace7 = new Date(hoy.getTime() - 6 * 86400000);
  const hace30 = new Date(hoy.getTime() - 29 * 86400000);

  const mes = await consumoDesde(admin, hace30.toISOString());
  const dias = Object.entries(mes.porDia).sort(([a], [b]) => b.localeCompare(a));
  const usdHoy = mes.porDia[hoy.toISOString().slice(0, 10)] ?? 0;
  const usd7 = dias.filter(([d]) => d >= hace7.toISOString().slice(0, 10)).reduce((a, [, v]) => a + v, 0);

  const ids = mes.porUsuario.slice(0, 25).map((u) => u.user_id);
  const { data: perfiles } = ids.length
    ? await admin.from("profiles").select("id, full_name, plan").in("id", ids)
    : { data: [] as { id: string; full_name: string | null; plan: string | null }[] };
  const perfil = new Map((perfiles ?? []).map((p) => [p.id, p]));

  const { data: fallos } = await admin
    .from("consultas_ia")
    .select("proveedores_fallidos, created_at")
    .not("proveedores_fallidos", "is", null)
    .gte("created_at", hace7.toISOString())
    .order("created_at", { ascending: false })
    .limit(200);
  const fallosPorProveedor: Record<string, { n: number; ultimo: string }> = {};
  for (const f of fallos ?? []) {
    for (const x of (f.proveedores_fallidos as { provider: string; error: string }[]) ?? []) {
      fallosPorProveedor[x.provider] ??= { n: 0, ultimo: x.error };
      fallosPorProveedor[x.provider].n++;
    }
  }

  const th = "py-2 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--brand-mute)]";
  const td = "py-2 text-[13px]";

  return (
    <PageShell crumbs={[{ label: "Administración" }, { label: "Consumo de IA" }]}>
      <header className="mb-8 border-b border-[var(--brand-navy)] pb-6">
        <div className="masthead-meta mb-2"><span>ADMINISTRACIÓN</span></div>
        <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-[var(--brand-navy)]">Consumo de IA</h1>
        <p className="mt-2 max-w-[680px] text-[13px] text-[var(--brand-ink-2)]">
          Costo estimado (tokens por largo de texto × precio de lista). Los modelos gratuitos figuran en US$ 0. Para la cifra exacta, la consola de cada proveedor.
        </p>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ["Hoy", usd(usdHoy)],
          ["Últimos 7 días", usd(usd7)],
          ["Últimos 30 días", usd(mes.usd)],
          ["Usos en 30 días", `${miles(mes.consultas)} consultas · ${miles(mes.escritos)} escritos`],
        ].map(([l, v]) => (
          <div key={l} className="card-editorial p-4">
            <div className="t-overline text-[var(--brand-mute)]">{l}</div>
            <div className="mt-1 font-[var(--font-display)] text-xl font-semibold text-[var(--brand-navy)]">{v}</div>
          </div>
        ))}
      </section>

      <section className="card-editorial mb-8 p-6">
        <h2 className="mb-3 font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)]">Por usuario (30 días)</h2>
        {mes.porUsuario.length === 0 ? <p className="text-[13px] text-[var(--brand-mute)]">Sin uso en el período.</p> : (
          <table className="w-full">
            <thead><tr className="border-b border-border"><th className={th}>Usuario</th><th className={th}>Plan</th><th className={`${th} text-right`}>Consultas</th><th className={`${th} text-right`}>Escritos</th><th className={`${th} text-right`}>Tokens</th><th className={`${th} text-right`}>Costo est.</th></tr></thead>
            <tbody className="divide-y divide-border">
              {mes.porUsuario.slice(0, 25).map((u) => (
                <tr key={u.user_id}>
                  <td className={td}>{perfil.get(u.user_id)?.full_name ?? u.user_id.slice(0, 8)}</td>
                  <td className={td}>{perfil.get(u.user_id)?.plan ?? "—"}</td>
                  <td className={`${td} text-right font-mono`}>{u.consultas}</td>
                  <td className={`${td} text-right font-mono`}>{u.escritos}</td>
                  <td className={`${td} text-right font-mono`}>{miles(u.tokens)}</td>
                  <td className={`${td} text-right font-mono font-semibold text-[var(--brand-navy)]`}>{usd(u.usd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card-editorial p-6">
          <h2 className="mb-3 font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)]">Por modelo (30 días)</h2>
          <table className="w-full">
            <tbody className="divide-y divide-border">
              {Object.entries(mes.porModelo).sort(([, a], [, b]) => b.usos - a.usos).map(([m, v]) => (
                <tr key={m}><td className={td}>{m}</td><td className={`${td} text-right font-mono`}>{v.usos} usos</td><td className={`${td} text-right font-mono`}>{usd(v.usd)}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="card-editorial p-6">
          <h2 className="mb-3 font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)]">Proveedores que fallaron (7 días)</h2>
          {Object.keys(fallosPorProveedor).length === 0 ? <p className="text-[13px] text-[var(--brand-mute)]">Ninguno.</p> : (
            <ul className="space-y-2 text-[13px]">
              {Object.entries(fallosPorProveedor).map(([p, v]) => (
                <li key={p}><strong>{p}</strong>: {v.n} veces. <span className="text-[var(--brand-mute)]">Último error: {v.ultimo}</span></li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card-editorial mt-6 p-6">
        <h2 className="mb-3 font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)]">Por día</h2>
        <table className="w-full">
          <tbody className="divide-y divide-border">
            {dias.slice(0, 30).map(([d, v]) => (
              <tr key={d}><td className={td}>{d.split("-").reverse().join("/")}</td><td className={`${td} text-right font-mono`}>{usd(v)}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </PageShell>
  );
}
