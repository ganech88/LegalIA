import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { CalcPlazosPublica } from "@/components/calculadoras/calc-plazos-publica";

export const metadata: Metadata = {
  title: "Calculadora de plazos procesales 2026 — días hábiles, feria judicial y feriados | Gratis",
  description:
    "Calculá gratis el vencimiento de un plazo procesal en días hábiles judiciales: excluye fines de semana, feriados nacionales 2026 (incluidos los trasladables), feria de enero y feria de invierno (Acordada CSJN 11/2026). Plazo de gracia de 2 hs (CPCCN) o 4 hs (PBA).",
  keywords: [
    "calculadora plazos procesales",
    "días hábiles judiciales 2026",
    "feria judicial invierno 2026",
    "plazo de gracia art. 124 CPCCN",
    "cuándo vence contestar demanda",
    "plazo apelación laboral ley 18.345",
  ],
  alternates: { canonical: "/herramientas/plazos-procesales" },
  openGraph: {
    title: "Calculadora de plazos procesales 2026 — gratis",
    description: "Días hábiles judiciales con feria, feriados trasladables y plazo de gracia por jurisdicción.",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Calculadora de plazos procesales — LegalIA",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "ARS" },
      url: "https://www.legaliapp.com/herramientas/plazos-procesales",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Cuándo es la feria judicial de invierno 2026?",
          acceptedAnswer: { "@type": "Answer", text: "Del 20 al 31 de julio de 2026 para la justicia nacional y federal (Acordada CSJN 11/2026 del 2 de junio de 2026)." },
        },
        {
          "@type": "Question",
          name: "¿Cómo se cuentan los plazos procesales?",
          acceptedAnswer: { "@type": "Answer", text: "En días hábiles judiciales, sin contar el día de la notificación (art. 156 CPCCN). Se excluyen sábados, domingos, feriados nacionales y la feria judicial. El escrito puede presentarse en el plazo de gracia del día siguiente al vencimiento: dos primeras horas en el fuero nacional (art. 124 CPCCN) y cuatro en la provincia de Buenos Aires." },
        },
        {
          "@type": "Question",
          name: "¿Qué feriados se trasladan en 2026?",
          acceptedAnswer: { "@type": "Answer", text: "Güemes pasa del 17 al lunes 15 de junio; San Martín (17/08) y Diversidad Cultural (12/10) caen lunes; la Soberanía Nacional pasa del 20 al lunes 23 de noviembre (ley 27.399). Los días no laborables turísticos (23/03, 10/07, 07/12) se computan como hábiles salvo acordada." },
        },
      ],
    },
  ],
};

export default function PlazosProcesalesPage() {
  return (
    <PublicShell jsonLd={JSON_LD}>
      <header className="mb-8 border-b border-[var(--brand-navy)] pb-6">
        <div className="masthead-meta mb-2"><span>HERRAMIENTA GRATUITA · CALENDARIO JUDICIAL 2026</span></div>
        <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-[-0.03em] text-[var(--brand-navy)]">
          Calculadora de plazos procesales — días hábiles judiciales
        </h1>
        <p className="mt-2 max-w-[680px] text-[14px] text-[var(--brand-ink-2)]">
          Vencimiento exacto con feria de enero, feria de invierno 2026 (20 al 31 de julio), feriados nacionales y trasladables, y
          plazo de gracia según jurisdicción. Lista todos los días excluidos para que puedas auditarlos.
        </p>
      </header>

      <CalcPlazosPublica />

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        <article className="card-editorial p-5">
          <h2 className="mb-2 font-[var(--font-display)] text-[15px] font-semibold text-[var(--brand-navy)]">Plazos frecuentes</h2>
          <p className="text-[12.5px] leading-relaxed text-[var(--brand-ink-2)]">
            Contestar demanda ordinaria 15 días (art. 338 CPCCN), apelar 5 días (art. 244), contestar demanda laboral 10 días (art. 68 ley 18.345),
            apelar sentencia laboral 6 días fundada (art. 116 ley 18.345), aclaratoria 3 días.
          </p>
        </article>
        <article className="card-editorial p-5">
          <h2 className="mb-2 font-[var(--font-display)] text-[15px] font-semibold text-[var(--brand-navy)]">Días no laborables</h2>
          <p className="text-[12.5px] leading-relaxed text-[var(--brand-ink-2)]">
            Los puentes turísticos (23/03, 10/07 y 07/12 de 2026) se cuentan como hábiles con una advertencia: si la CSJN o la SCBA los declaran
            inhábiles por acordada, el vencimiento se corre un día. Criterio conservador: nunca vencer tarde.
          </p>
        </article>
        <article className="card-editorial p-5">
          <h2 className="mb-2 font-[var(--font-display)] text-[15px] font-semibold text-[var(--brand-navy)]">Para abogados</h2>
          <p className="text-[12.5px] leading-relaxed text-[var(--brand-ink-2)]">
            Con LegalIA sacale una foto a la cédula: detecta el acto, la fecha y el plazo, y lo agenda con alerta por email. El expediente
            entero, sin claves del PJN.
          </p>
        </article>
      </section>
    </PublicShell>
  );
}
