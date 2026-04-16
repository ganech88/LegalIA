"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, ArrowRight, CheckCircle2, FileText, MessageSquare } from "lucide-react";

const BENEFITS = [
  { icon: FileText,     text: "Escritos judiciales en 30 segundos" },
  { icon: MessageSquare, text: "Asistente legal con citas verificadas" },
  { icon: CheckCircle2, text: "LCT, CCCN, CPCCN y más" },
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

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

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
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex lg:w-5/12"
        style={{
          background: "linear-gradient(150deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "#d97706" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 left-0 h-64 w-64 rounded-full opacity-10 blur-3xl"
          style={{ background: "#7c3aed" }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            Legal<span className="text-[#fbbf24]">IA</span>
          </span>
        </div>

        {/* Central copy */}
        <div className="relative space-y-6">
          <h2 className="text-3xl font-extrabold leading-tight text-white">
            El derecho argentino,{" "}
            <span className="text-[#fbbf24]">ahora en tus manos</span>
          </h2>
          <ul className="space-y-3">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10">
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom testimonial */}
        <div className="relative rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm italic leading-relaxed text-slate-300">
            &ldquo;Reduzco el tiempo de preparación de demandas un 70%. La base es impecable.&rdquo;
          </p>
          <div className="mt-3 flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
              CR
            </div>
            <span className="text-xs text-slate-400">Dra. Claudia Rissotto — CPACF</span>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ─────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#faf9f7] px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e3a5f]">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0f172a]">
              Legal<span className="text-[#d97706]">IA</span>
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-[#0f172a]">Bienvenido de vuelta</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ingresá con tu cuenta para continuar
          </p>

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="mt-0.5 shrink-0 text-red-500">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Email
              </Label>
              <div className="input-brand rounded-xl border border-slate-300 bg-white transition-all">
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Contraseña
                </Label>
                <a href="#" className="text-xs text-[#1d4ed8] hover:underline">
                  ¿Olvidaste la contraseña?
                </a>
              </div>
              <div className="input-brand rounded-xl border border-slate-300 bg-white transition-all">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e3a5f] py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-[#1d4ed8] hover:shadow-lg disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Ingresando...
                </>
              ) : (
                <>
                  Ingresar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿No tenés cuenta?{" "}
            <Link href="/register" className="font-semibold text-[#1d4ed8] hover:underline">
              Registrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
