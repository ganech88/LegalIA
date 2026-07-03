"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { History, RotateCcw, X } from "lucide-react";

interface Version {
  id: string;
  contenido: string;
  origen: string;
  created_at: string;
}

/**
 * Panel de versiones del escrito: lista los snapshots guardados
 * (manuales y automáticos) y permite restaurar cualquiera.
 */
export function PanelVersiones({
  escritoId,
  onRestore,
  onClose,
}: {
  escritoId: string;
  onRestore: (contenido: string) => void;
  onClose: () => void;
}) {
  const [versiones, setVersiones] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("escritos_versiones")
      .select("id, contenido, origen, created_at")
      .eq("escrito_id", escritoId)
      .order("created_at", { ascending: false })
      .limit(30);
    setVersiones(data ?? []);
    setLoading(false);
  }, [escritoId, supabase]);

  useEffect(() => { load(); }, [load]);

  function fmt(iso: string): string {
    return new Date(iso).toLocaleString("es-AR", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col border-l border-border bg-white">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-[var(--brand-navy)]" />
          <h3 className="font-[var(--font-display)] text-[13px] font-semibold text-[var(--brand-navy)]">
            Versiones
          </h3>
        </div>
        <button onClick={onClose} className="rounded p-1 hover:bg-black/5" title="Cerrar panel">
          <X className="h-4 w-4 text-[var(--brand-mute)]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {loading && <p className="py-4 text-center text-[11px] text-[var(--brand-mute)]">Cargando…</p>}
        {!loading && versiones.length === 0 && (
          <p className="px-1 py-4 text-center text-[11px] text-[var(--brand-mute)]">
            Todavía no hay versiones guardadas. Se crean al guardar y automáticamente mientras editás.
          </p>
        )}
        <ul className="space-y-2">
          {versiones.map((v, i) => (
            <li key={v.id} className="rounded border border-border p-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-[var(--brand-navy)]">
                    {fmt(v.created_at)}
                    {i === 0 && <span className="ml-1.5 rounded bg-[var(--brand-gold)]/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase">última</span>}
                  </p>
                  <p className="text-[10px] text-[var(--brand-mute)]">
                    {v.origen === "auto" ? "Guardado automático" : "Guardado manual"} · {v.contenido.length.toLocaleString("es-AR")} caracteres
                  </p>
                </div>
                <button
                  onClick={() => onRestore(v.contenido)}
                  title="Restaurar esta versión en el editor"
                  className="flex items-center gap-1 rounded border border-border px-2 py-1 text-[10px] font-semibold text-[var(--brand-ink-2)] hover:border-[var(--brand-gold)]"
                >
                  <RotateCcw className="h-3 w-3" />
                  Restaurar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-border px-4 py-2">
        <p className="text-[9.5px] leading-snug text-[var(--brand-mute)]">
          Restaurar carga la versión en el editor; no borra nada hasta que guardes.
        </p>
      </div>
    </div>
  );
}
