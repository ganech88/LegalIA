"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, AlertTriangle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { verificarCitas } from "@/lib/legal/citas";

/**
 * Semáforo de citas para las respuestas del asistente: contrasta los
 * artículos y fallos mencionados contra el corpus verificado, en el cliente.
 */
export function CitasChat({ texto }: { texto: string }) {
  const [open, setOpen] = useState(false);
  const { citas, resumen } = useMemo(() => verificarCitas(texto), [texto]);

  if (citas.length === 0) return null;

  return (
    <div className="mt-2.5 border-t border-dashed border-border pt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-[10px] font-semibold text-[var(--brand-mute)] hover:text-[var(--brand-navy)]"
        title="Citas detectadas en la respuesta, contrastadas contra el corpus verificado"
      >
        <span className="flex items-center gap-0.5 text-emerald-700">
          <ShieldCheck className="h-3 w-3" /> {resumen.verificadas}
        </span>
        {resumen.dudosas > 0 && (
          <span className="flex items-center gap-0.5 text-amber-700">
            <HelpCircle className="h-3 w-3" /> {resumen.dudosas}
          </span>
        )}
        {resumen.no_verificables > 0 && (
          <span className="flex items-center gap-0.5 text-red-700">
            <AlertTriangle className="h-3 w-3" /> {resumen.no_verificables}
          </span>
        )}
        <span>citas verificadas contra el corpus</span>
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <ul className="mt-2 space-y-1">
          {citas.map((c, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] leading-snug">
              {c.estado === "verificada" ? (
                <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-700" />
              ) : c.estado === "dudosa" ? (
                <HelpCircle className="mt-0.5 h-3 w-3 shrink-0 text-amber-700" />
              ) : (
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-red-700" />
              )}
              <span>
                <strong>{c.cita}</strong>
                <span className="text-[var(--brand-mute)]"> — {c.detalle}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
