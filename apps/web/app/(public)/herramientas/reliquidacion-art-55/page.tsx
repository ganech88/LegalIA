import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { CalcArt55 } from "@/components/calculadoras/calc-art55";

export const metadata: Metadata = {
  title: "Calculadora art. 55 ley 27.802 — tasa pasiva BCRA, techo y piso (fallo Cabana Opanasiuk) | Gratis",
  description:
    "Reliquidá gratis un crédito laboral en un juicio en trámite según el art. 55 de la ley 27.802: tasa pasiva del BCRA, techo IPC + 3 % y piso del 67 %, con las dos lecturas del piso y el anexo listo para presentar. Actualizada al fallo de la Corte del 05/11/2026.",
  keywords: [
    "calculadora art 55 ley 27.802",
    "tasa pasiva BCRA juicios laborales",
    "Cabana Opanasiuk",
    "reliquidación créditos laborales",
    "piso 67% art 55",
    "intereses juicios laborales en trámite 2026",
  ],
  alternates: { canonical: "/herramientas/reliquidacion-art-55" },
  openGraph: {
    title: "Calculadora art. 55 ley 27.802 — juicios laborales en trámite",
    description: "Tasa pasiva BCRA, techo IPC + 3 % y piso del 67 %, con anexo auditable.",
  },
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "¿A qué juicios se aplica el art. 55 de la ley 27.802?",
    a: "A los juicios por créditos de relaciones individuales de trabajo que al 6 de marzo de 2026 estaban en trámite y sin sentencia definitiva, incluidos los recursos de queja pendientes. Los créditos posteriores se rigen por el art. 276 LCT (IPC + 3 % anual).",
  },
  {
    q: "¿Qué resolvió la Corte Suprema en Cabana Opanasiuk?",
    a: "El 5 de noviembre de 2026 la Corte dejó sin efecto ocho sentencias de la Sala II de la Cámara Nacional de Apelaciones del Trabajo que actualizaban por IPC + 3 % y ordenó dictar nuevos fallos conforme al art. 55. No se pronunció sobre la constitucionalidad de la prohibición de indexar: la consideró una cuestión inoficiosa frente a la nueva ley.",
  },
  {
    q: "¿Cómo se calcula?",
    a: "Primero se aplica al capital la tasa pasiva que publica el BCRA para estos juicios. Después se calcula el techo: capital actualizado por IPC del INDEC más 3 % anual. El resultado de la tasa pasiva no puede superar ese techo ni quedar por debajo del 67 % de ese cálculo.",
  },
  {
    q: "¿El piso del 67 % se calcula sobre el total o sobre el ajuste?",
    a: "Hay dos lecturas. Una toma el 67 % del importe total del inciso b, capital incluido. La otra, que usa la calculadora del BCRA, suma al capital el 67 % del ajuste. Esta herramienta muestra las dos y avisa cuando llevan a importes distintos.",
  },
  {
    q: "¿De dónde salen los datos?",
    a: "La tasa pasiva, de la serie diaria que publica el BCRA (Resolución de Directorio 45/26). El IPC, de la serie oficial del INDEC. Cada resultado indica la fecha de los datos usados.",
  },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Calculadora art. 55 ley 27.802 — LegalIA",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "ARS" },
      url: "https://www.legaliapp.com/herramientas/reliquidacion-art-55",
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function ReliquidacionArt55Page() {
  return (
    <PublicShell jsonLd={JSON_LD}>
      <header className="mb-8 border-b border-[var(--brand-navy)] pb-6">
        <div className="masthead-meta mb-2"><span>HERRAMIENTA GRATUITA · JUICIOS LABORALES EN TRÁMITE</span></div>
        <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-[-0.03em] text-[var(--brand-navy)]">
          Calculadora art. 55 ley 27.802: tasa pasiva, techo y piso
        </h1>
        <p className="mt-2 max-w-[700px] text-[14px] text-[var(--brand-ink-2)]">
          Desde el fallo <strong>«Cabana Opanasiuk c/ Unir S.A.»</strong> (CSJN, 05/11/2026) los juicios laborales que estaban en trámite al
          entrar en vigencia la reforma se liquidan por el art. 55. Esta calculadora toma la tasa pasiva del BCRA y el IPC del INDEC,
          muestra los tres números y te dice cuál rige.
        </p>
      </header>

      <CalcArt55 />

      <section className="mt-12">
        <h2 className="mb-4 font-[var(--font-display)] text-xl font-semibold text-[var(--brand-navy)]">Preguntas frecuentes</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {FAQ.map((f) => (
            <article key={f.q} className="card-editorial p-5">
              <h3 className="mb-2 font-[var(--font-display)] text-[15px] font-semibold text-[var(--brand-navy)]">{f.q}</h3>
              <p className="text-[12.5px] leading-relaxed text-[var(--brand-ink-2)]">{f.a}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 text-[13px] text-[var(--brand-ink-2)]">
          ¿El crédito es posterior a la reforma? Usá la{" "}
          <Link href="/herramientas/actualizacion-ley-27802" className="font-semibold text-[var(--brand-navy)] underline underline-offset-2">
            calculadora del art. 276 LCT (IPC + 3 %)
          </Link>.
        </p>
      </section>
    </PublicShell>
  );
}
