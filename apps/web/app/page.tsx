import Link from "next/link";
import { Scale, ArrowRight, CheckCircle2, Star, Shield, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FEATURES,
  TESTIMONIALS,
  PLANS,
  STATS,
  LEGAL_TAGS,
  STORY_STATS,
} from "@/lib/landing-data";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* ── Navigation ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-[#faf9f7]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e3a5f]">
              <Scale className="h-[1.125rem] w-[1.125rem] text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#0f172a]">
              Legal<span className="text-[#d97706]">IA</span>
            </span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            {["#features", "#testimonials", "#pricing"].map((href, i) => (
              <a key={href} href={href} className="text-sm font-medium text-slate-600 transition-colors hover:text-[#1e3a5f]">
                {["Funciones", "Testimonios", "Precios"][i]}
              </a>
            ))}
          </nav>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium text-slate-700 hover:text-[#1e3a5f]">Ingresar</Button>
            </Link>
            <Link href="/register">
              <button className="btn-shimmer rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: "#d97706" }}>
                Empezar gratis
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pb-24 pt-20 md:pb-32 md:pt-28">
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(30,58,95,0.08) 0%, transparent 70%)" }} />
          <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #d97706 0%, transparent 70%)" }} />

          <div className="relative mx-auto max-w-6xl px-4 text-center">
            <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-slate-600">+150.000 abogados matriculados en Argentina</span>
            </div>

            <h1 className="animate-fade-in-up delay-100 text-5xl font-extrabold tracking-tight text-[#0f172a] md:text-6xl lg:text-7xl">
              La IA que entiende{" "}
              <br className="hidden sm:block" />
              <span className="gradient-text">el derecho argentino</span>
            </h1>

            <p className="animate-fade-in-up delay-200 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-500 md:text-xl">
              Generá escritos judiciales listos para presentar y consultá sobre legislación con citas de artículos reales. Sin alucinaciones. Sin ChatGPT genérico.
            </p>

            <div className="animate-fade-in-up delay-300 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <button className="btn-shimmer inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-bold text-white shadow-lg" style={{ background: "#d97706" }}>
                  Empezar gratis — sin tarjeta
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="rounded-xl border-slate-300 px-7 text-base font-medium text-slate-700">
                  Ver cómo funciona
                </Button>
              </Link>
            </div>

            <div className="animate-fade-in-up delay-500 mt-10 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500">
              {[
                { icon: Shield,       text: "Datos encriptados" },
                { icon: Zap,          text: "Escrito en 30 segundos" },
                { icon: CheckCircle2, text: "Artículos verificados" },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5 font-medium">
                  <Icon className="h-3.5 w-3.5 text-[#d97706]" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats bar ───────────────────────────────────────── */}
        <section className="border-y border-slate-200 bg-white py-8">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="animate-fade-in text-center">
                <div className="text-3xl font-extrabold text-[#1e3a5f]">{value}</div>
                <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ────────────────────────────────────────── */}
        <section id="features" className="py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-14 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#d97706]">Funcionalidades</p>
              <h2 className="animate-fade-in-up text-4xl font-extrabold text-[#0f172a]">
                Todo lo que necesitás, nada de lo que no
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {FEATURES.map((feat, i) => (
                <div key={feat.title} className={`card-hover animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-7 shadow-sm delay-${(i + 1) * 100}`}>
                  <div className={`mb-5 flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-xl ${feat.bg}`}>
                    <feat.icon className={`h-6 w-6 ${feat.iconColor}`} />
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-[#0f172a]">{feat.title}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${feat.tag === "Disponible" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {feat.tag}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{feat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── About / Story ───────────────────────────────────── */}
        <section className="bg-[#0f172a] py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid items-center gap-16 md:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#d97706]">Por qué existimos</p>
                <h2 className="text-4xl font-extrabold leading-tight text-white">
                  El derecho argentino es complejo.{" "}
                  <span className="gradient-text-amber">Tu herramienta no debería serlo.</span>
                </h2>
                <p className="mt-5 text-base leading-relaxed text-slate-400">
                  Cuando un abogado usa ChatGPT para un escrito laboral, arriesga presentar jurisprudencia inexistente o artículos incorrectos. LegalIA fue construida sobre la base de la LCT, el CCCN, el CPCCN y más de 50 convenios colectivos — con actualizaciones constantes.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {LEGAL_TAGS.map((tag) => (
                    <span key={tag} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {STORY_STATS.map(({ label, value, colorClass }) => (
                  <div key={label} className={`rounded-xl border border-slate-700 bg-slate-800 p-5 border-l-4 ${colorClass}`}>
                    <div className="text-3xl font-extrabold text-white">{value}</div>
                    <div className="mt-1 text-xs text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ────────────────────────────────────── */}
        <section id="testimonials" className="py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-14 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#d97706]">Testimonios</p>
              <h2 className="text-4xl font-extrabold text-[#0f172a]">Lo que dicen nuestros usuarios</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <div key={t.name} className={`card-hover animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-7 shadow-sm delay-${(i + 1) * 100}`}>
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, si) => (
                      <Star key={si} className="h-4 w-4 fill-[#d97706] text-[#d97706]" />
                    ))}
                  </div>
                  <blockquote className="text-sm leading-relaxed text-slate-600">&ldquo;{t.quote}&rdquo;</blockquote>
                  <div className="mt-5 flex items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${t.color} text-xs font-bold text-white`}>{t.initials}</div>
                    <div>
                      <div className="text-sm font-semibold text-[#0f172a]">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-8 opacity-50">
              {["CPACF", "CASI", "CALM", "CALP", "SCBA"].map((org) => (
                <span key={org} className="flex items-center gap-1.5 text-sm font-bold text-slate-400">
                  <Users className="h-3.5 w-3.5" />
                  {org}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ─────────────────────────────────────────── */}
        <section id="pricing" className="bg-slate-50 py-24">
          <div className="mx-auto max-w-5xl px-4">
            <div className="mb-14 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#d97706]">Precios</p>
              <h2 className="text-4xl font-extrabold text-[#0f172a]">Transparente y sin sorpresas</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {PLANS.map((plan, i) => (
                <div key={plan.name} className={`animate-fade-in-up rounded-2xl border p-7 delay-${(i + 1) * 100} ${plan.highlighted ? "border-[#d97706] bg-[#1e3a5f] shadow-xl" : "border-slate-200 bg-white shadow-sm"}`}>
                  {plan.highlighted && (
                    <div className="mb-4 inline-block rounded-full bg-[#d97706] px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-white">Más popular</div>
                  )}
                  <div className={`text-sm font-semibold ${plan.highlighted ? "text-slate-300" : "text-slate-500"}`}>{plan.name}</div>
                  <div className="mt-2 flex items-end gap-1">
                    <span className={`text-4xl font-extrabold ${plan.highlighted ? "text-white" : "text-[#0f172a]"}`}>{plan.price}</span>
                    <span className={`mb-1 text-sm ${plan.highlighted ? "text-slate-400" : "text-slate-500"}`}>{plan.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlighted ? "text-[#fbbf24]" : "text-[#d97706]"}`} />
                        <span className={`text-sm ${plan.highlighted ? "text-slate-300" : "text-slate-600"}`}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className="mt-8 block">
                    <button className={`w-full rounded-xl py-3 text-sm font-bold transition-all duration-200 ${plan.highlighted ? "btn-shimmer text-white" : "border border-slate-300 text-slate-700 hover:border-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white"}`} style={plan.highlighted ? { background: "#d97706" } : undefined}>
                      {plan.cta}
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ───────────────────────────────────────── */}
        <section className="py-24">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-4xl font-extrabold text-[#0f172a] md:text-5xl">
              Empezá hoy, <span className="gradient-text">sin riesgo</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-500">
              Registrate gratis en 60 segundos. Sin tarjeta de crédito. Sin compromiso.
            </p>
            <Link href="/register" className="mt-8 inline-block">
              <button className="btn-shimmer inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-bold text-white shadow-xl" style={{ background: "#d97706" }}>
                Crear cuenta gratis
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-[#0f172a] py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e3a5f]">
                  <Scale className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Legal<span className="text-[#d97706]">IA</span></span>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
                Asistente de inteligencia artificial especializado en derecho argentino para profesionales del derecho.
              </p>
              <p className="mt-4 max-w-xs rounded-lg border border-slate-700 bg-slate-800 p-3 text-xs leading-relaxed text-slate-400">
                LegalIA es una herramienta de asistencia profesional. El abogado es responsable de revisar todo contenido generado antes de su presentación judicial.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Producto</h4>
              <ul className="space-y-2.5">
                {["Generador de escritos", "Asistente IA", "Calculadoras", "Precios"].map((item) => (
                  <li key={item}><a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Legal</h4>
              <ul className="space-y-2.5">
                {["Términos y condiciones", "Privacidad", "Disclaimer legal", "Contacto"].map((item) => (
                  <li key={item}><a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 md:flex-row">
            <p className="text-xs text-slate-500">© 2025 LegalIA. Todos los derechos reservados. Cumple Ley 25.326 de Protección de Datos Personales.</p>
            <p className="text-xs text-slate-600">Construido en Argentina 🇦🇷</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
