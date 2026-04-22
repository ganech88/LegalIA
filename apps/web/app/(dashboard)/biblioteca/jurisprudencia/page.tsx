"use client";

import { useState } from "react";
import Link from "next/link";
import { JURISPRUDENCIA } from "@/lib/legal/corpus";

const TRIBUNALES = ["Todos", "CSJN", "CNAT", "SCBA"];

export default function JurisprudenciaPage() {
  const [tribunalFilter, setTribunalFilter] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = JURISPRUDENCIA.filter(f => {
    if (tribunalFilter !== "Todos" && !f.tribunal.includes(tribunalFilter)) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.caratula.toLowerCase().includes(q) ||
      f.tema.toLowerCase().includes(q) ||
      f.sumario.toLowerCase().includes(q) ||
      f.voces.some(v => v.includes(q))
    );
  });

  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="sticky top-0 z-20 flex items-center border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <Link href="/biblioteca" className="hover:text-[var(--brand-navy)]">Biblioteca</Link>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Jurisprudencia</span>
        </nav>
      </header>

      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
        <header className="mb-8 pb-6 border-b border-[var(--brand-navy)]">
          <div className="masthead-meta mb-2"><span>JURISPRUDENCIA</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
            Fallos destacados
          </h1>
          <p className="mt-2 text-[14px] text-[var(--brand-ink-2)] max-w-[600px]">
            Jurisprudencia relevante de la CSJN, CNAT y tribunales provinciales. Sumarios con voces clave y referencias cruzadas.
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex gap-1.5">
            {TRIBUNALES.map(t => (
              <button
                key={t}
                onClick={() => setTribunalFilter(t)}
                className={`rounded border px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  tribunalFilter === t
                    ? "border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white"
                    : "border-border bg-white text-[var(--brand-ink-2)] hover:border-[var(--brand-gold)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por caratula, tema o voz..."
            className="flex-1 min-w-[200px] rounded border border-border bg-white px-3 py-2 text-[12px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
          />
          <span className="font-mono text-[11px] text-[var(--brand-mute)]">{filtered.length} resultados</span>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {filtered.map(fallo => (
            <article key={fallo.id} className="card-editorial overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === fallo.id ? null : fallo.id)}
                className="w-full text-left px-6 py-4 hover:bg-[var(--brand-paper)] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded border border-[var(--brand-navy)]/20 bg-[var(--brand-navy)]/5 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[var(--brand-navy)]">
                        {fallo.tribunal}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--brand-mute)]">{fallo.fecha}</span>
                    </div>
                    <h3 className="font-[var(--font-serif)] text-[14px] font-semibold text-[var(--brand-navy)] leading-tight">
                      &ldquo;{fallo.caratula}&rdquo;
                    </h3>
                    <p className="mt-1 text-[12px] text-[var(--brand-ink-2)]">{fallo.tema}</p>
                  </div>
                  <span className="text-[var(--brand-navy)] text-sm shrink-0">{expandedId === fallo.id ? "−" : "+"}</span>
                </div>
              </button>

              {expandedId === fallo.id && (
                <div className="border-t border-border px-6 py-4 bg-[var(--brand-paper)]">
                  <div className="t-overline text-[var(--brand-gold)] mb-2">SUMARIO</div>
                  <p className="font-[var(--font-serif)] text-[13px] text-[var(--brand-ink)] leading-[1.7] mb-4">
                    {fallo.sumario}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {fallo.voces.map(v => (
                      <span key={v} className="cite-chip">{v}</span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}

          {filtered.length === 0 && (
            <div className="card-editorial px-6 py-12 text-center">
              <p className="text-[14px] text-[var(--brand-mute)]">No se encontraron fallos con ese criterio de busqueda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
