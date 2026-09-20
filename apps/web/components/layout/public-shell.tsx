import Link from "next/link";
import { PoweredBy } from "@/components/layout/powered-by";

/** Marco de las páginas públicas de herramientas (header + footer + disclaimer). */
export function PublicShell({
  children,
  jsonLd,
}: {
  children: React.ReactNode;
  jsonLd?: object;
}) {
  return (
    <div className="bg-paper-rules min-h-screen">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
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
        {children}
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
