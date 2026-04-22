"use client";

import Link from "next/link";
import { useState } from "react";
import { Send, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types";

interface CasoItem {
  id: string;
  caratula: string;
  expediente: string | null;
  fuero: string;
  jurisdiccion: string;
  juzgado: string | null;
  estado: string;
}

interface ActivityItem {
  tipo: "escrito" | "consulta" | "caso";
  texto: string;
  fecha: string;
}

interface DashboardClientProps {
  greeting: string;
  firstName: string;
  plan: Plan;
  planLabel: string;
  escritosUsados: number;
  consultasUsadas: number;
  escritosLimit: number;
  consultasLimit: number;
  casosActivos: number;
  userName: string;
  casos: CasoItem[];
  actividad: ActivityItem[];
}

const PLANTILLAS = [
  { titulo: "Demanda laboral — despido sin causa", tipo: "laboral" },
  { titulo: "Carta documento — intimacion", tipo: "civil" },
  { titulo: "Contestacion de demanda", tipo: "laboral" },
  { titulo: "Recurso de apelacion", tipo: "procesal" },
];

function formatActivityTime(fecha: string): string {
  const d = new Date(fecha);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = diffMs / (1000 * 60 * 60);

  if (diffH < 24) {
    return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffH < 48) return "AYER";
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" }).toUpperCase();
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
  casosActivos,
  casos,
  actividad,
}: DashboardClientProps) {
  const [chatInput, setChatInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const tiempoAhorrado = Math.round(escritosUsados * 0.4 + consultasUsadas * 0.05);

  return (
    <div className="bg-paper-rules min-h-screen flex flex-col">
      {/* Topbar */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <span>Workspace</span>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Dashboard</span>
        </nav>
        <div className="hidden md:flex items-center gap-2 rounded border border-border bg-white px-3 py-2 text-[12px] max-w-[400px] flex-1 ml-8 transition-colors focus-within:border-[var(--brand-gold)]">
          <Search className="h-3.5 w-3.5 text-[var(--brand-mute)]" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Busca un fuero, jurisprudencia, expediente..."
            className="flex-1 bg-transparent outline-none text-[var(--brand-ink)] placeholder:text-[var(--brand-mute)]"
            onKeyDown={e => { if (e.key === "Enter" && searchQuery.trim()) window.location.href = `/biblioteca/busqueda?q=${encodeURIComponent(searchQuery)}`; }}
          />
        </div>
        <span className="rounded-full border border-[var(--brand-gold)] bg-[var(--brand-gold-pale)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-navy)] shrink-0">
          {planLabel}
        </span>
      </header>

      <div className="flex-1 px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
        {/* Greeting */}
        <header className="mb-8 pb-6 border-b-[3px] border-double border-[var(--brand-navy)]">
          <div className="masthead-meta mb-3">
            <span>WORKSPACE</span>
            <span>{today.toUpperCase()}</span>
            <span>ED. {plan === "free" ? "GRATIS" : "PROFESIONAL"}</span>
          </div>
          <h1 className="font-[var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-[var(--brand-navy)]">
            {greeting},{" "}
            <em className="italic text-[var(--brand-gold)]">{firstName ? `${firstName}.` : "abogado/a."}</em>
          </h1>
          <p className="mt-3 max-w-[700px] text-[14px] leading-[1.6] text-[var(--brand-ink-2)] font-[var(--font-serif)]">
            Hoy tenes <strong>{escritosUsados} escritos en borrador</strong> y <strong>{casosActivos} casos activos</strong>.
            El asistente IA esta disponible con el corpus actualizado al {new Date().toLocaleDateString("es-AR")}.
          </p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard num="I" label="Escritos / mes" value={escritosUsados} sub={`de ${escritosLimit === Infinity ? "∞" : escritosLimit} en tu plan`} />
          <StatCard num="II" label="Consultas IA" value={consultasUsadas} sub={`de ${consultasLimit === Infinity ? "∞" : consultasLimit} este mes`} />
          <StatCard num="III" label="Casos activos" value={casosActivos} sub={casosActivos > 0 ? `${casosActivos} expedientes` : "sin expedientes"} accent />
          <StatCard num="IV" label="Tiempo ahorrado" value={`${tiempoAhorrado}h`} sub="estimado por IA" />
        </div>

        {/* AI Assistant + Plantillas row */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6 mb-8">
          {/* AI Assistant preview */}
          <section className="flex flex-col overflow-hidden rounded border border-border">
            <div className="flex items-center gap-3 bg-gradient-to-b from-[var(--brand-navy)] to-[#142847] px-5 py-4 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-[var(--brand-gold)] text-[var(--brand-navy)] font-serif text-lg font-bold italic">§</div>
              <div className="flex-1">
                <h3 className="font-[var(--font-display)] text-lg font-semibold tracking-[-0.01em]">Asistente IA Juridico</h3>
                <p className="text-[11px] tracking-wide text-[var(--brand-gold-2)]">
                  Derecho argentino · con citas verificadas de LCT, CCCN, CPCCN
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5ccf70] shadow-[0_0_6px_#5ccf70]" />
                Online
              </div>
            </div>
            <div className="bg-[var(--brand-paper)] px-5 py-5 flex-1">
              <div className="flex gap-2.5 mb-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-paper-3)] text-[11px] font-bold text-[var(--brand-navy)]">TU</div>
                <div className="rounded border border-[var(--brand-navy)] bg-[var(--brand-navy)] px-3 py-2 text-[12px] text-white leading-[1.5]">
                  ¿Cual es el plazo para reclamar la indemnizacion por despido sin causa y que rubros abarca?
                </div>
              </div>
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-navy)] text-[var(--brand-gold)] font-serif italic text-sm">§</div>
                <div className="rounded border border-border bg-white px-3 py-2 text-[12px] text-[var(--brand-ink)] leading-[1.6] max-w-[90%]">
                  <p>El plazo de prescripcion para reclamar creditos laborales es de dos (2) años, desde que se devenga la obligacion, conforme al <span className="cite-chip">Art. 256 LCT</span>.</p>
                  <p className="mt-2">Los rubros indemnizatorios comprenden: la Indemnizacion por antiguedad (<span className="cite-chip">Art. 245 LCT</span>), las indemnizaciones sustitutivas del preaviso e integracion del mes de despido (<span className="cite-chip">Arts. 231-233 LCT</span>), vacaciones proporcionales, SAC proporcional, y dias trabajados.</p>
                </div>
              </div>
            </div>
            <div className="border-t border-border bg-white px-5 py-3">
              <div className="flex items-center gap-2.5 rounded border border-border bg-[var(--brand-paper)] px-3 py-2 transition-colors focus-within:border-[var(--brand-gold)] focus-within:bg-white">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Consulta sobre legislacion, jurisprudencia..."
                  className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-[var(--brand-mute)]"
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); window.location.href = "/asistente"; } }}
                />
                <Link href="/asistente" className="flex h-7 w-7 items-center justify-center rounded bg-[var(--brand-navy)] text-[var(--brand-gold)]">
                  <Send className="h-3.5 w-3.5" />
                </Link>
              </div>
              <p className="mt-2 text-center text-[10px] italic text-[var(--brand-mute)]">
                LegalIA es herramienta de asistencia. El abogado es responsable de revisar antes de presentar.
              </p>
            </div>
          </section>

          {/* Plantillas + calculator */}
          <aside className="space-y-6">
            <section className="card-editorial">
              <header className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)]">Plantillas</h2>
                <Link href="/escritos" className="text-[11px] text-[var(--brand-navy)] border-b border-[var(--brand-gold)] pb-px hover:text-[var(--brand-gold)]">Ver todas →</Link>
              </header>
              <ul>
                {PLANTILLAS.map(p => (
                  <li key={p.titulo} className="border-b border-border last:border-b-0">
                    <Link href="/escritos" className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--brand-paper)]">
                      <span className="w-5 font-[var(--font-display)] text-[11px] italic text-[var(--brand-gold)]">§</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-[var(--brand-navy)] truncate">{p.titulo}</div>
                        <div className="text-[10px] text-[var(--brand-mute)] mt-0.5 uppercase tracking-wide">{p.tipo}</div>
                      </div>
                      <span className="text-[11px] text-[var(--brand-navy)]">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <Link href="/calculadoras/art-245" className="block relative overflow-hidden rounded bg-gradient-to-br from-[var(--brand-navy)] to-[var(--brand-navy-2)] p-5 text-white hover:shadow-lg transition-shadow">
              <div aria-hidden className="absolute -top-8 -right-8 rounded-full border border-[var(--brand-gold)] opacity-20" style={{ width: 120, height: 120 }} />
              <div className="relative z-10">
                <div className="text-[10px] tracking-[0.16em] uppercase text-[var(--brand-gold-2)] mb-1">◆ Calculadora · art. 245 LCT</div>
                <h4 className="font-[var(--font-display)] text-[20px] font-semibold mb-1 tracking-[-0.01em]">Indemnizacion por despido</h4>
                <p className="text-[11px] opacity-70 mb-2">Antiguedad, preaviso, integracion, SAC</p>
                <span className="inline-block rounded bg-[var(--brand-gold)] px-3.5 py-2 text-[12px] font-bold text-[var(--brand-navy)]">
                  Abrir calculadora →
                </span>
              </div>
            </Link>
          </aside>
        </div>

        {/* Cases + Activity row */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6 mb-8">
          {/* Cases */}
          <section className="card-editorial">
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <h2 className="font-[var(--font-display)] text-xl font-semibold text-[var(--brand-navy)]">Mis casos</h2>
                <span className="rounded border border-[var(--brand-navy)] bg-[var(--brand-navy)] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                  {String(casosActivos).padStart(2, "0")} ACTIVOS
                </span>
              </div>
              <Link href="/casos" className="text-[12px] text-[var(--brand-navy)] hover:text-[var(--brand-gold)]">
                Ver todos los expedientes →
              </Link>
            </header>
            {casos.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="font-[var(--font-display)] text-4xl italic text-[var(--brand-gold)] opacity-40 mb-3">IV</div>
                <p className="text-[13px] text-[var(--brand-mute)] mb-3">Todavia no tenes casos cargados.</p>
                <Link href="/casos" className="inline-block rounded bg-[var(--brand-navy)] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[var(--brand-navy-2)]">
                  Crear primer caso →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {casos.map(c => (
                  <div key={c.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--brand-paper)] transition-colors">
                    <div className="font-mono text-[12px] text-[var(--brand-mute)] w-[100px] shrink-0">
                      {c.expediente ? `EXP ${c.expediente}` : "SIN EXP"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-[var(--font-serif)] text-[14px] font-medium text-[var(--brand-navy)] truncate">{c.caratula}</div>
                      <div className="text-[11px] text-[var(--brand-mute)] mt-0.5">
                        {c.jurisdiccion} · {c.fuero}{c.juzgado ? ` · ${c.juzgado}` : ""}
                      </div>
                    </div>
                    <span className="rounded border border-[var(--brand-navy)]/30 bg-[var(--brand-navy)]/5 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-[var(--brand-navy)]">
                      ACTIVO
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Activity */}
          <section className="card-editorial">
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)]">Actividad</h2>
              <Link href="/escritos/historial" className="text-[11px] text-[var(--brand-navy)] border-b border-[var(--brand-gold)] pb-px hover:text-[var(--brand-gold)]">Historial →</Link>
            </header>
            {actividad.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-[13px] text-[var(--brand-mute)]">Sin actividad reciente. Genera un escrito o consulta al asistente IA.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {actividad.map((a, i) => (
                  <div key={i} className="flex gap-3 px-5 py-3.5">
                    <span className={cn(
                      "font-mono text-[11px] font-bold w-[52px] shrink-0",
                      a.tipo === "escrito" ? "text-[var(--brand-gold)]" : a.tipo === "consulta" ? "text-[var(--brand-navy)]" : "text-[var(--brand-mute)]"
                    )}>
                      {formatActivityTime(a.fecha)}
                    </span>
                    <div className="text-[13px] text-[var(--brand-ink)] leading-[1.5] truncate">{a.texto}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Disclaimer band */}
        <div className="disclaimer-band mb-8">
          <span className="text-[var(--brand-gold)] text-lg mr-3">§</span>
          <div className="text-[12px] leading-[1.6]">
            <strong>Advertencia profesional</strong> — LegalIA es una herramienta de asistencia. Todo escrito y consulta debe ser revisada por el profesional antes de su presentacion. No reemplaza el criterio juridico ni la verificacion de vigencia normativa. Corpus actualizado al {new Date().toLocaleDateString("es-AR")}.
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-[var(--brand-paper-2)] px-4 md:px-6 lg:px-10 py-4">
        <div className="flex flex-col md:flex-row justify-between gap-2 text-[11px] text-[var(--brand-mute)]">
          <span><strong className="text-[var(--brand-navy)]">LegalIA</strong> v2.4.1 · Desarrollo sin Fronteras · 2026</span>
          <span>Corpus legal: <strong>LCT</strong> · <strong>CCCN</strong> · <strong>CPCCN</strong> · Fallos <strong>CSJN/CNAT/SCBA</strong></span>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ num, label, value, sub, accent }: { num: string; label: string; value: string | number; sub: string; accent?: boolean }) {
  return (
    <div className="card-editorial p-5">
      <div className="flex items-baseline justify-between mb-1">
        <span className="t-overline text-[var(--brand-mute)]">{label}</span>
        <span className="font-[var(--font-display)] italic text-[var(--brand-gold)] text-sm">{num}</span>
      </div>
      <div className={cn(
        "font-[var(--font-display)] text-[40px] font-semibold leading-none tracking-[-0.02em] mt-2",
        accent ? "text-[var(--brand-gold)]" : "text-[var(--brand-navy)]"
      )}>
        {value}
      </div>
      <div className="mt-2 text-[11px] text-[var(--brand-mute)]">{sub}</div>
    </div>
  );
}
