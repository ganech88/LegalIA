import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { CalcActualizacionPublica } from "@/components/calculadoras/calc-actualizacion-publica";

export const metadata: Metadata = {
  title: "Actualización de créditos laborales ley 27.802 — IPC + 3 % (art. 276 LCT) | Calculadora gratis",
  description:
    "Calculá gratis la actualización de un crédito laboral según la reforma laboral 2026 (ley 27.802): IPC del INDEC + 3 % anual (art. 276 LCT) y la banda del art. 55 para juicios en trámite. Con el valor y la fecha de cada dato oficial.",
  keywords: [
    "actualización créditos laborales ley 27.802",
    "art. 276 LCT IPC más 3%",
    "art. 55 ley 27.802 tasa pasiva",
    "cómo se actualiza una indemnización 2026",
    "intereses laborales reforma 2026",
    "calculadora IPC más 3 por ciento",
  ],
  alternates: { canonical: "/herramientas/actualizacion-ley-27802" },
  openGraph: {
    title: "Actualización de créditos laborales ley 27.802 — calculadora gratis",
    description: "IPC + 3 % anual (art. 276 LCT) y banda del art. 55, con datos oficiales del INDEC.",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Calculadora de actualización ley 27.802 — LegalIA",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "ARS" },
      url: "https://www.legaliapp.com/herramientas/actualizacion-ley-27802",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Cómo se actualizan los créditos laborales desde la ley 27.802?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "El nuevo art. 276 de la LCT dispone que los créditos laborales se actualizan por la variación del IPC Nivel General del INDEC, desde que cada suma es debida hasta el efectivo pago, con más una tasa de interés pura del 3 % anual.",
          },
        },
        {
          "@type": "Question",
          name: "¿Qué pasa con los juicios que ya estaban en trámite?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "El art. 55 de la ley 27.802 aplica la tasa pasiva del BCRA con un techo en IPC + 3 % y un piso del 67 % de ese techo. La CNAT Sala I y la Cámara del Trabajo de Córdoba lo declararon inconstitucional y aplicaron IPC + 3 % pleno; otras Salas lo aplican. Conviene liquidar de las dos formas.",
          },
        },
        {
          "@type": "Question",
          name: "¿Sigue vigente la capitalización del Acta CNAT 2764?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. La CSJN la descalificó en Oliva c/ Coma (29/02/2024) y la ley 27.802 fijó el nuevo régimen del art. 276 LCT.",
          },
        },
      ],
    },
  ],
};

export default function ActualizacionLey27802Page() {
  return (
    <PublicShell jsonLd={JSON_LD}>
      <header className="mb-8 border-b border-[var(--brand-navy)] pb-6">
        <div className="masthead-meta mb-2"><span>HERRAMIENTA GRATUITA · REFORMA LABORAL 2026</span></div>
        <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-[-0.03em] text-[var(--brand-navy)]">
          Actualización de créditos laborales — ley 27.802 (IPC + 3 %)
        </h1>
        <p className="mt-2 max-w-[680px] text-[14px] text-[var(--brand-ink-2)]">
          El art. 276 LCT según la ley 27.802 actualiza los créditos laborales por <strong>IPC del INDEC más un 3 % anual</strong>.
          Esta calculadora usa la serie oficial en vivo y muestra el valor y la fecha de cada dato, para que la liquidación sea auditable.
          Incluye la banda del <strong>art. 55</strong> para juicios en trámite.
        </p>
      </header>

      <CalcActualizacionPublica />

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        <article className="card-editorial p-5">
          <h2 className="mb-2 font-[var(--font-display)] text-[15px] font-semibold text-[var(--brand-navy)]">Art. 276 LCT (casos nuevos)</h2>
          <p className="text-[12.5px] leading-relaxed text-[var(--brand-ink-2)]">
            Capital × (IPC final / IPC inicial) + 3 % anual sobre el capital actualizado, desde que cada suma es debida y hasta el pago.
            Reemplaza la discusión sobre tasas activas y la capitalización del Acta 2764.
          </p>
        </article>
        <article className="card-editorial p-5">
          <h2 className="mb-2 font-[var(--font-display)] text-[15px] font-semibold text-[var(--brand-navy)]">Art. 55 (juicios en trámite)</h2>
          <p className="text-[12.5px] leading-relaxed text-[var(--brand-ink-2)]">
            Tasa pasiva BCRA con techo en IPC + 3 % y piso del 67 % del techo. Con impugnaciones de constitucionalidad en varias Salas de la CNAT:
            presentá ambas liquidaciones y planteá la inconstitucionalidad en subsidio.
          </p>
        </article>
        <article className="card-editorial p-5">
          <h2 className="mb-2 font-[var(--font-display)] text-[15px] font-semibold text-[var(--brand-navy)]">Para abogados</h2>
          <p className="text-[12.5px] leading-relaxed text-[var(--brand-ink-2)]">
            Con LegalIA la actualización entra directo en la demanda como anexo auditable, junto con la liquidación del art. 245 según el régimen
            de la fecha del despido y el semáforo de citas contra la ley completa.
          </p>
        </article>
      </section>
    </PublicShell>
  );
}
