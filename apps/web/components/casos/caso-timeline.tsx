"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FileText, CalendarClock, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * Timeline del expediente ("expediente vivo"): escritos y vencimientos
 * vinculados al caso, en orden cronológico. El caso deja de ser una ficha
 * muerta y pasa a ser el hilo conductor del trabajo diario.
 */

interface Item {
  id: string;
  tipo: "escrito" | "vencimiento";
  titulo: string;
  detalle: string;
  fecha: string;      // ISO para ordenar
  vencido?: boolean;
  cumplido?: boolean;
  href?: string;
}

export function CasoTimeline({ casoId }: { casoId: string }) {
  const [items, setItems] = useState<Item[] | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const [{ data: escritos }, { data: vencimientos }] = await Promise.all([
        supabase
          .from("escritos")
          .select("id, titulo, tipo, created_at")
          .eq("caso_id", casoId)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("vencimientos")
          .select("id, titulo, tipo, fecha_vencimiento, estado")
          .eq("caso_id", casoId)
          .order("fecha_vencimiento", { ascending: false })
          .limit(50),
      ]);

      const hoy = new Date().toISOString().slice(0, 10);
      const merged: Item[] = [
        ...(escritos ?? []).map((e) => ({
          id: e.id,
          tipo: "escrito" as const,
          titulo: e.titulo,
          detalle: `Escrito · ${e.tipo}`,
          fecha: e.created_at,
          href: `/escritos/${e.id}`,
        })),
        ...(vencimientos ?? []).map((v) => ({
          id: v.id,
          tipo: "vencimiento" as const,
          titulo: v.titulo,
          detalle: `Plazo · ${v.tipo?.replaceAll("_", " ")} · vence ${v.fecha_vencimiento?.split("-").reverse().join("/")}`,
          fecha: `${v.fecha_vencimiento}T00:00:00`,
          vencido: v.estado === "pendiente" && v.fecha_vencimiento < hoy,
          cumplido: v.estado === "cumplido",
        })),
      ].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

      setItems(merged);
    }
    load();
  }, [casoId, supabase]);

  return (
    <div className="mt-2 rounded border border-border bg-slate-50/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-[12px] font-bold uppercase tracking-wide text-slate-600">
          Expediente — actividad
        </h4>
        <div className="flex gap-3 text-[11px] font-semibold">
          <Link href="/escritos" className="text-slate-700 underline-offset-2 hover:underline">+ Escrito</Link>
          <Link href="/agenda" className="text-slate-700 underline-offset-2 hover:underline">+ Plazo</Link>
        </div>
      </div>

      {items === null && <p className="py-2 text-[12px] text-slate-400">Cargando actividad…</p>}

      {items !== null && items.length === 0 && (
        <p className="py-2 text-[12px] text-slate-500">
          Sin actividad vinculada todavía. Vinculá escritos desde el editor (selector de caso) y plazos desde la agenda.
        </p>
      )}

      <ul className="space-y-0">
        {items?.map((item, i) => (
          <li key={`${item.tipo}-${item.id}`} className="relative flex gap-3 pb-3">
            {i < items.length - 1 && (
              <span className="absolute left-[9px] top-6 h-full w-px bg-slate-200" aria-hidden />
            )}
            <span className="relative z-10 mt-0.5">
              {item.tipo === "escrito" ? (
                <FileText className="h-[18px] w-[18px] text-slate-500" />
              ) : item.cumplido ? (
                <CheckCircle2 className="h-[18px] w-[18px] text-emerald-600" />
              ) : item.vencido ? (
                <AlertCircle className="h-[18px] w-[18px] text-red-600" />
              ) : (
                <CalendarClock className="h-[18px] w-[18px] text-amber-600" />
              )}
            </span>
            <div className="min-w-0">
              {item.href ? (
                <Link href={item.href} className="block truncate text-[13px] font-medium text-slate-800 hover:underline">
                  {item.titulo}
                </Link>
              ) : (
                <p className={`truncate text-[13px] font-medium ${item.vencido ? "text-red-700" : "text-slate-800"}`}>
                  {item.titulo}
                  {item.vencido && " — VENCIDO"}
                </p>
              )}
              <p className="text-[11px] text-slate-500">{item.detalle}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
