"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  { num: "I", title: "Generador de escritos", desc: "Demandas laborales, cartas documento, contestaciones y recursos. Formato procesal argentino correcto por jurisdiccion — CABA, PBA y nacional." },
  { num: "II", title: "Asistente legal IA", desc: "Consulta sobre la LCT, CCCN, CPCCN y mas. Respuestas con citas de articulos reales. Sin alucinaciones, con fuentes verificables." },
  { num: "III", title: "Calculadoras legales", desc: "Indemnizacion art. 245, ART, intereses BNA/CNAT, actualizacion por IPC y RIPTE. Indices actualizados." },
];

const PLANS = [
  { name: "Gratis", price: "$0", highlights: ["3 escritos/mes", "20 consultas IA", "Calculadoras basicas"] },
  { name: "Profesional", price: "$12.000/mes", featured: true, highlights: ["30 escritos/mes", "Consultas IA ilimitadas", "Todas las calculadoras", "Mini CRM de casos"] },
  { name: "Estudio", price: "$25.000/mes", highlights: ["Escritos ilimitados", "Hasta 5 usuarios", "Prioridad de soporte", "Branding personalizado"] },
];

function formatDateAR(date: Date): string {
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Navigation ─────────────────────────────────── */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[var(--background)]/90 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      )}>
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded bg-[var(--brand-navy)] font-serif text-xl font-bold italic text-[var(--brand-gold)]">L</div>
            <span className="font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)]">LegalIA</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-[var(--brand-ink-2)] hover:text-[var(--brand-navy)]">Funciones</a>
            <a href="#pricing" className="text-sm font-medium text-[var(--brand-ink-2)] hover:text-[var(--brand-navy)]">Precios</a>
          </nav>
          <div className="hidden gap-3 md:flex">
            <Link href="/login" className="rounded border border-[var(--brand-navy)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--brand-navy)] hover:bg-[var(--brand-paper)]">
              Ingresar
            </Link>
            <Link href="/register" className="rounded bg-[var(--brand-navy)] px-5 py-2 text-sm font-bold text-white hover:bg-[var(--brand-navy-2)]">
              Empezar gratis
            </Link>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded text-[var(--brand-navy)] md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="border-b border-border bg-white/95 backdrop-blur-xl px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <a href="#features" onClick={() => setMobileMenu(false)} className="text-sm font-medium text-[var(--brand-ink-2)]">Funciones</a>
              <a href="#pricing" onClick={() => setMobileMenu(false)} className="text-sm font-medium text-[var(--brand-ink-2)]">Precios</a>
              <div className="flex gap-3 pt-2 border-t border-border">
                <Link href="/login" className="flex-1 rounded border border-border py-2 text-center text-sm font-medium">Ingresar</Link>
                <Link href="/register" className="flex-1 rounded bg-[var(--brand-navy)] py-2 text-center text-sm font-bold text-white">Registrarse</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ── Hero ──────────────────────────────────── */}
        <section className="border-b-[3px] border-double border-[var(--brand-navy)] pb-16 pt-28 md:pt-36">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <div className="masthead-meta mb-6">
              <span>BUENOS AIRES · AR</span>
              <span>{formatDateAR(new Date()).toUpperCase()}</span>
              <span>ED. PUBLICA</span>
            </div>
            <h1 className="font-[var(--font-display)] text-[clamp(2.5rem,7vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-[var(--brand-navy)] max-w-[1000px]">
              La herramienta<br />
              <em className="italic text-[var(--brand-gold)]">editorial</em> del abogado<br />
              argentino moderno.
            </h1>
            <p className="mt-8 max-w-[640px] text-[18px] leading-[1.6] text-[var(--brand-ink-2)]">
              Genera escritos con formato procesal, consulta legislacion argentina con citas verificadas, calcula indemnizaciones y gestiona tus expedientes. Todo con IA entrenada en derecho argentino.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/register" className="rounded bg-[var(--brand-navy)] px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-[var(--brand-navy-2)]">
                Probar gratis →
              </Link>
              <a href="#features" className="rounded border border-[var(--brand-navy)] bg-transparent px-6 py-3.5 text-[15px] font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-paper-2)]">
                Ver funciones
              </a>
            </div>
            <div className="mt-6 text-[12px] text-[var(--brand-mute)]">
              3 escritos gratis al mes · sin tarjeta · cancela cuando quieras
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────── */}
        <section id="features" className="py-20">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <header className="text-center mb-12">
              <div className="t-overline text-[var(--brand-gold)] mb-2">◆ FUNCIONES</div>
              <h2 className="font-[var(--font-display)] text-5xl font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
                Todo lo que necesitas
              </h2>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border bg-white rounded overflow-hidden">
              {FEATURES.map((f, i) => (
                <div key={f.num} className={cn("p-8 border-r border-border last:border-r-0", i < FEATURES.length - 1 && "md:border-b-0 border-b")}>
                  <div className="font-[var(--font-display)] text-3xl font-semibold italic text-[var(--brand-gold)] mb-3">{f.num}</div>
                  <h3 className="font-[var(--font-display)] text-[17px] font-semibold text-[var(--brand-navy)] leading-tight mb-2">{f.title}</h3>
                  <p className="text-[13px] text-[var(--brand-ink-2)] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────── */}
        <section id="pricing" className="py-20 bg-[var(--brand-paper-2)]">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <header className="text-center mb-12">
              <div className="t-overline text-[var(--brand-gold)] mb-2">◆ PRECIOS</div>
              <h2 className="font-[var(--font-display)] text-5xl font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
                Planes que escalan con tu estudio
              </h2>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border bg-white rounded overflow-hidden">
              {PLANS.map((plan) => (
                <div key={plan.name} className={cn(
                  "relative p-8 border-r border-border last:border-r-0",
                  plan.featured && "bg-[var(--brand-paper)]"
                )}>
                  {plan.featured && (
                    <>
                      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--brand-gold)]" />
                      <div className="absolute top-3 right-3 rounded-full bg-[var(--brand-gold)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-navy)]">
                        Mas elegido
                      </div>
                    </>
                  )}
                  <div className="t-overline text-[var(--brand-mute)] mb-2">{plan.name.toUpperCase()}</div>
                  <div className="font-[var(--font-display)] text-4xl font-semibold text-[var(--brand-navy)] mb-6 tracking-[-0.02em]">
                    {plan.price}
                  </div>
                  <ul className="space-y-2.5 mb-8">
                    {plan.highlights.map(h => (
                      <li key={h} className="flex gap-2 text-[13px] text-[var(--brand-ink-2)]">
                        <span className="text-[var(--brand-gold)]">§</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className={cn(
                    "block w-full rounded px-4 py-2.5 text-sm font-semibold text-center",
                    plan.featured
                      ? "bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy-2)]"
                      : "border border-[var(--brand-navy)] text-[var(--brand-navy)] hover:bg-[var(--brand-paper-2)]"
                  )}>
                    Empezar con {plan.name} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────── */}
        <section className="py-20">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10 text-center">
            <h2 className="font-[var(--font-display)] text-4xl font-semibold text-[var(--brand-navy)] tracking-[-0.03em] mb-4">
              Empeza hoy, gratis
            </h2>
            <p className="text-[16px] text-[var(--brand-ink-2)] max-w-[500px] mx-auto mb-8">
              3 escritos al mes sin tarjeta de credito. Sin compromiso. Cancela cuando quieras.
            </p>
            <Link href="/register" className="inline-block rounded bg-[var(--brand-navy)] px-8 py-4 text-[16px] font-semibold text-white hover:bg-[var(--brand-navy-2)]">
              Crear cuenta gratis →
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="bg-[var(--brand-navy)] text-white py-12">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded bg-[var(--brand-gold)] font-serif text-xl font-bold italic text-[var(--brand-navy)]">L</div>
              <span className="font-[var(--font-display)] text-lg font-semibold">LegalIA</span>
            </div>
            <div className="flex flex-wrap gap-6 text-[13px] text-white/60">
              <a href="#features" className="hover:text-white">Funciones</a>
              <a href="#pricing" className="hover:text-white">Precios</a>
              <Link href="/login" className="hover:text-white">Ingresar</Link>
              <Link href="/register" className="hover:text-white">Registrarse</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-[11px] text-white/40">
            <p>© 2026 Desarrollo sin Fronteras. Todos los derechos reservados.</p>
            <p>LegalIA es una herramienta de asistencia. El abogado es responsable de revisar todo contenido generado.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
