"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Scale,
  ArrowRight,
  CheckCircle2,
  Star,
  Shield,
  Zap,
  Users,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import {
  FEATURES,
  TESTIMONIALS,
  PLANS,
  STATS,
  LEGAL_TAGS,
  STORY_STATS,
} from "@/lib/landing-data";
import { useState, useEffect } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* ── Navigation ──────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#faf9f7]/90 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_8px_rgba(0,0,0,0.06)]"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e3a5f] shadow-lg shadow-[#1e3a5f]/20">
              <Scale className="h-[1.125rem] w-[1.125rem] text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#0f172a]">
              Legal<span className="text-[#d97706]">IA</span>
            </span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            {[
              { href: "#features", label: "Funciones" },
              { href: "#testimonials", label: "Testimonios" },
              { href: "#pricing", label: "Precios" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-sm font-medium text-slate-500 transition-colors hover:text-[#1e3a5f]"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="hidden gap-3 md:flex">
            <Link href="/login">
              <button className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100">
                Ingresar
              </button>
            </Link>
            <Link href="/register">
              <button className="btn-shimmer rounded-lg px-5 py-2 text-sm font-bold text-white shadow-lg shadow-amber-500/25">
                Empezar gratis
              </button>
            </Link>
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 md:hidden"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {/* Mobile menu */}
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-slate-200 bg-white/95 backdrop-blur-xl px-6 py-4 md:hidden"
          >
            <div className="flex flex-col gap-3">
              {["Funciones", "Testimonios", "Precios"].map((label, i) => (
                <a
                  key={label}
                  href={["#features", "#testimonials", "#pricing"][i]}
                  onClick={() => setMobileMenu(false)}
                  className="text-sm font-medium text-slate-600"
                >
                  {label}
                </a>
              ))}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <Link href="/login" className="flex-1">
                  <button className="w-full rounded-lg border border-slate-200 py-2 text-sm font-medium">
                    Ingresar
                  </button>
                </Link>
                <Link href="/register" className="flex-1">
                  <button className="btn-shimmer w-full rounded-lg py-2 text-sm font-bold text-white">
                    Registrarse
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </header>

      <main>
        {/* ── Hero ────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pb-24 pt-32 md:pb-32 md:pt-40">
          {/* Background effects */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(30,58,95,0.10) 0%, transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-20 h-[500px] w-[500px] rounded-full opacity-[0.07] blur-[120px]"
            style={{ background: "#d97706" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full opacity-[0.05] blur-[100px]"
            style={{ background: "#1d4ed8" }}
          />

          <div className="relative mx-auto max-w-6xl px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-slate-600">
                +150.000 abogados matriculados en Argentina
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
              className="text-5xl font-extrabold tracking-tight text-[#0f172a] md:text-6xl lg:text-7xl"
            >
              La IA que entiende{" "}
              <br className="hidden sm:block" />
              <span className="gradient-text">el derecho argentino</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-500 md:text-xl"
            >
              Generá escritos judiciales listos para presentar y consultá sobre
              legislación con citas de artículos reales. Sin alucinaciones. Sin
              ChatGPT genérico.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link href="/register">
                <button className="btn-shimmer group inline-flex items-center gap-2.5 rounded-xl px-8 py-4 text-base font-bold text-white shadow-xl shadow-amber-500/20 transition-all hover:shadow-2xl hover:shadow-amber-500/30">
                  Empezar gratis — sin tarjeta
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
              <Link href="#features">
                <button className="rounded-xl border border-slate-300 bg-white px-8 py-4 text-base font-medium text-slate-700 shadow-sm transition-all hover:border-[#1e3a5f] hover:shadow-md">
                  Ver cómo funciona
                </button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500"
            >
              {[
                { icon: Shield, text: "Datos encriptados" },
                { icon: Zap, text: "Escrito en 30 seg" },
                { icon: CheckCircle2, text: "Artículos verificados" },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-2 font-medium">
                  <Icon className="h-4 w-4 text-[#d97706]" />
                  {text}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Stats bar ───────────────────────────────────────── */}
        <section className="border-y border-slate-200 bg-white py-10">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4"
          >
            {STATS.map(({ value, label }, i) => (
              <motion.div key={label} variants={fadeUp} custom={i} className="text-center">
                <div className="text-3xl font-extrabold text-[#1e3a5f] md:text-4xl">
                  {value}
                </div>
                <div className="mt-1 text-sm font-medium text-slate-500">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Features ────────────────────────────────────────── */}
        <section id="features" className="py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="mb-16 text-center"
            >
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#d97706]">
                Funcionalidades
              </p>
              <h2 className="text-4xl font-extrabold text-[#0f172a] md:text-5xl">
                Todo lo que necesitás,{" "}
                <span className="gradient-text-amber">nada de lo que no</span>
              </h2>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid gap-6 md:grid-cols-3"
            >
              {FEATURES.map((feat, i) => (
                <motion.div
                  key={feat.title}
                  variants={fadeUp}
                  custom={i}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] hover:-translate-y-1"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: feat.iconColor.includes("blue") ? "#1d4ed8" : feat.iconColor.includes("emerald") ? "#059669" : "#d97706" }}
                  />
                  <div className={`relative mb-6 flex h-14 w-14 items-center justify-center rounded-xl ${feat.bg} transition-transform duration-300 group-hover:scale-110`}>
                    <feat.icon className={`h-7 w-7 ${feat.iconColor}`} />
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl font-bold text-[#0f172a]">{feat.title}</h3>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                        feat.tag === "Disponible"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {feat.tag}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    {feat.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── About / Story ───────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#0f172a] py-24 md:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] rounded-full opacity-[0.04] blur-[120px]"
            style={{ background: "#d97706" }}
          />
          <div className="relative mx-auto max-w-6xl px-6">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6 }}
              >
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#d97706]">
                  Por qué existimos
                </p>
                <h2 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">
                  El derecho argentino es complejo.{" "}
                  <span className="gradient-text-amber">
                    Tu herramienta no debería serlo.
                  </span>
                </h2>
                <p className="mt-6 text-base leading-relaxed text-slate-400 md:text-lg">
                  Cuando un abogado usa ChatGPT para un escrito laboral, arriesga
                  presentar jurisprudencia inexistente o artículos incorrectos.
                  LegalIA fue construida sobre la base de la LCT, el CCCN, el CPCCN
                  y más de 50 convenios colectivos — con actualizaciones constantes.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {LEGAL_TAGS.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-slate-700 bg-slate-800/60 px-3.5 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-sm transition-colors hover:border-[#d97706]/40 hover:text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className="grid grid-cols-2 gap-4"
              >
                {STORY_STATS.map(({ label, value, colorClass }, i) => (
                  <motion.div
                    key={label}
                    variants={fadeUp}
                    custom={i}
                    className={`rounded-xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm border-l-4 ${colorClass} transition-all hover:bg-slate-800/70`}
                  >
                    <div className="text-3xl font-extrabold text-white md:text-4xl">
                      {value}
                    </div>
                    <div className="mt-1.5 text-sm text-slate-400">{label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ────────────────────────────────────── */}
        <section id="testimonials" className="py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="mb-16 text-center"
            >
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#d97706]">
                Testimonios
              </p>
              <h2 className="text-4xl font-extrabold text-[#0f172a] md:text-5xl">
                Lo que dicen nuestros usuarios
              </h2>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid gap-6 md:grid-cols-3"
            >
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={t.name}
                  variants={fadeUp}
                  custom={i}
                  className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] hover:-translate-y-1"
                >
                  <div className="mb-5 flex gap-1">
                    {Array.from({ length: t.stars }).map((_, si) => (
                      <Star
                        key={si}
                        className="h-4.5 w-4.5 fill-[#d97706] text-[#d97706]"
                        style={{ width: "1.125rem", height: "1.125rem" }}
                      />
                    ))}
                  </div>
                  <blockquote className="text-sm leading-relaxed text-slate-600">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${t.color} text-xs font-bold text-white shadow-lg`}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#0f172a]">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-40"
            >
              {["CPACF", "CASI", "CALM", "CALP", "SCBA"].map((org) => (
                <span
                  key={org}
                  className="flex items-center gap-2 text-sm font-bold text-slate-400"
                >
                  <Users className="h-4 w-4" />
                  {org}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Pricing ─────────────────────────────────────────── */}
        <section id="pricing" className="bg-slate-50 py-24 md:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="mb-16 text-center"
            >
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#d97706]">
                Precios
              </p>
              <h2 className="text-4xl font-extrabold text-[#0f172a] md:text-5xl">
                Transparente y sin sorpresas
              </h2>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid gap-6 md:grid-cols-3"
            >
              {PLANS.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  variants={fadeUp}
                  custom={i}
                  className={`relative overflow-hidden rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
                    plan.highlighted
                      ? "border-[#d97706]/50 bg-[#1e3a5f] shadow-2xl shadow-[#1e3a5f]/30"
                      : "border-slate-200 bg-white shadow-sm hover:shadow-lg"
                  }`}
                >
                  {plan.highlighted && (
                    <>
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-10 blur-3xl"
                        style={{ background: "#d97706" }}
                      />
                      <div className="mb-5 inline-block rounded-full bg-[#d97706] px-3.5 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-amber-500/30">
                        Más popular
                      </div>
                    </>
                  )}
                  <div className={`text-sm font-semibold ${plan.highlighted ? "text-slate-300" : "text-slate-500"}`}>
                    {plan.name}
                  </div>
                  <div className="mt-3 flex items-end gap-1">
                    <span className={`text-4xl font-extrabold ${plan.highlighted ? "text-white" : "text-[#0f172a]"} md:text-5xl`}>
                      {plan.price}
                    </span>
                    <span className={`mb-1.5 text-sm ${plan.highlighted ? "text-slate-400" : "text-slate-500"}`}>
                      {plan.period}
                    </span>
                  </div>
                  <ul className="mt-8 space-y-3.5">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-3">
                        <CheckCircle2
                          className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlighted ? "text-[#fbbf24]" : "text-[#d97706]"}`}
                        />
                        <span className={`text-sm ${plan.highlighted ? "text-slate-300" : "text-slate-600"}`}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className="mt-8 block">
                    <button
                      className={`w-full rounded-xl py-3.5 text-sm font-bold transition-all duration-200 ${
                        plan.highlighted
                          ? "btn-shimmer text-white shadow-lg shadow-amber-500/20"
                          : "border border-slate-300 text-slate-700 hover:border-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white"
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Final CTA ───────────────────────────────────────── */}
        <section className="relative overflow-hidden py-24 md:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full opacity-[0.04] blur-[120px]"
            style={{ background: "#d97706" }}
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative mx-auto max-w-3xl px-6 text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5">
              <Sparkles className="h-4 w-4 text-[#d97706]" />
              <span className="text-sm font-medium text-amber-700">Sin riesgo</span>
            </div>
            <h2 className="text-4xl font-extrabold text-[#0f172a] md:text-5xl">
              Empezá hoy,{" "}
              <span className="gradient-text">sin compromiso</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-500">
              Registrate gratis en 60 segundos. Sin tarjeta de crédito. Cancelá
              cuando quieras.
            </p>
            <Link href="/register" className="mt-10 inline-block">
              <button className="btn-shimmer group inline-flex items-center gap-2.5 rounded-xl px-10 py-4.5 text-lg font-bold text-white shadow-xl shadow-amber-500/20 transition-all hover:shadow-2xl hover:shadow-amber-500/30">
                Crear cuenta gratis
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </Link>
          </motion.div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 bg-[#0f172a] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e3a5f] shadow-lg shadow-[#1e3a5f]/20">
                  <Scale className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">
                  Legal<span className="text-[#d97706]">IA</span>
                </span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
                Asistente de inteligencia artificial especializado en derecho
                argentino para profesionales del derecho.
              </p>
              <div className="mt-5 rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 backdrop-blur-sm">
                <p className="text-xs leading-relaxed text-slate-500">
                  LegalIA es una herramienta de asistencia profesional. El abogado
                  es responsable de revisar todo contenido generado antes de su
                  presentación judicial.
                </p>
              </div>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                Producto
              </h4>
              <ul className="space-y-3">
                {[
                  "Generador de escritos",
                  "Asistente IA",
                  "Calculadoras",
                  "Precios",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                Legal
              </h4>
              <ul className="space-y-3">
                {[
                  "Términos y condiciones",
                  "Privacidad",
                  "Disclaimer legal",
                  "Contacto",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 md:flex-row">
            <p className="text-xs text-slate-500">
              © 2025 LegalIA. Todos los derechos reservados. Cumple Ley 25.326 de
              Protección de Datos Personales.
            </p>
            <p className="text-xs text-slate-600">Construido en Argentina</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
