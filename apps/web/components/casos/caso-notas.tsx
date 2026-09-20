"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface Nota { id: string; contenido: string; created_at: string; user_id: string }

/** Notas cronológicas del expediente (llamadas, audiencias, acuerdos, etc.). */
export function CasoNotas({ casoId, userId, initial }: { casoId: string; userId: string; initial: Nota[] }) {
  const [notas, setNotas] = useState<Nota[]>(initial);
  const [texto, setTexto] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    const contenido = texto.trim();
    if (!contenido) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("caso_notas")
      .insert({ caso_id: casoId, user_id: userId, contenido })
      .select("id, contenido, created_at, user_id")
      .single();
    if (error || !data) toast.error("No se pudo guardar la nota.");
    else { setNotas((p) => [data as Nota, ...p]); setTexto(""); }
    setSaving(false);
  }

  async function borrar(id: string) {
    if (!window.confirm("¿Eliminar esta nota?")) return;
    const { error } = await supabase.from("caso_notas").delete().eq("id", id);
    if (error) toast.error("No se pudo eliminar la nota.");
    else setNotas((p) => p.filter((n) => n.id !== id));
  }

  return (
    <div>
      <h2 className="mb-3 font-[var(--font-display)] text-[15px] font-semibold text-[var(--brand-navy)]">Notas del expediente</h2>
      <form onSubmit={agregar} className="mb-4 flex gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={4000}
          placeholder="Ej: llamó el cliente, audiencia fijada para el 12/10, acuerdo propuesto por $…"
          className="flex-1 rounded border border-border bg-white px-3 py-2 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none"
        />
        <button type="submit" disabled={saving || !texto.trim()} className="rounded bg-[var(--brand-navy)] px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-50">
          Agregar
        </button>
      </form>
      {notas.length === 0 ? (
        <p className="text-[12px] text-[var(--brand-mute)]">Todavía no hay notas. Todo lo que anotes queda en orden cronológico.</p>
      ) : (
        <ul className="space-y-2">
          {notas.map((n) => (
            <li key={n.id} className="group flex items-start gap-3 rounded border border-border bg-[var(--brand-paper)] px-3 py-2">
              <span className="shrink-0 font-mono text-[10.5px] text-[var(--brand-mute)]">
                {new Date(n.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                <br />
                {new Date(n.created_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <p className="flex-1 whitespace-pre-wrap text-[13px] leading-snug text-[var(--brand-ink)]">{n.contenido}</p>
              {n.user_id === userId && (
                <button onClick={() => borrar(n.id)} title="Eliminar" className="opacity-0 transition-opacity group-hover:opacity-100">
                  <Trash2 className="h-3.5 w-3.5 text-[var(--brand-mute)] hover:text-red-700" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
