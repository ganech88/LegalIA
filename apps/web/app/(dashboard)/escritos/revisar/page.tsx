"use client";

import { useState } from "react";
import Link from "next/link";

const MODOS = [
  { value: "redaccion", label: "Mejorar redacción", desc: "Claridad, estilo procesal y ortografía" },
  { value: "errores", label: "Detectar errores", desc: "Citas dudosas, inconsistencias, omisiones" },
  { value: "argumentacion", label: "Reforzar argumentación", desc: "Fundamentación jurídica más sólida" },
];

export default function RevisarPage() {
  const [texto, setTexto] = useState("");
  const [modo, setModo] = useState("redaccion");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function revisar() {
    setLoading(true); setError(null); setRevision(null);
    try {
      const res = await fetch("/api/revisar-escrito", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, modo }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error al revisar."); return; }
      setRevision(data.revision);
    } catch {
      setError("No se pudo conectar. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function copiar() {
    if (!revision) return;
    await navigator.clipboard.writeText(revision);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="sticky top-0 z-20 flex items-center border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <Link href="/escritos" className="hover:text-[var(--brand-navy)]">Escritos</Link>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Revisar</span>
        </nav>
      </header>

      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
        <header className="mb-6 pb-6 border-b border-[var(--brand-navy)]">
          <div className="masthead-meta mb-2"><span>REVISIÓN ASISTIDA</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
            Revisá un escrito propio
          </h1>
          <p className="mt-2 text-[14px] text-[var(--brand-ink-2)] max-w-[620px]">
            Pegá un escrito que ya tengas y la IA lo revisa, mejora o señala posibles errores. Vos decidís qué aplicar.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-editorial p-6 space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {MODOS.map((m) => (
                <button key={m.value} onClick={() => setModo(m.value)} title={m.desc}
                  className={`rounded border px-3 py-1.5 text-[12px] font-semibold transition-all ${modo === m.value ? "border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white" : "border-border bg-white text-[var(--brand-ink-2)] hover:border-[var(--brand-gold)]"}`}>
                  {m.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[var(--brand-mute)]">{MODOS.find((m) => m.value === modo)?.desc}</p>

            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Pegá acá el escrito a revisar…"
              rows={16}
              className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] font-[var(--font-serif)] leading-[1.7] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
            />
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-[var(--brand-mute)]">{texto.length} caracteres</span>
              <button onClick={revisar} disabled={loading || texto.trim().length < 30}
                className="rounded bg-[var(--brand-navy)] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--brand-navy-2)] disabled:opacity-50">
                {loading ? "Revisando…" : "Revisar escrito"}
              </button>
            </div>
            {error && <div className="rounded border border-[var(--brand-red)]/30 bg-[var(--brand-red)]/5 px-3 py-2 text-[12px] text-[var(--brand-red)]">{error}</div>}
          </div>

          <div className="card-editorial p-6">
            {revision ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="masthead-meta"><span>RESULTADO</span></div>
                  <button onClick={copiar} className="rounded border border-border bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--brand-ink-2)] hover:border-[var(--brand-gold)]">
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <div className="whitespace-pre-wrap font-[var(--font-serif)] text-[13px] leading-[1.8] text-[var(--brand-ink)]">
                  {revision}
                </div>
                <div className="mt-4 rounded border border-amber-500/40 bg-amber-50 px-3 py-2.5 text-[11px] text-amber-800">
                  Revisión asistida por IA. Verificá cada observación y cita antes de presentar.
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="font-[var(--font-display)] text-6xl italic text-[var(--brand-gold)] opacity-40 mb-4">¶</div>
                <p className="text-[13px] text-[var(--brand-mute)]">El resultado de la revisión aparecerá acá.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
