import type { Metadata } from "next";
import Link from "next/link";
import { CalcIndemnizacionPublica } from "@/components/calculadoras/calc-indemnizacion-publica";

export const metadata: Metadata = {
  title: "Calculadora de indemnización por despido 2026 (art. 245 LCT) — Gratis | LegalIA",
  description:
    "Calculá gratis la indemnización por despido sin causa en Argentina: antigüedad (art. 245 LCT), preaviso, integración, SAC, vacaciones, Ley 25.323 y multa art. 80. Con la fórmula y la norma de cada rubro.",
  keywords: [
    "calculadora indemnización despido",
    "indemnización despido sin causa argentina",
    "art 245 LCT",
    "liquidación final despido",
    "cuánto me corresponde por despido 2026",
  ],
  alternates: { canonical: "/herramientas/indemnizacion-despido" },
  openGraph: {
    title: "Calculadora de indemnización por despido (art. 245 LCT) — Gratis",
    description:
      "Liquidación completa rubro por rubro, con la norma y la fórmula de cada uno. Hecha para abogados laboralistas.",
  },
};

export default function IndemnizacionDespidoPage() {
  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="flex items-center justify-between border-b border-border bg-[rgba(250,250,247,0.9)] px-4 md:px-10 py-3">
        <Link href="/" className="font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)]">
          LegalIA
        </Link>
        <nav className="flex items-center gap-4 text-[12px] font-semibold">
          <Link href="/herramientas" className="text-[var(--brand-ink-2)] hover:text-[var(--brand-navy)]">
            Herramientas gratis
          </Link>
          <Link href="/login" className="text-[var(--brand-ink-2)] hover:text-[var(--brand-navy)]">
            Ingresar
          </Link>
          <Link href="/register" className="rounded bg-[var(--brand-navy)] px-3 py-1.5 text-white hover:bg-[var(--brand-navy-2)]">
            Crear cuenta gratis
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-[1080px] px-4 md:px-6 py-8 md:py-12">
        <header className="mb-8 border-b border-[var(--brand-navy)] pb-6">
          <div className="masthead-meta mb-2"><span>HERRAMIENTA GRATUITA · ACTUALIZADA 2026</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-[-0.03em] text-[var(--brand-navy)]">
            Calculadora de indemnización por despido — Art. 245 LCT
          </h1>
          <p className="mt-2 max-w-[640px] text-[14px] text-[var(--brand-ink-2)]">
            Antigüedad, preaviso, integración del mes, SAC, vacaciones proporcionales, incrementos de la Ley 25.323 y
            multa del art. 80 LCT. Cada rubro con su norma y su fórmula, listo para auditar.
          </p>
        </header>

        <CalcIndemnizacionPublica />

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          <article className="card-editorial p-5">
            <h2 className="mb-2 font-[var(--font-display)] text-[15px] font-semibold text-[var(--brand-navy)]">¿Cómo se calcula?</h2>
            <p className="text-[12.5px] leading-relaxed text-[var(--brand-ink-2)]">
              La indemnización por antigüedad del art. 245 LCT equivale a un mes de la mejor remuneración mensual,
              normal y habitual por cada año de servicio o fracción mayor de 3 meses. Se suman preaviso (arts. 231/232),
              integración del mes (art. 233), SAC y vacaciones proporcionales.
            </p>
          </article>
          <article className="card-editorial p-5">
            <h2 className="mb-2 font-[var(--font-display)] text-[15px] font-semibold text-[var(--brand-navy)]">¿Y el tope de convenio?</h2>
            <p className="text-[12.5px] leading-relaxed text-[var(--brand-ink-2)]">
              La base no puede exceder 3 veces el promedio salarial del CCT aplicable, pero por la doctrina
              &ldquo;Vizzoti&rdquo; (CSJN, 2004) el tope no puede reducir la base más de un 33%. En la versión completa de la
              calculadora podés aplicar tope y Vizzoti.
            </p>
          </article>
          <article className="card-editorial p-5">
            <h2 className="mb-2 font-[var(--font-display)] text-[15px] font-semibold text-[var(--brand-navy)]">Para abogados</h2>
            <p className="text-[12.5px] leading-relaxed text-[var(--brand-ink-2)]">
              Con una cuenta gratis de LegalIA convertís este cálculo en una demanda laboral completa: liquidación como
              anexo auditable, citas legales verificadas contra el corpus y exportación a Word con tu membrete.
            </p>
          </article>
        </section>

        <p className="mt-10 text-center text-[11px] text-[var(--brand-mute)]">
          LegalIA es una herramienta de asistencia profesional. El cálculo es orientativo y no constituye asesoramiento
          legal; el profesional debe verificar normativa y jurisprudencia vigentes antes de presentar.
        </p>
      </main>
    </div>
  );
}
