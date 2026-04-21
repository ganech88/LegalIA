"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types";

interface DashboardClientProps {
  greeting: string;
  firstName: string;
  plan: Plan;
  planLabel: string;
  planColor: string;
  escritosUsados: number;
  consultasUsadas: number;
  escritosLimit: number;
  consultasLimit: number;
  escritosPct: number;
  consultasPct: number;
}

export function DashboardClient({
  greeting,
  firstName,
  plan,
  planLabel,
  escritosUsados,
  consultasUsadas,
  escritosLimit,
  consultasLimit,
}: DashboardClientProps) {
  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-paper-rules min-h-screen">
      {/* Topbar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <span className="text-[var(--brand-navy)]">Workspace</span>
        </nav>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-[var(--brand-gold)] bg-[var(--brand-gold-pale)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-navy)]">
            {planLabel}
          </span>
        </div>
      </header>

      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
        {/* Masthead */}
        <header className="mb-8 pb-6 border-b-[3px] border-double border-[var(--brand-navy)]">
          <div className="masthead-meta mb-3">
            <span>WORKSPACE</span>
            <span>{today.toUpperCase()}</span>
            <span>ED. {plan === "free" ? "GRATIS" : "PROFESIONAL"}</span>
          </div>
          <h1 className="font-[var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-[var(--brand-navy)]">
            {greeting},{" "}
            <em className="italic text-[var(--brand-gold)]">{firstName || "abogado/a"}</em>.
          </h1>
          <p className="mt-3 max-w-[640px] text-[15px] leading-[1.55] text-[var(--brand-ink-2)] font-[var(--font-serif)]">
            Tenes <strong>{escritosUsados}</strong> escritos generados este mes
            y <strong>{consultasUsadas}</strong> consultas realizadas.
          </p>
        </header>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            num="I"
            label="Escritos / mes"
            value={escritosUsados}
            sub={`de ${escritosLimit === Infinity ? "∞" : escritosLimit} en tu plan`}
          />
          <StatCard
            num="II"
            label="Consultas IA"
            value={consultasUsadas}
            sub={`de ${consultasLimit === Infinity ? "∞" : consultasLimit} este mes`}
          />
          <StatCard
            num="III"
            label="Casos activos"
            value={0}
            sub="0 con vencimiento"
          />
          <StatCard
            num="IV"
            label="Tiempo ahorrado"
            value="0h"
            sub="estimado por IA"
          />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
          {/* Recent escritos */}
          <section className="card-editorial">
            <header className="flex items-center justify-between border-b border-border px-6 py-4 bg-gradient-to-b from-white to-[var(--brand-paper)]">
              <div>
                <h2 className="font-[var(--font-display)] text-xl font-semibold text-[var(--brand-navy)] tracking-[-0.01em]">
                  Escritos recientes
                </h2>
                <div className="t-overline text-[var(--brand-mute)] mt-0.5">
                  Actividad reciente
                </div>
              </div>
              <Link href="/escritos" className="text-[12px] text-[var(--brand-navy)] border-b border-[var(--brand-gold)] pb-px hover:text-[var(--brand-gold)]">
                Ver todos →
              </Link>
            </header>
            <div className="px-6 py-10">
              {escritosUsados === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-paper-2)] font-[var(--font-display)] text-2xl italic text-[var(--brand-gold)]">
                    §
                  </div>
                  <div>
                    <p className="font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)]">
                      Todavia no generaste escritos
                    </p>
                    <p className="mt-1 text-sm text-[var(--brand-mute)]">
                      Cuando generes tu primer escrito, va a aparecer aca.
                    </p>
                  </div>
                  <Link
                    href="/escritos"
                    className="mt-2 rounded bg-[var(--brand-navy)] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--brand-navy-2)]"
                  >
                    Generar mi primer escrito →
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-[var(--brand-mute)]">
                  Tus escritos recientes apareceran aca.
                </p>
              )}
            </div>
          </section>

          {/* Right column */}
          <aside className="space-y-6">
            {/* Quick actions */}
            <section className="card-editorial">
              <header className="border-b border-border px-5 py-4">
                <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)]">
                  Acciones rapidas
                </h2>
              </header>
              <ul>
                <QuickAction num="I" label="Generar escrito" desc="Demandas, cartas documento, contestaciones" href="/escritos" />
                <QuickAction num="II" label="Asistente IA" desc="Consulta legislacion argentina con citas" href="/asistente" />
                <QuickAction num="III" label="Mis casos" desc="Gestiona tus expedientes" href="/casos" />
              </ul>
            </section>

            {/* Calculadora widget */}
            <div className="relative overflow-hidden rounded bg-gradient-to-br from-[var(--brand-navy)] to-[var(--brand-navy-2)] p-5 text-white">
              <div aria-hidden className="absolute -top-8 -right-8 rounded-full border border-[var(--brand-gold)] opacity-20" style={{ width: 120, height: 120 }} />
              <div aria-hidden className="absolute -top-16 -right-16 rounded-full border border-[var(--brand-gold)] opacity-10" style={{ width: 180, height: 180 }} />
              <div className="relative z-10">
                <div className="text-[10px] tracking-[0.16em] uppercase text-[var(--brand-gold-2)] mb-1.5">
                  ◆ Calculadora · art. 245 LCT
                </div>
                <h4 className="font-[var(--font-display)] text-[22px] font-semibold mb-1 tracking-[-0.01em]">
                  Indemnizacion por despido
                </h4>
                <p className="text-[12px] opacity-80 mb-3.5">
                  Calcula antigüedad, preaviso, integracion mes y SAC
                </p>
                <Link
                  href="/calculadoras"
                  className="inline-block rounded bg-[var(--brand-gold)] px-3.5 py-2 text-[12px] font-bold text-[var(--brand-navy)] hover:bg-[var(--brand-gold-2)]"
                >
                  Abrir calculadora →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StatCard({ num, label, value, sub }: { num: string; label: string; value: string | number; sub: string }) {
  return (
    <div className="card-editorial p-5">
      <div className="flex items-baseline justify-between mb-1">
        <span className="t-overline text-[var(--brand-mute)]">{label}</span>
        <span className="font-[var(--font-display)] italic text-[var(--brand-gold)] text-sm">{num}</span>
      </div>
      <div className="font-[var(--font-display)] text-[40px] font-semibold leading-none text-[var(--brand-navy)] tracking-[-0.02em] mt-2">
        {value}
      </div>
      <div className="mt-2 text-[11px] text-[var(--brand-mute)]">{sub}</div>
    </div>
  );
}

function QuickAction({ num, label, desc, href }: { num: string; label: string; desc: string; href: string }) {
  return (
    <li className="border-b border-border last:border-b-0">
      <Link href={href} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--brand-paper)]">
        <span className="w-6 font-[var(--font-display)] text-[12px] italic text-[var(--brand-gold)] text-right">
          {num}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-[var(--font-serif)] text-[14px] font-medium text-[var(--brand-navy)]">{label}</div>
          <div className="text-[11px] text-[var(--brand-mute)] mt-0.5">{desc}</div>
        </div>
        <span className="text-[11px] text-[var(--brand-navy)]">→</span>
      </Link>
    </li>
  );
}
