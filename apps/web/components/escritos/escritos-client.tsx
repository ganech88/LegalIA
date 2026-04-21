"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { PenTool } from "lucide-react";
import type { EscritoTemplate } from "@/types";

interface EscritosClientProps {
  templates: EscritoTemplate[];
}

function toRoman(n: number): string {
  const r = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return r[n] ?? String(n);
}

export function EscritosClient({ templates }: EscritosClientProps) {
  return (
    <div className="bg-paper-rules min-h-screen">
      {/* Topbar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <span>Workspace</span>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Escritos</span>
        </nav>
      </header>

      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
        {/* Masthead */}
        <header className="mb-8 pb-6 border-b border-[var(--brand-navy)]">
          <div className="masthead-meta mb-3">
            <span>GENERADOR DE ESCRITOS</span>
            <span>{templates.length} PLANTILLAS DISPONIBLES</span>
          </div>
          <h1 className="font-[var(--font-display)] text-[clamp(2rem,4vw,2.5rem)] font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
            Plantillas de escritos
          </h1>
          <p className="mt-2 text-[15px] text-[var(--brand-ink-2)] max-w-[600px]">
            Genera borradores con formato procesal argentino. Cada plantilla es ajustable al caso.
          </p>
        </header>

        {/* Templates grid */}
        {templates.length === 0 ? (
          <div className="card-editorial flex flex-col items-center justify-center gap-4 p-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-paper-2)] font-[var(--font-display)] text-2xl italic text-[var(--brand-gold)]">
              §
            </div>
            <p className="font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)]">
              Plantillas en camino
            </p>
            <p className="text-sm text-[var(--brand-mute)]">
              Pronto habra plantillas disponibles. Volve mas tarde.
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-border rounded overflow-hidden bg-white mb-10">
            {templates.map((t, i) => (
              <Link
                key={t.id}
                href={`/escritos/nuevo/${t.id}`}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-r border-border p-5 transition-colors hover:bg-[var(--brand-paper)]"
              >
                <div className="w-8 text-center font-[var(--font-display)] text-2xl font-semibold italic text-[var(--brand-gold)]">
                  {toRoman(i + 1)}
                </div>
                <div>
                  <h4 className="font-[var(--font-serif)] text-[15px] font-semibold text-[var(--brand-navy)]">
                    {t.nombre_display}
                  </h4>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {t.jurisdiccion.map((j: string) => (
                      <span key={j} className="font-mono text-[10px] text-[var(--brand-mute)] uppercase tracking-wider">{j}</span>
                    ))}
                  </div>
                </div>
                <div className="text-[11px] text-[var(--brand-navy)] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Abrir →
                </div>
              </Link>
            ))}
          </section>
        )}

        {/* Custom + History links */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/escritos/personalizado" className="card-editorial p-5 flex items-center gap-4 transition-all hover:border-[var(--brand-gold)] hover:-translate-y-0.5">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-[var(--brand-gold-pale)]">
              <PenTool className="h-5 w-5 text-[var(--brand-gold)]" />
            </div>
            <div>
              <h4 className="font-[var(--font-serif)] text-[15px] font-semibold text-[var(--brand-navy)]">Escrito personalizado</h4>
              <p className="text-[12px] text-[var(--brand-mute)]">Cualquier tipo de escrito judicial</p>
            </div>
          </Link>

          <Link href="/escritos/historial" className="card-editorial p-5 flex items-center gap-4 transition-all hover:border-[var(--brand-gold)] hover:-translate-y-0.5">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-[var(--brand-paper-2)]">
              <span className="font-[var(--font-display)] text-lg italic text-[var(--brand-gold)]">§</span>
            </div>
            <div>
              <h4 className="font-[var(--font-serif)] text-[15px] font-semibold text-[var(--brand-navy)]">Historial de escritos</h4>
              <p className="text-[12px] text-[var(--brand-mute)]">Ver todos los escritos generados</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
