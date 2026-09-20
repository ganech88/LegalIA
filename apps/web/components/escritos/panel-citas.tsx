"use client";

import { useState } from "react";
import { ShieldCheck, AlertTriangle, HelpCircle, X, Ban, FileDown } from "lucide-react";
import { toast } from "sonner";
import { generarInformeVerificacionHtml } from "@/lib/legal/informe-verificacion";
import { createClient } from "@/lib/supabase/client";
import { type CitaVerificada } from "@/lib/legal/citas";
import { useCitasVerificadas } from "@/lib/legal/use-citas";

/**
 * Panel "Citas verificadas" — diferencial del producto.
 * Contrasta cada artículo y fallo citado en el escrito contra el corpus
 * verificado y muestra un semáforo por cita. Corre 100% en el cliente.
 */

const ESTILOS: Record<CitaVerificada["estado"], { icon: typeof ShieldCheck; color: string; label: string }> = {
  verificada: { icon: ShieldCheck, color: "text-emerald-700 bg-emerald-50 border-emerald-200", label: "Verificada" },
  dudosa: { icon: HelpCircle, color: "text-amber-700 bg-amber-50 border-amber-200", label: "Verificar cita exacta" },
  no_verificable: { icon: AlertTriangle, color: "text-red-700 bg-red-50 border-red-200", label: "Revisar antes de presentar" },
  derogada: { icon: Ban, color: "text-red-800 bg-red-100 border-red-300", label: "Norma derogada" },
};

export function PanelCitas({ texto, titulo, onClose }: { texto: string; titulo?: string; onClose: () => void }) {
  const [filtro, setFiltro] = useState<"todas" | "atencion">("todas");
  const { citas, resumen } = useCitasVerificadas(texto);

  /** Informe imprimible (PDF desde el diálogo del navegador) con el semáforo completo. */
  async function exportarInforme() {
    let letrado: { nombre?: string | null; matricula?: string | null; colegio?: string | null } | undefined;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("full_name, matricula, colegio_abogados").eq("id", user.id).single();
        if (data) letrado = { nombre: data.full_name, matricula: data.matricula, colegio: data.colegio_abogados };
      }
    } catch { /* sin membrete */ }
    const html = generarInformeVerificacionHtml({ titulo: titulo ?? "Escrito", resultado: { citas, resumen }, letrado });
    const w = window.open("", "_blank");
    if (!w) { toast.error("Permití las ventanas emergentes para exportar el informe."); return; }
    w.document.write(html);
    w.document.close();
  }

  const visibles = filtro === "todas" ? citas : citas.filter((c) => c.estado !== "verificada");

  return (
    <div className="absolute inset-y-0 right-0 z-10 flex h-full w-full flex-col border-l border-border bg-white shadow-xl md:static md:w-[340px] md:shrink-0 md:shadow-none">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="font-[var(--font-display)] text-[13px] font-semibold text-[var(--brand-navy)]">
            Citas verificadas
          </h3>
          <p className="text-[10px] text-[var(--brand-mute)]">
            Contra la ley completa y las reformas 2024-2026
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={exportarInforme}
            disabled={citas.length === 0}
            className="flex items-center gap-1 rounded border border-border px-2 py-1 text-[10px] font-semibold text-[var(--brand-navy)] hover:border-[var(--brand-gold)] disabled:opacity-40"
            title="Informe de verificación normativa (PDF) para adjuntar al legajo o mostrar al cliente"
          >
            <FileDown className="h-3 w-3" /> Informe
          </button>
          <button onClick={onClose} className="rounded p-1 hover:bg-black/5" title="Cerrar panel">
            <X className="h-4 w-4 text-[var(--brand-mute)]" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-[10px] font-semibold">
        <span className="flex items-center gap-1 text-emerald-700">
          <ShieldCheck className="h-3 w-3" /> {resumen.verificadas}
        </span>
        <span className="flex items-center gap-1 text-amber-700">
          <HelpCircle className="h-3 w-3" /> {resumen.dudosas}
        </span>
        <span className="flex items-center gap-1 text-red-700">
          <AlertTriangle className="h-3 w-3" /> {resumen.no_verificables}
        </span>
        {resumen.derogadas > 0 && (
          <span className="flex items-center gap-1 text-red-800" title="Normas derogadas citadas como vigentes">
            <Ban className="h-3 w-3" /> {resumen.derogadas}
          </span>
        )}
        <div className="ml-auto flex gap-1">
          <button
            onClick={() => setFiltro("todas")}
            className={`rounded px-2 py-0.5 ${filtro === "todas" ? "bg-[var(--brand-navy)] text-white" : "text-[var(--brand-mute)] hover:bg-black/5"}`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltro("atencion")}
            className={`rounded px-2 py-0.5 ${filtro === "atencion" ? "bg-[var(--brand-navy)] text-white" : "text-[var(--brand-mute)] hover:bg-black/5"}`}
          >
            A revisar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {citas.length === 0 && (
          <p className="px-1 py-4 text-center text-[11px] text-[var(--brand-mute)]">
            No se detectaron citas de artículos ni fallos en el escrito.
          </p>
        )}
        {visibles.length === 0 && citas.length > 0 && (
          <p className="px-1 py-4 text-center text-[11px] text-emerald-700">
            Todas las citas detectadas están verificadas.
          </p>
        )}
        <ul className="space-y-2">
          {visibles.map((c, i) => {
            const { icon: Icon, color, label } = ESTILOS[c.estado];
            return (
              <li key={i} className={`rounded border p-2.5 ${color}`}>
                <div className="flex items-start gap-2">
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold leading-tight">{c.cita}</p>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
                    <p className="mt-1 text-[10.5px] leading-snug opacity-90">{c.detalle}</p>
                    {c.fuente && <p className="mt-1 text-[10px] font-mono opacity-70">{c.fuente}</p>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-border px-4 py-2">
        <p className="text-[9.5px] leading-snug text-[var(--brand-mute)]">
          La verificación cubre los textos completos de la LCT y el CCCN (fuente InfoLeg) y el corpus curado de LegalIA. Una cita “no verificable” no es
          necesariamente incorrecta: significa que el profesional debe confirmarla en la fuente
          oficial antes de presentar el escrito.
        </p>
      </div>
    </div>
  );
}
