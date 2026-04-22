import Link from "next/link";

const SECCIONES = [
  {
    num: "I",
    titulo: "Codigos y Leyes",
    desc: "LCT 20.744, CCCN, CPCCN, LRT 24.557 y mas. Texto completo navegable por articulo.",
    href: "/biblioteca/codigos",
    items: "4 cuerpos normativos",
  },
  {
    num: "II",
    titulo: "Jurisprudencia",
    desc: "Fallos destacados de CSJN, CNAT y SCBA. Sumarios con voces y referencias.",
    href: "/biblioteca/jurisprudencia",
    items: "8 fallos cargados",
  },
  {
    num: "III",
    titulo: "Busqueda Semantica",
    desc: "Busca por concepto en todo el corpus legal: leyes, articulos y fallos.",
    href: "/biblioteca/busqueda",
    items: "Corpus completo",
  },
];

export default function BibliotecaPage() {
  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="sticky top-0 z-20 flex items-center border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <span>Workspace</span>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Biblioteca</span>
        </nav>
      </header>
      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
        <header className="mb-8 pb-6 border-b border-[var(--brand-navy)]">
          <div className="masthead-meta mb-2"><span>CORPUS LEGAL</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(2rem,4vw,2.5rem)] font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
            Biblioteca juridica
          </h1>
          <p className="mt-2 text-[14px] text-[var(--brand-ink-2)] max-w-[600px]">
            Accede al corpus legal argentino: codigos, leyes, jurisprudencia y busqueda semantica. Contenido verificado y actualizado.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SECCIONES.map(s => (
            <Link key={s.href} href={s.href} className="group card-editorial p-6 block transition-all hover:border-[var(--brand-gold)] hover:-translate-y-0.5">
              <div className="font-[var(--font-display)] text-3xl font-semibold italic text-[var(--brand-gold)] mb-3">{s.num}</div>
              <h3 className="font-[var(--font-display)] text-[17px] font-semibold text-[var(--brand-navy)] leading-tight mb-1.5">{s.titulo}</h3>
              <p className="text-[12px] text-[var(--brand-mute)] leading-relaxed mb-3">{s.desc}</p>
              <div className="font-mono text-[10px] text-[var(--brand-gold)] uppercase tracking-wider">{s.items}</div>
              <div className="mt-4 pt-3 border-t border-border text-[11px] text-[var(--brand-navy)] font-semibold">
                Explorar →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
