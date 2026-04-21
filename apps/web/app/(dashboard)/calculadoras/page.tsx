import Link from "next/link";

const CALCS = [
  { num: "I", title: "Indemnizacion art. 245 LCT", desc: "Antigüedad · preaviso · integracion mes · SAC", href: "/calculadoras/art-245" },
  { num: "II", title: "Accidente laboral — Ley 24.557", desc: "ILP · ILT · gran invalidez · muerte", href: "/calculadoras/art-ley-24557" },
  { num: "III", title: "Intereses", desc: "Tasa activa BNA · acta CNAT 2658/2664/2783", href: "/calculadoras/intereses" },
  { num: "IV", title: "Actualizacion IPC / RIPTE", desc: "Indexacion de creditos laborales", href: "/calculadoras/actualizacion" },
];

export default function CalculadorasPage() {
  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="sticky top-0 z-20 flex items-center border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <span>Workspace</span>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Calculadoras</span>
        </nav>
      </header>
      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
        <header className="mb-8 pb-6 border-b border-[var(--brand-navy)]">
          <div className="masthead-meta mb-2"><span>HERRAMIENTAS DE CALCULO</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(2rem,4vw,2.5rem)] font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
            Calculadoras legales
          </h1>
          <p className="mt-2 text-[15px] text-[var(--brand-ink-2)] max-w-[600px]">
            Calculos verificados segun legislacion y jurisprudencia vigente. Indices actualizados al ultimo periodo disponible.
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CALCS.map(c => (
            <Link key={c.href} href={c.href} className="group card-editorial p-5 block transition-all hover:border-[var(--brand-gold)] hover:-translate-y-0.5">
              <div className="font-[var(--font-display)] text-3xl font-semibold italic text-[var(--brand-gold)] mb-2">{c.num}</div>
              <h3 className="font-[var(--font-display)] text-[17px] font-semibold text-[var(--brand-navy)] leading-tight mb-1.5">{c.title}</h3>
              <p className="text-[12px] text-[var(--brand-mute)] leading-relaxed">{c.desc}</p>
              <div className="mt-4 pt-3 border-t border-border text-[11px] text-[var(--brand-navy)] font-semibold">
                Abrir calculadora →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
