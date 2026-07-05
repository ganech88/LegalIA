import type { Metadata } from "next";
import Link from "next/link";
import { PoweredBy } from "@/components/layout/powered-by";

export const metadata: Metadata = {
  title: "Herramientas gratis para abogados argentinos — Calculadoras legales | LegalIA",
  description:
    "Calculadoras legales gratuitas para abogados: indemnización por despido (art. 245 LCT), plazos procesales, honorarios (Ley 27.423, UMA), intereses y más. Sin registro.",
  alternates: { canonical: "/herramientas" },
};

const HERRAMIENTAS = [
  {
    href: "/herramientas/indemnizacion-despido",
    titulo: "Indemnización por despido (art. 245 LCT)",
    desc: "Liquidación completa rubro por rubro: antigüedad, preaviso, integración, SAC, vacaciones, Ley 25.323 y art. 80.",
    publica: true,
  },
  {
    href: "/register",
    titulo: "Plazos procesales y prescripción",
    desc: "Días hábiles judiciales, ferias, vencimientos y prescripción. Guardá los plazos en tu agenda con alertas por email.",
    publica: false,
  },
  {
    href: "/register",
    titulo: "Honorarios profesionales (Ley 27.423, UMA)",
    desc: "Regulación de honorarios con UMA actualizable, tasa de justicia y cuota alimentaria orientativa.",
    publica: false,
  },
  {
    href: "/register",
    titulo: "Intereses y actualización (BNA, CNAT, IPC, RIPTE)",
    desc: "Cálculo de intereses judiciales y actualización de créditos laborales y civiles.",
    publica: false,
  },
];

export default function HerramientasPage() {
  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="flex items-center justify-between border-b border-border bg-[rgba(250,250,247,0.9)] px-4 md:px-10 py-3">
        <Link href="/" className="font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)]">
          LegalIA
        </Link>
        <nav className="flex items-center gap-4 text-[12px] font-semibold">
          <Link href="/login" className="text-[var(--brand-ink-2)] hover:text-[var(--brand-navy)]">Ingresar</Link>
          <Link href="/register" className="rounded bg-[var(--brand-navy)] px-3 py-1.5 text-white hover:bg-[var(--brand-navy-2)]">
            Crear cuenta gratis
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-[880px] px-4 md:px-6 py-10 md:py-14">
        <header className="mb-10 border-b border-[var(--brand-navy)] pb-6">
          <div className="masthead-meta mb-2"><span>HERRAMIENTAS GRATUITAS</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-[-0.03em] text-[var(--brand-navy)]">
            Calculadoras legales para abogados argentinos
          </h1>
          <p className="mt-2 max-w-[600px] text-[14px] text-[var(--brand-ink-2)]">
            Cálculos correctos, con la norma y la fórmula de cada rubro a la vista. Las calculadoras son gratis e
            ilimitadas con tu cuenta de LegalIA.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {HERRAMIENTAS.map((h) => (
            <Link key={h.titulo} href={h.href} className="card-editorial group block p-5 transition-all hover:border-[var(--brand-gold)]">
              <h2 className="mb-1.5 font-[var(--font-display)] text-[15px] font-semibold text-[var(--brand-navy)] group-hover:underline">
                {h.titulo}
              </h2>
              <p className="text-[12.5px] leading-relaxed text-[var(--brand-ink-2)]">{h.desc}</p>
              <span className="mt-3 inline-block text-[11px] font-bold uppercase tracking-wide text-[var(--brand-gold)]">
                {h.publica ? "Usar sin registro →" : "Gratis con tu cuenta →"}
              </span>
            </Link>
          ))}
        </div>

        <footer className="mt-14 flex items-center justify-between border-t border-border pt-6">
          <PoweredBy />
          <p className="text-[11px] text-[var(--brand-mute)]">LegalIA · herramientas para abogados argentinos</p>
        </footer>
      </main>
    </div>
  );
}
