"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { FileText, Trash2, Upload, Download } from "lucide-react";

interface Doc { id: string; nombre: string; storage_path: string; mime: string | null; bytes: number | null; created_at: string; user_id: string }

const MAX_BYTES = 10 * 1024 * 1024;

/** Documentos adjuntos al caso (bucket privado "casos", RLS por carpeta de usuario). */
export function CasoDocumentos({ casoId, userId, initial }: { casoId: string; userId: string; initial: Doc[] }) {
  const [docs, setDocs] = useState<Doc[]>(initial);
  const [subiendo, setSubiendo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function subir(files: FileList | null) {
    if (!files || files.length === 0) return;
    setSubiendo(true);
    for (const file of Array.from(files)) {
      if (file.size > MAX_BYTES) { toast.error(`${file.name}: supera los 10 MB.`); continue; }
      const nombre = file.name.replace(/[\\/:*?"<>|]+/g, "-").slice(0, 200);
      const path = `${userId}/${casoId}/${crypto.randomUUID()}-${nombre}`;
      const { error: upErr } = await supabase.storage.from("casos").upload(path, file, { contentType: file.type || undefined, upsert: false });
      if (upErr) { toast.error(`${file.name}: ${upErr.message}`); continue; }
      const { data, error } = await supabase
        .from("caso_documentos")
        .insert({ caso_id: casoId, user_id: userId, nombre, storage_path: path, mime: file.type || null, bytes: file.size })
        .select("id, nombre, storage_path, mime, bytes, created_at, user_id")
        .single();
      if (error || !data) { toast.error(`${file.name}: no se pudo registrar.`); continue; }
      setDocs((p) => [data as Doc, ...p]);
    }
    setSubiendo(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function descargar(d: Doc) {
    const { data, error } = await supabase.storage.from("casos").createSignedUrl(d.storage_path, 60);
    if (error || !data?.signedUrl) { toast.error("No se pudo generar el enlace."); return; }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function borrar(d: Doc) {
    if (!window.confirm(`¿Eliminar "${d.nombre}"? No se puede deshacer.`)) return;
    await supabase.storage.from("casos").remove([d.storage_path]);
    const { error } = await supabase.from("caso_documentos").delete().eq("id", d.id);
    if (error) toast.error("No se pudo eliminar el documento.");
    else setDocs((p) => p.filter((x) => x.id !== d.id));
  }

  const fmtBytes = (b: number | null) => (b == null ? "" : b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-[var(--font-display)] text-[15px] font-semibold text-[var(--brand-navy)]">Documentos</h2>
        <label className={`flex cursor-pointer items-center gap-1 rounded border border-[var(--brand-navy)] px-2.5 py-1 text-[11px] font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-paper-2)] ${subiendo ? "opacity-50" : ""}`}>
          <Upload className="h-3 w-3" /> {subiendo ? "Subiendo…" : "Adjuntar"}
          <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" className="hidden" disabled={subiendo} onChange={(e) => subir(e.target.files)} />
        </label>
      </div>
      {docs.length === 0 ? (
        <p className="text-[12px] text-[var(--brand-mute)]">Cédulas, demandas, telegramas, pruebas: hasta 10 MB por archivo, solo visibles para vos.</p>
      ) : (
        <ul className="divide-y divide-border">
          {docs.map((d) => (
            <li key={d.id} className="group flex items-center gap-2 py-2">
              <FileText className="h-4 w-4 shrink-0 text-[var(--brand-mute)]" />
              <button onClick={() => descargar(d)} className="min-w-0 flex-1 truncate text-left text-[13px] text-[var(--brand-ink)] hover:underline" title="Abrir">
                {d.nombre}
              </button>
              <span className="font-mono text-[10px] text-[var(--brand-mute)]">{fmtBytes(d.bytes)}</span>
              <button onClick={() => descargar(d)} title="Descargar"><Download className="h-3.5 w-3.5 text-[var(--brand-mute)] hover:text-[var(--brand-navy)]" /></button>
              {d.user_id === userId && (
                <button onClick={() => borrar(d)} title="Eliminar"><Trash2 className="h-3.5 w-3.5 text-[var(--brand-mute)] hover:text-red-700" /></button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
