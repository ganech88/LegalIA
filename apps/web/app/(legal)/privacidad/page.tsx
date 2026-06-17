import Link from "next/link";

export const metadata = {
  title: "Política de Privacidad — LegalIA",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-[760px] px-6 py-16">
        <Link href="/" className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)] hover:text-[var(--brand-navy)]">
          ← Volver a LegalIA
        </Link>

        <h1 className="mt-6 font-[var(--font-display)] text-4xl font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
          Política de Privacidad
        </h1>
        <p className="mt-2 text-[13px] text-[var(--brand-mute)]">
          Ley 25.326 de Protección de los Datos Personales · Última actualización: junio de 2026
        </p>

        <div className="mt-8 space-y-6 text-[14px] leading-[1.75] text-[var(--brand-ink-2)]">
          <Section n="1" title="Responsable del tratamiento">
            El responsable de la base de datos es Desarrollo sin Fronteras (LegalIA). Para consultas
            sobre tus datos podés escribirnos a privacidad@legalia.com.ar.
          </Section>

          <Section n="2" title="Qué datos recopilamos">
            (a) Datos de cuenta: nombre, email, matrícula, colegio, especialidad y jurisdicción.
            (b) Contenido que cargás: datos de casos, partes, hechos y escritos. Estos pueden incluir
            datos personales de terceros (tus clientes y contrapartes).
            (c) Datos de uso: métricas de la plataforma para facturación y mejora del servicio.
          </Section>

          <Section n="3" title="Vos sos responsable de los datos de tus clientes">
            Respecto de los datos personales de terceros que ingresás, actuás como responsable del
            tratamiento y LegalIA como encargado (art. 25, Ley 25.326). Debés contar con base legal
            para tratarlos y para incorporarlos a la plataforma, y respetar el secreto profesional.
          </Section>

          <Section n="4" title="Para qué los usamos">
            Para prestar el servicio (generar escritos, responder consultas, calcular), gestionar tu
            suscripción, dar soporte y cumplir obligaciones legales. No vendemos tus datos ni los de
            tus clientes.
          </Section>

          <Section n="5" title="Proveedores e inteligencia artificial">
            Para generar contenido utilizamos proveedores de modelos de IA y de infraestructura
            (alojamiento, base de datos, pagos). El contenido que enviás se procesa para producir la
            respuesta. Seleccionamos proveedores con compromisos de confidencialidad y, para escritos,
            priorizamos aquellos que no utilizan los datos para entrenar sus modelos. Verificá el plan
            vigente si procesás datos especialmente sensibles.
          </Section>

          <Section n="6" title="Conservación">
            Conservamos tus datos mientras tu cuenta esté activa y por los plazos legales aplicables.
            Al eliminar tu cuenta, suprimimos tus escritos, consultas y casos (ver punto 8).
          </Section>

          <Section n="7" title="Seguridad">
            Aplicamos cifrado en tránsito y en reposo, control de acceso por usuario (aislamiento por
            fila) y buenas prácticas de seguridad. Ningún sistema es 100% infalible; te pedimos cuidar
            tus credenciales.
          </Section>

          <Section n="8" title="Tus derechos (acceso, rectificación, supresión)">
            Podés acceder, rectificar, actualizar y suprimir tus datos. Desde{" "}
            <Link href="/config" className="text-[var(--brand-navy)] underline">Configuración</Link>{" "}
            podés editar tu perfil y eliminar tu cuenta y todos sus datos. También podés escribirnos.
            La AAIP (Agencia de Acceso a la Información Pública) es la autoridad de control y podés
            presentar reclamos ante ella.
          </Section>

          <Section n="9" title="Cambios">
            Podemos actualizar esta política. Te avisaremos los cambios sustanciales.
          </Section>

          <p className="border-t border-border pt-6 text-[12px] text-[var(--brand-mute)]">
            Este documento es una base general y debe ser revisado por un profesional antes del
            lanzamiento comercial. Los datos de contacto son de ejemplo y deben reemplazarse por los reales.
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
