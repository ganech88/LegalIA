"use client";

import { useState } from "react";
import Link from "next/link";
import { buscarEnCorpus } from "@/lib/legal/corpus";
import type { Ley, LeyArticulo, Fallo } from "@/lib/legal/corpus";

export default function BusquedaSemanticaPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ leyes: (Ley & { matches: LeyArticulo[] })[]; fallos: Fallo[] } | null>(null);
  const [searched, setSearched] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const r = buscarEnCorpus(query.trim());
    setResults(r);
    setSearched(true);
  }

  const totalResults = (results?.leyes.reduce((acc, l) => acc + l.matches.length, 0) ?? 0) + (results?.fallos.length ?? 0);

  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="sticky top-0 z-20 flex items-center border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <Link href="/biblioteca" className="hover:text-[var(--brand-navy)]">Biblioteca</Link>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Busqueda Semantica</span>
        </nav>
      </header>

      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
        <header className="mb-8 pb-6 border-b border-[var(--brand-navy)]">
          <div className="masthead-meta mb-2"><span>BUSQUEDA</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
            Busqueda semantica
          </h1>
          <p className="mt-2 text-[14px] text-[var(--brand-ink-2)] max-w-[600px]">
            Busca por concepto, tema o palabra clave en todo el corpus legal: articulos de leyes, codigos y jurisprudencia.
          </p>
        </header>

        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3 max-w-[700px]">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ej: prescripcion laboral, despido embarazo, tope indemnizatorio, art 245..."
              className="flex-1 rounded border border-border bg-white px-4 py-3 text-[14px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
            />
            <button
              type="submit"
              className="rounded bg-[var(--brand-navy)] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)] shrink-0"
            >
              Buscar
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {["prescripcion", "despido", "indemnizacion", "accidente", "buena fe", "preaviso"].map(term => (
              <button
                key={term}
                type="button"
                onClick={() => { setQuery(term); const r = buscarEnCorpus(term); setResults(r); setSearched(true); }}
                className="rounded-full border border-border bg-[var(--brand-paper)] px-2.5 py-1 text-[11px] text-[var(--brand-navy)] hover:border-[var(--brand-gold)] hover:bg-[var(--brand-gold-pale)]"
              >
                {term}
              </button>
            ))}
          </div>
        </form>

        {/* Results */}
        {searched && results && (
          <div>
            <div className="mb-4 font-mono text-[12px] text-[var(--brand-mute)]">
              {totalResults} resultado{totalResults !== 1 ? "s" : ""} para &ldquo;{query}&rdquo;
            </div>

            {/* Law results */}
            {results.leyes.map(ley => (
              <section key={ley.id} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="cite-chip">{ley.nombre_corto}</span>
                  <span className="text-[12px] text-[var(--brand-ink-2)]">{ley.nombre} — Ley {ley.numero}</span>
                  <span className="font-mono text-[10px] text-[var(--brand-mute)]">{ley.matches.length} coincidencias</span>
                </div>
                <div className="space-y-2">
                  {ley.matches.map(a => (
                    <article key={a.numero} className="card-editorial px-5 py-4">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="cite-chip">Art. {a.numero}</span>
                        <h4 className="font-[var(--font-serif)] text-[13px] font-semibold text-[var(--brand-navy)]">{a.titulo}</h4>
                      </div>
                      <p className="font-[var(--font-serif)] text-[12px] text-[var(--brand-ink)] leading-[1.7]">{a.texto}</p>
                    </article>
                  ))}
                </div>
              </section>
            ))}

            {/* Case law results */}
            {results.fallos.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-[var(--font-display)] italic text-[var(--brand-gold)] text-sm">§</span>
                  <span className="text-[12px] text-[var(--brand-ink-2)]">Jurisprudencia</span>
                  <span className="font-mono text-[10px] text-[var(--brand-mute)]">{results.fallos.length} fallos</span>
                </div>
                <div className="space-y-2">
                  {results.fallos.map(f => (
                    <article key={f.id} className="card-editorial px-5 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded border border-[var(--brand-navy)]/20 bg-[var(--brand-navy)]/5 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[var(--brand-navy)]">
                          {f.tribunal}
                        </span>
                        <span className="font-mono text-[10px] text-[var(--brand-mute)]">{f.fecha}</span>
                      </div>
                      <h4 className="font-[var(--font-serif)] text-[13px] font-semibold text-[var(--brand-navy)] mb-1">
                        &ldquo;{f.caratula}&rdquo;
                      </h4>
                      <p className="text-[12px] text-[var(--brand-ink-2)] mb-2">{f.sumario}</p>
                      <div className="flex flex-wrap gap-1">
                        {f.voces.map(v => (
                          <span key={v} className="cite-chip">{v}</span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {totalResults === 0 && (
              <div className="card-editorial px-6 py-12 text-center">
                <p className="text-[14px] text-[var(--brand-mute)]">No se encontraron resultados. Intenta con otros terminos.</p>
              </div>
            )}
          </div>
        )}

        {!searched && (
          <div className="card-editorial px-6 py-16 text-center">
            <div className="font-[var(--font-display)] text-6xl italic text-[var(--brand-gold)] opacity-40 mb-4">§</div>
            <p className="text-[14px] text-[var(--brand-mute)] max-w-[400px] mx-auto">
              Ingresa un concepto, numero de articulo o palabra clave para buscar en todo el corpus legal argentino.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
