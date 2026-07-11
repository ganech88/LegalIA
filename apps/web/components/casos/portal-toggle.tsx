"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Link2, Copy, Check, Globe } from "lucide-react";

/**
 * Habilita el Portal del Cliente para un caso y copia el link compartible.
 * El token es un UUID no adivinable; desactivar corta el acceso al instante.
 */
export function PortalToggle({
  casoId,
  initialToken,
  initialHabilitado,
}: {
  casoId: string;
  initialToken: string | null;
  initialHabilitado: boolean;
}) {
  const [token, setToken] = useState<string | null>(initialToken);
  const [habilitado, setHabilitado] = useState(initialHabilitado);
  const [copiado, setCopiado] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const url = token ? `${typeof window !== "undefined" ? window.location.origin : ""}/portal/${token}` : "";

  async function toggle() {
    setSaving(true);
    const nuevoEstado = !habilitado;
    const nuevoToken = token ?? crypto.randomUUID();
    const { error } = await supabase
      .from("casos")
      .update({ portal_habilitado: nuevoEstado, portal_token: nuevoToken })
      .eq("id", casoId);
    if (!error) {
      setHabilitado(nuevoEstado);
      setToken(nuevoToken);
    }
    setSaving(false);
  }

  async function copiar() {
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="mt-3 rounded border border-border bg-slate-50/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-slate-500" />
          <div>
            <p className="text-[13px] font-semibold text-slate-800">Portal del cliente</p>
            <p className="text-[11px] text-slate-500">
              Un link para que tu cliente vea el estado del caso sin llamarte.
            </p>
          </div>
        </div>
        <button
          onClick={toggle}
          disabled={saving}
          role="switch"
          aria-checked={habilitado}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${habilitado ? "bg-emerald-600" : "bg-slate-300"}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${habilitado ? "left-[22px]" : "left-0.5"}`} />
        </button>
      </div>

      {habilitado && token && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded border border-border bg-white px-2.5 py-1.5">
            <Link2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate font-mono text-[11px] text-slate-600">{url}</span>
          </div>
          <button
            onClick={copiar}
            className="flex shrink-0 items-center gap-1 rounded bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-700"
          >
            {copiado ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copiado ? "Copiado" : "Copiar link"}
          </button>
        </div>
      )}
    </div>
  );
}
