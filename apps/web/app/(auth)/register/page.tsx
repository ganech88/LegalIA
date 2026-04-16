"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, ArrowRight, Mail, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f7] px-4">
        <div className="w-full max-w-md animate-scale-in rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Mail className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#0f172a]">Revisá tu email</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Te enviamos un link de confirmación a{" "}
            <span className="font-semibold text-[#1e3a5f]">{email}</span>.
            Hacé click en el link para activar tu cuenta.
          </p>
          <Link href="/login">
            <button className="mt-6 w-full rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white">
              Volver al login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel — branding ──────────────────────────── */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex lg:w-5/12"
        style={{
          background: "linear-gradient(150deg, #0f172a 0%, #1e3a5f 60%, #7c3aed 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "#d97706" }}
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
        <div className="relative space-y-5">
          <h2 className="text-3xl font-extrabold leading-tight text-white">
            Empezá en{" "}
            <span className="text-[#fbbf24]">60 segundos</span>
          </h2>
          <p className="text-sm leading-relaxed text-slate-300">
            Sin tarjeta de crédito. 3 escritos gratis desde el primer día.
          </p>
          <ul className="space-y-3">
            {[
              "Plan gratuito sin vencimiento",
              "Exportá a Word / DOCX",
              "Cancelá cuando quieras",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#fbbf24]" />
                <span className="text-sm text-slate-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stats grid */}
        <div className="relative grid grid-cols-2 gap-3">
          {[
            { v: "2.400+", l: "escritos generados" },
            { v: "98%",    l: "precisión en citas" },
          ].map(({ v, l }) => (
            <div key={l} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <div className="text-2xl font-extrabold text-white">{v}</div>
              <div className="mt-0.5 text-xs text-slate-400">{l}</div>
            </div>
          ))}
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

          <h1 className="text-2xl font-extrabold text-[#0f172a]">Crear cuenta gratis</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sin tarjeta de crédito. Empezás en 60 segundos.
          </p>

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="mt-0.5 shrink-0 text-red-500">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Nombre completo
              </Label>
              <div className="input-brand rounded-xl border border-slate-300 bg-white transition-all">
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Dr. Juan Pérez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Email profesional
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
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Contraseña
              </Label>
              <div className="input-brand rounded-xl border border-slate-300 bg-white transition-all">
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              {password.length > 0 && (
                <div className="flex gap-1 pt-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        password.length >= level * 3
                          ? level === 1 ? "bg-red-400" : level === 2 ? "bg-amber-400" : "bg-emerald-500"
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e3a5f] py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-[#1d4ed8] hover:shadow-lg disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear cuenta gratis
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-slate-400">
            Al registrarte aceptás los{" "}
            <a href="#" className="underline hover:text-slate-600">términos y condiciones</a>
            {" "}y la{" "}
            <a href="#" className="underline hover:text-slate-600">política de privacidad</a>.
          </p>

          <p className="mt-5 text-center text-sm text-slate-500">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="font-semibold text-[#1d4ed8] hover:underline">
              Ingresá
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
