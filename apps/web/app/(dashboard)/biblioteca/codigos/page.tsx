"use client";

import { useState } from "react";
import Link from "next/link";
import { LEYES } from "@/lib/legal/corpus";
import type { Ley } from "@/lib/legal/corpus";

export default function CodigosPage() {
  const [selectedLey, setSelectedLey] = useState<Ley | null>(null);
  const [searchArt, setSearchArt] = useState("");

  const filteredArticulos = selectedLey?.articulos.filter(a =>
    !searchArt ||
    a.numero.includes(searchArt) ||
    a.titulo.toLowerCase().includes(searchArt.toLowerCase()) ||
    a.texto.toLowerCase().includes(searchArt.toLowerCase())
  );

  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="sticky top-0 z-20 flex items-center border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <Link href="/biblioteca" className="hover:text-[var(--brand-navy)]">Biblioteca</Link>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Codigos y Leyes</span>
        </nav>
      </header>

      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
        <header className="mb-8 pb-6 border-b border-[var(--brand-navy)]">
          <div className="masthead-meta mb-2"><span>CODIGOS</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
            Codigos y Leyes
          </h1>
          <p className="mt-2 text-[14px] text-[var(--brand-ink-2)] max-w-[600px]">
            Navega los principales cuerpos normativos del derecho argentino. Selecciona una ley para ver sus articulos.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Law list */}
          <div className="space-y-2">
            {LEYES.map(ley => (
              <button
                key={ley.id}
                onClick={() => { setSelectedLey(ley); setSearchArt(""); }}
                className={`w-full text-left card-editorial p-4 transition-all ${
                  selectedLey?.id === ley.id
                    ? "border-[var(--brand-gold)] bg-[var(--brand-gold-pale)]"
                    : "hover:border-[var(--brand-gold)]"
                }`}
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-[var(--font-display)] text-[15px] font-semibold text-[var(--brand-navy)]">{ley.nombre_corto}</span>
                  <span className="font-mono text-[10px] text-[var(--brand-mute)]">Ley {ley.numero}</span>
                </div>
                <div className="text-[11px] text-[var(--brand-ink-2)] leading-relaxed">{ley.nombre}</div>
                <div className="mt-1.5 font-mono text-[10px] text-[var(--brand-gold)] uppercase">{ley.area} · {ley.articulos.length} arts.</div>
              </button>
            ))}
          </div>

          {/* Articles */}
          <div className="card-editorial">
            {!selectedLey ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="font-[var(--font-display)] text-6xl italic text-[var(--brand-gold)] opacity-40 mb-4">§</div>
                <p className="text-[14px] text-[var(--brand-mute)]">Selecciona una ley del panel izquierdo para ver sus articulos.</p>
              </div>
            ) : (
              <>
                <header className="border-b border-border px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-[var(--font-display)] text-xl font-semibold text-[var(--brand-navy)]">
                      {selectedLey.nombre_corto} — Ley {selectedLey.numero}
                    </h2>
                    <span className="font-mono text-[10px] text-[var(--brand-mute)]">{selectedLey.articulos.length} articulos</span>
                  </div>
                  <p className="text-[12px] text-[var(--brand-ink-2)] mb-3">{selectedLey.descripcion}</p>
                  <input
                    type="text"
                    value={searchArt}
                    onChange={e => setSearchArt(e.target.value)}
                    placeholder="Buscar por numero o contenido de articulo..."
                    className="w-full rounded border border-border bg-white px-3 py-2 text-[12px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
                  />
                </header>
                <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                  {filteredArticulos?.map(a => (
                    <article key={a.numero} className="px-6 py-4 hover:bg-[var(--brand-paper)] transition-colors">
                      <div className="flex items-baseline gap-3 mb-1.5">
                        <span className="cite-chip">Art. {a.numero}</span>
                        <h3 className="font-[var(--font-serif)] text-[14px] font-semibold text-[var(--brand-navy)]">{a.titulo}</h3>
                      </div>
                      <p className="font-[var(--font-serif)] text-[13px] text-[var(--brand-ink)] leading-[1.7]">{a.texto}</p>
                    </article>
                  ))}
                  {filteredArticulos?.length === 0 && (
                    <div className="px-6 py-8 text-center text-[13px] text-[var(--brand-mute)]">
                      No se encontraron articulos con ese criterio.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
