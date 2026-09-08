import type { Metadata } from "next";
import Link from "next/link";
import { CalcIndemnizacionPublica } from "@/components/calculadoras/calc-indemnizacion-publica";
import { PoweredBy } from "@/components/layout/powered-by";

export const metadata: Metadata = {
  title: "Calculadora de indemnización por despido 2026 — Ley 27.802 y Ley Bases (art. 245 LCT) | LegalIA",
  description:
    "Calculá gratis la indemnización por despido sin causa en Argentina, actualizada a la reforma laboral 2026 (ley 27.802) y a la Ley Bases (27.742): antigüedad (art. 245 LCT), preaviso, integración, SAC y vacaciones, con el régimen que corresponde a la fecha del despido y la norma y fórmula de cada rubro.",
  keywords: [
    "calculadora indemnización despido 2026",
    "indemnización despido ley 27.802",
    "reforma laboral 2026 indemnización",
    "indemnización despido sin causa argentina",
    "art 245 LCT",
    "liquidación final despido",
    "cuánto me corresponde por despido 2026",
    "multas ley 24.013 derogadas",
  ],
  alternates: { canonical: "/herramientas/indemnizacion-despido" },
  openGraph: {
    title: "Calculadora de indemnización por despido (art. 245 LCT) — Gratis",
    description:
      "Liquidación completa rubro por rubro, con la norma y la fórmula de cada uno. Hecha para abogados laboralistas.",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Calculadora de indemnización por despido — LegalIA",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "ARS" },
      "url": "https://www.legaliapp.com/herramientas/indemnizacion-despido",
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "¿Cómo se calcula la indemnización por despido sin causa en Argentina?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "El art. 245 de la LCT (ley 20.744) fija un mes de sueldo por cada año de servicio o fracción mayor de tres meses, tomando como base la mejor remuneración mensual, normal y habitual del último año. A eso se suman preaviso (arts. 231/232), integración del mes de despido (art. 233), SAC proporcional y vacaciones no gozadas.",
          },
        },
        {
          "@type": "Question",
          "name": "¿Qué es el tope del art. 245 LCT y cuándo aplica?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "La base de cálculo no puede superar tres veces el promedio de las remuneraciones del convenio colectivo aplicable. La CSJN en \"Vizzoti\" (2004) declaró que el tope es inconstitucional si reduce la base en más del 33%: en ese caso la base mínima es el 67% de la mejor remuneración.",
          },
        },
        {
          "@type": "Question",
          "name": "¿Qué cambió con la reforma laboral 2026 (ley 27.802) en la indemnización por despido?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Para despidos desde el 06/03/2026 la base del art. 245 excluye expresamente el SAC y los conceptos de pago no mensual, el tope es de tres salarios promedio del convenio y la base nunca puede ser inferior al 67% de la remuneración (piso Vizzoti convertido en ley). Durante el período de prueba no hay preaviso. Los créditos laborales se actualizan por IPC más un 3% anual (art. 276 LCT).",
          },
        },
        {
          "@type": "Question",
          "name": "¿Siguen vigentes las multas de la ley 24.013, la ley 25.323 y el art. 80 LCT?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No para despidos posteriores al 09/07/2024: el art. 99 de la ley 27.742 (Ley Bases) derogó los arts. 8, 9, 10, 11 y 15 de la ley 24.013, el art. 1 de la ley 25.323 y la indemnización del art. 80 LCT (art. 45 ley 25.345). Sigue vigente el art. 2 de la ley 25.323, que agrega un 50% de las indemnizaciones de los arts. 232, 233 y 245 cuando el empleador, intimado fehacientemente, no paga.",
          },
        },
        {
          "@type": "Question",
          "name": "¿Esta calculadora reemplaza a un abogado?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Es una herramienta de estimación con la fórmula y la norma de cada rubro. Cada caso tiene particularidades (convenio, rubros no remunerativos, topes, intereses) que debe evaluar un abogado matriculado.",
          },
        },
      ],
    },
  ],
};

export default function IndemnizacionDespidoPage() {
  return (
    <div className="bg-paper-rules min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
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
          <div className="masthead-meta mb-2"><span>HERRAMIENTA GRATUITA · ACTUALIZADA A LA LEY 27.802 (REFORMA 2026) Y A LA LEY BASES</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-[-0.03em] text-[var(--brand-navy)]">
            Calculadora de indemnización por despido 2026 — Art. 245 LCT
          </h1>
          <p className="mt-2 max-w-[680px] text-[14px] text-[var(--brand-ink-2)]">
            Antigüedad, preaviso, integración del mes, SAC y vacaciones proporcionales, con el régimen que corresponde a
            la <strong>fecha del despido</strong>: anterior a la Ley Bases, Ley Bases (27.742) o Modernización Laboral (27.802).
            Cada rubro con su norma y su fórmula, listo para auditar.
          </p>
        </header>

        <CalcIndemnizacionPublica />

        <section className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <article className="card-editorial p-5">
            <h2 className="mb-2 font-[var(--font-display)] text-[15px] font-semibold text-[var(--brand-navy)]">¿Cómo se calcula?</h2>
            <p className="text-[12.5px] leading-relaxed text-[var(--brand-ink-2)]">
              La indemnización por antigüedad del art. 245 LCT equivale a un mes de la mejor remuneración mensual,
              normal y habitual por cada año de servicio o fracción mayor de 3 meses. Se suman preaviso (arts. 231/232),
              integración del mes (art. 233), SAC y vacaciones proporcionales.
            </p>
          </article>
          <article className="card-editorial p-5">
            <h2 className="mb-2 font-[var(--font-display)] text-[15px] font-semibold text-[var(--brand-navy)]">¿Qué cambió en 2024 y 2026?</h2>
            <p className="text-[12.5px] leading-relaxed text-[var(--brand-ink-2)]">
              La ley 27.742 (09/07/2024) derogó las multas de la ley 24.013, el art. 1 de la ley 25.323 y la
              indemnización del art. 80 LCT. La ley 27.802 (06/03/2026) excluyó el SAC de la base del art. 245, fijó el
              piso legal del 67 %, eliminó el preaviso en período de prueba y estableció la actualización por IPC + 3 %
              anual (art. 276 LCT). Esta calculadora elige el régimen por la fecha del despido.
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
        <div className="mt-4 flex justify-center">
          <PoweredBy />
        </div>
      </main>
    </div>
  );
}
