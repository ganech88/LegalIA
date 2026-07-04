"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";
import { controlPrePresentacion, resumenControl, type ResultadoCheck } from "@/lib/legal/checklist";

/**
 * Panel "Control pre-presentación": checklist procesal determinístico por
 * tipo de escrito y jurisdicción. Corre 100% en el cliente, costo cero.
 */

const ESTILO: Record<ResultadoCheck["nivel"], { icon: typeof CheckCircle2; cls: string }> = {
  ok: { icon: CheckCircle2, cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  advertencia: { icon: AlertTriangle, cls: "text-amber-700 bg-amber-50 border-amber-200" },
  falta: { icon: XCircle, cls: "text-red-700 bg-red-50 border-red-200" },
};

export function PanelChecklist({
  texto,
  tipo,
  fuero,
  jurisdiccion,
  onClose,
}: {
  texto: string;
  tipo: string;
  fuero: string;
  jurisdiccion: string;
  onClose: () => void;
}) {
  const [soloProblemas, setSoloProblemas] = useState(true);
  const resultados = useMemo(
    () => controlPrePresentacion({ texto, tipo, fuero, jurisdiccion }),
    [texto, tipo, fuero, jurisdiccion],
  );
  const resumen = resumenControl(resultados);
  const visibles = soloProblemas ? resultados.filter((x) => x.nivel !== "ok") : resultados;

  return (
    <div className="flex h-full w-[340px] shrink-0 flex-col border-l border-border bg-white">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="font-[var(--font-display)] text-[13px] font-semibold text-[var(--brand-navy)]">
            Control pre-presentación
          </h3>
          <p className="text-[10px] text-[var(--brand-mute)]">
            {tipo.replaceAll("_", " ")} · {fuero} · {jurisdiccion}
          </p>
        </div>
        <button onClick={onClose} className="rounded p-1 hover:bg-black/5" title="Cerrar panel">
          <X className="h-4 w-4 text-[var(--brand-mute)]" />
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-[10px] font-semibold">
        <span className="flex items-center gap-1 text-emerald-700"><CheckCircle2 className="h-3 w-3" /> {resumen.ok}</span>
        <span className="flex items-center gap-1 text-amber-700"><AlertTriangle className="h-3 w-3" /> {resumen.advertencias}</span>
        <span className="flex items-center gap-1 text-red-700"><XCircle className="h-3 w-3" /> {resumen.faltas}</span>
        <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-[var(--brand-mute)]">
          <input type="checkbox" checked={soloProblemas} onChange={(e) => setSoloProblemas(e.target.checked)} className="h-3 w-3" />
          Solo pendientes
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {visibles.length === 0 && (
          <p className="px-1 py-6 text-center text-[11.5px] text-emerald-700">
            ✓ Todos los controles pasan. Igual releé el escrito completo antes de presentar.
          </p>
        )}
        <ul className="space-y-2">
          {visibles.map((c) => {
            const { icon: Icon, cls } = ESTILO[c.nivel];
            return (
              <li key={c.id} className={`rounded border p-2.5 ${cls}`}>
                <div className="flex items-start gap-2">
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11.5px] font-bold leading-tight">{c.titulo}</p>
                    <p className="mt-0.5 text-[10.5px] leading-snug opacity-90">{c.detalle}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-border px-4 py-2">
        <p className="text-[9.5px] leading-snug text-[var(--brand-mute)]">
          Control automático de forma y estructura. No reemplaza la revisión profesional del contenido.
        </p>
      </div>
    </div>
  );
}
