"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Briefcase } from "lucide-react";

interface CasoLite {
  id: string;
  caratula: string;
}

/**
 * Selector de caso: vincula el escrito a un expediente del abogado
 * (columna escritos.caso_id). Parte del "expediente vivo".
 */
export function CasoSelector({
  escritoId,
  initialCasoId,
}: {
  escritoId: string;
  initialCasoId: string | null;
}) {
  const [casos, setCasos] = useState<CasoLite[]>([]);
  const [casoId, setCasoId] = useState<string>(initialCasoId ?? "");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("casos")
        .select("id, caratula")
        .eq("estado", "activo")
        .order("updated_at", { ascending: false })
        .limit(100);
      setCasos(data ?? []);
    }
    load();
  }, [supabase]);

  async function handleChange(value: string) {
    setCasoId(value);
    await supabase
      .from("escritos")
      .update({ caso_id: value || null })
      .eq("id", escritoId);
  }

  if (casos.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5" title="Vincular este escrito a un caso">
      <Briefcase className="h-3.5 w-3.5 text-[var(--brand-mute)]" />
      <select
        value={casoId}
        onChange={(e) => handleChange(e.target.value)}
        className="max-w-[220px] truncate rounded border border-border bg-white px-2 py-1.5 text-[11px] text-[var(--brand-ink-2)] focus:border-[var(--brand-gold)] focus:outline-none"
      >
        <option value="">Sin caso vinculado</option>
        {casos.map((c) => (
          <option key={c.id} value={c.id}>{c.caratula}</option>
        ))}
      </select>
    </div>
  );
}
