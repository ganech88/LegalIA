import Link from "next/link";

export const metadata = {
  title: "Términos y Condiciones — LegalIA",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-[760px] px-6 py-16">
        <Link href="/" className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)] hover:text-[var(--brand-navy)]">
          ← Volver a LegalIA
        </Link>

        <h1 className="mt-6 font-[var(--font-display)] text-4xl font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
          Términos y Condiciones
        </h1>
        <p className="mt-2 text-[13px] text-[var(--brand-mute)]">Última actualización: junio de 2026</p>

        <div className="prose-legal mt-8 space-y-6 text-[14px] leading-[1.75] text-[var(--brand-ink-2)]">
          <Section n="1" title="Objeto y aceptación">
            LegalIA es una herramienta de asistencia para profesionales del derecho que facilita la
            redacción de escritos, consultas sobre legislación y cálculos legales. Al crear una cuenta
            o usar el servicio, aceptás estos Términos. Si no estás de acuerdo, no utilices la plataforma.
          </Section>

          <Section n="2" title="Uso profesional">
            El servicio está destinado exclusivamente a abogados/as matriculados/as y profesionales del
            derecho. No se ofrece asesoramiento legal a personas que no revistan esa calidad. El usuario
            declara contar con la matrícula habilitante correspondiente.
          </Section>

          <Section n="3" title="Carácter de asistencia — responsabilidad profesional">
            <strong>LegalIA NO sustituye el criterio profesional.</strong> Los escritos, respuestas y
            cálculos son generados con asistencia de inteligencia artificial y pueden contener errores,
            omisiones o información desactualizada. El usuario es el único responsable de revisar,
            verificar y validar todo contenido —incluidas citas de normas y jurisprudencia, montos y
            plazos— antes de utilizarlo o presentarlo ante cualquier autoridad. LegalIA no es parte de
            la relación profesional entre el abogado/a y su cliente.
          </Section>

          <Section n="4" title="Planes, pagos y cancelación">
            Los planes pagos se facturan por mes de forma anticipada a través de Mercado Pago. Podés
            cancelar la suscripción en cualquier momento; la cancelación surte efecto al finalizar el
            período ya abonado, sin reembolsos por períodos en curso, salvo lo que exija la normativa
            de defensa del consumidor. Los límites de uso de cada plan se informan en la página de precios.
          </Section>

          <Section n="5" title="Propiedad del contenido">
            Los escritos y datos que ingresás y generás te pertenecen. LegalIA no reclama titularidad
            sobre ellos. Conservás la responsabilidad sobre la licitud de los datos que cargás.
          </Section>

          <Section n="6" title="Limitación de responsabilidad">
            En la máxima medida permitida por la ley, LegalIA no será responsable por daños derivados
            del uso del contenido generado, incluyendo decisiones procesales, vencimientos, montos
            reclamados o citas legales. El servicio se presta &ldquo;tal cual&rdquo; y según disponibilidad.
          </Section>

          <Section n="7" title="Datos personales">
            El tratamiento de datos se rige por nuestra{" "}
            <Link href="/privacidad" className="text-[var(--brand-navy)] underline">Política de Privacidad</Link>,
            en cumplimiento de la Ley 25.326 de Protección de los Datos Personales.
          </Section>

          <Section n="8" title="Modificaciones">
            Podemos actualizar estos Términos. Te notificaremos los cambios sustanciales. El uso
            continuado implica la aceptación de la versión vigente.
          </Section>

          <p className="border-t border-border pt-6 text-[12px] text-[var(--brand-mute)]">
            Este documento es una base general y debe ser revisado por un profesional antes del
            lanzamiento comercial para adecuarlo a la operación definitiva.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-[var(--font-display)] text-[18px] font-semibold text-[var(--brand-navy)]">
        {n}. {title}
      </h2>
      <p className="mt-2">{children}</p>
    </section>
  );
}
