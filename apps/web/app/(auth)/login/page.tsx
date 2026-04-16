"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, ArrowRight, CheckCircle2, FileText, MessageSquare, Shield } from "lucide-react";

const BENEFITS = [
  { icon: FileText, text: "Escritos judiciales en 30 segundos" },
  { icon: MessageSquare, text: "Asistente legal con citas verificadas" },
  { icon: CheckCircle2, text: "LCT, CCCN, CPCCN y más" },
  { icon: Shield, text: "Datos encriptados y seguros" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos"
          : authError.message
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel — branding ──────────────────────────── */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-5/12">
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #080d1a 0%, #0f172a 30%, #1e3a5f 70%, #1d4ed8 100%)",
          }}
        />
        {/* Decorative elements */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full opacity-15 blur-[100px]"
          style={{ background: "#d97706" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full opacity-10 blur-[80px]"
          style={{ background: "#7c3aed" }}
        />
        {/* Grid pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex items-center gap-2.5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm shadow-lg shadow-black/10">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            Legal<span className="text-[#fbbf24]">IA</span>
          </span>
        </motion.div>

        {/* Central copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative space-y-6"
        >
          <h2 className="heading-serif text-4xl leading-tight text-white">
            El derecho argentino,{" "}
            <span className="text-[#fbbf24]">ahora en tus manos</span>
          </h2>
          <ul className="space-y-3.5">
            {BENEFITS.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] backdrop-blur-sm">
                  <Icon className="h-4 w-4 text-slate-300" />
                </div>
                <span className="text-sm font-medium text-slate-300">{text}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Bottom testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative rounded-xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-sm"
        >
          <p className="text-sm italic leading-relaxed text-slate-300">
            &ldquo;Reduzco el tiempo de preparación de demandas un 70%. La base
            que genera es impecable.&rdquo;
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-xs font-bold text-white shadow-lg">
              CR
            </div>
            <div>
              <span className="text-xs font-medium text-slate-300">
                Dra. Claudia Rissotto
              </span>
              <span className="block text-[10px] text-slate-500">CPACF</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Right panel — form ─────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#faf9f7] px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="mb-10 flex items-center justify-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a5f] shadow-lg shadow-[#1e3a5f]/20">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0f172a]">
              Legal<span className="text-[#d97706]">IA</span>
            </span>
          </div>

          <h1 className="heading-serif text-3xl text-[#0f172a]">
            Bienvenido de vuelta
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Ingresá con tu cuenta para continuar
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <span className="mt-0.5 shrink-0 text-red-500">!</span>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl border-slate-200 bg-white px-4 text-sm shadow-sm transition-all focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/10"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Contraseña
                </Label>
                <a
                  href="#"
                  className="text-xs font-medium text-[#1d4ed8] transition-colors hover:text-[#1e3a5f]"
                >
                  ¿Olvidaste la contraseña?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-xl border-slate-200 bg-white px-4 text-sm shadow-sm transition-all focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e3a5f] py-3 text-sm font-bold text-white shadow-lg shadow-[#1e3a5f]/15 transition-all duration-200 hover:bg-[#1d4ed8] hover:shadow-xl hover:shadow-[#1d4ed8]/20 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Ingresando...
                </>
              ) : (
                <>
                  Ingresar
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            ¿No tenés cuenta?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#1d4ed8] transition-colors hover:text-[#1e3a5f]"
            >
              Registrate gratis
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
