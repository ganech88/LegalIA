import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { CalendarClock, FolderOpen, FileText, MessageSquare } from "lucide-react";

/**
 * Tablero del estudio: la vista del socio. Casos por estado, vencimientos de
 * la semana, producción del mes. Server component, datos vía RLS del usuario
 * (incluye los casos compartidos de la organización si los hay).
 */

export const dynamic = "force-dynamic";

export default async function TableroPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const hoy = new Date();
  const en7 = new Date(hoy.getTime() + 7 * 86400000);
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString();

  const [{ data: casos }, { data: vencimientos }, { count: escritosMes }, { count: consultasMes }] =
    await Promise.all([
      supabase.from("casos").select("id, caratula, estado, fuero, updated_at"),
      supabase
        .from("vencimientos")
        .select("id, titulo, fecha_vencimiento, estado, caso_id")
        .eq("estado", "pendiente")
        .gte("fecha_vencimiento", hoy.toISOString().slice(0, 10))
        .lte("fecha_vencimiento", en7.toISOString().slice(0, 10))
        .order("fecha_vencimiento", { ascending: true }),
      supabase.from("escritos").select("id", { count: "exact", head: true }).gte("created_at", inicioMes),
      supabase.from("consultas_ia").select("id", { count: "exact", head: true }).gte("created_at", inicioMes),
    ]);

  const porEstado = { activo: 0, archivado: 0, finalizado: 0 } as Record<string, number>;
  const porFuero: Record<string, number> = {};
  for (const c of casos ?? []) {
    porEstado[c.estado] = (porEstado[c.estado] ?? 0) + 1;
    porFuero[c.fuero] = (porFuero[c.fuero] ?? 0) + 1;
  }
  const fmt = (iso: string) => iso.slice(0, 10).split("-").reverse().join("/");

  return (
    <div className="space-y-8">
      <header>
        <p className="masthead-meta mb-2"><span>TABLERO DEL ESTUDIO</span></p>
        <h1 className="heading-serif text-3xl text-slate-900">El estado del estudio, de un vistazo</h1>
        <p className="mt-1 text-slate-500">Casos, vencimientos de la semana y producción del mes.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={<FolderOpen className="h-4 w-4" />} label="Casos activos" value={porEstado.activo ?? 0} sub={`${(casos ?? []).length} en total`} />
        <Kpi icon={<CalendarClock className="h-4 w-4" />} label="Vencen esta semana" value={(vencimientos ?? []).length} sub="plazos pendientes" alerta={(vencimientos ?? []).length > 0} />
        <Kpi icon={<FileText className="h-4 w-4" />} label="Escritos este mes" value={escritosMes ?? 0} sub="generados con IA" />
        <Kpi icon={<MessageSquare className="h-4 w-4" />} label="Consultas este mes" value={consultasMes ?? 0} sub="al asistente" />
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded border border-border bg-white p-5">
          <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[var(--brand-navy)]">Vencimientos de la semana</h2>
          {(vencimientos ?? []).length === 0 ? (
            <p className="text-[13px] text-slate-500">Sin plazos pendientes en los próximos 7 días.</p>
          ) : (
            <ul className="space-y-2">
              {(vencimientos ?? []).map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 rounded border border-border px-3 py-2">
                  <span className="text-[13px] text-slate-800">{v.titulo}</span>
                  <span className="shrink-0 rounded bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700">{fmt(v.fecha_vencimiento)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/agenda" className="mt-3 inline-block text-[12px] font-semibold text-[var(--brand-navy)] underline">Ver agenda completa →</Link>
        </div>

        <div className="rounded border border-border bg-white p-5">
          <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[var(--brand-navy)]">Casos por fuero</h2>
          {Object.keys(porFuero).length === 0 ? (
            <p className="text-[13px] text-slate-500">Todavía no cargaste casos. <Link href="/casos" className="underline">Creá el primero</Link>.</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(porFuero).sort((a, b) => b[1] - a[1]).map(([fuero, n]) => (
                <li key={fuero} className="flex items-center gap-3">
                  <span className="w-24 text-[12px] font-semibold capitalize text-slate-700">{fuero}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded bg-slate-100">
                    <div className="h-full rounded bg-[var(--brand-navy)]" style={{ width: `${Math.round((n / (casos ?? []).length) * 100)}%` }} />
                  </div>
                  <span className="w-6 text-right text-[12px] font-bold text-slate-700">{n}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex gap-4 border-t border-border pt-3 text-[11.5px] text-slate-500">
            <span>Activos: <strong>{porEstado.activo ?? 0}</strong></span>
            <span>Archivados: <strong>{porEstado.archivado ?? 0}</strong></span>
            <span>Finalizados: <strong>{porEstado.finalizado ?? 0}</strong></span>
          </div>
        </div>
      </section>
    </div>
  );
}

function Kpi({ icon, label, value, sub, alerta }: { icon: React.ReactNode; label: string; value: number; sub: string; alerta?: boolean }) {
  return (
    <div className={`rounded border p-4 ${alerta ? "border-red-200 bg-red-50/50" : "border-border bg-white"}`}>
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">{icon}{label}</div>
      <p className={`mt-1 font-[var(--font-display)] text-3xl font-semibold ${alerta ? "text-red-700" : "text-[var(--brand-navy)]"}`}>{value}</p>
      <p className="text-[11px] text-slate-500">{sub}</p>
    </div>
  );
}
