import Link from "next/link";

/**
 * Contenedor estándar de página del workspace: topbar con migas + padding.
 * Evita que el contenido quede pegado al borde y debajo del botón de menú
 * móvil (que es fijo en la esquina superior izquierda).
 */
export function PageShell({
  crumbs,
  children,
  className = "",
}: {
  crumbs: { label: string; href?: string }[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="sticky top-0 z-20 flex items-center border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 pl-16 lg:pl-10 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          {crumbs.map((c, i) => (
            <span key={`${c.label}-${i}`} className="flex items-center gap-2">
              {i > 0 && <span className="opacity-40">/</span>}
              {c.href ? (
                <Link href={c.href} className="hover:text-[var(--brand-navy)]">{c.label}</Link>
              ) : (
                <span className={i === crumbs.length - 1 ? "font-medium text-[var(--brand-ink)]" : ""}>{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      </header>
      <div className={`px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8 ${className}`}>{children}</div>
    </div>
  );
}
