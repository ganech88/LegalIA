"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] min-h-screen">
      {/* Form */}
      <div className="flex flex-col justify-between p-6 md:p-10 bg-[var(--brand-paper)]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded bg-[var(--brand-navy)] font-serif text-xl font-bold italic text-[var(--brand-gold)]">L</div>
          <span className="font-[var(--font-display)] text-xl font-semibold text-[var(--brand-navy)]">LegalIA</span>
        </Link>

        <div className="max-w-[400px] mx-auto w-full">
          <div className="masthead-meta mb-4">
            <span>INGRESO</span>
          </div>
          <h1 className="font-[var(--font-display)] text-4xl font-semibold text-[var(--brand-navy)] tracking-[-0.025em] mb-2">
            Bienvenido<em className="italic text-[var(--brand-gold)]"> de vuelta.</em>
          </h1>
          <p className="text-[14px] text-[var(--brand-mute)] mb-8">
            Ingresa para continuar con tus escritos y casos.
          </p>

          {error && (
            <div className="mb-5 rounded border border-[var(--brand-red)]/30 bg-[var(--brand-red)]/5 px-4 py-3 text-sm text-[var(--brand-red)]">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block">
              <span className="t-overline text-[var(--brand-navy)] block mb-1.5">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full rounded-md border border-border bg-white px-3 py-2.5 text-[13px] transition-colors focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
              />
            </label>
            <label className="block">
              <span className="t-overline text-[var(--brand-navy)] block mb-1.5">Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-md border border-border bg-white px-3 py-2.5 text-[13px] transition-colors focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-[var(--brand-navy)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)] disabled:opacity-60"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
          <div className="mt-4 flex justify-between text-[12px]">
            <span className="text-[var(--brand-mute)]">¿Olvidaste tu contraseña?</span>
            <Link href="/register" className="text-[var(--brand-navy)] border-b border-[var(--brand-gold)] pb-px">Crear cuenta →</Link>
          </div>
        </div>

        <div className="text-[11px] text-[var(--brand-mute)]">
          © 2026 Desarrollo sin Fronteras
        </div>
      </div>

      {/* Quote */}
      <div className="hidden lg:flex bg-gradient-to-br from-[var(--brand-paper-2)] to-[var(--brand-paper-3)] p-10 items-center justify-center relative">
        <div className="absolute top-10 left-10 right-10 masthead-meta">
          <span>EL ABOGADO</span>
          <span>ED. DIGITAL</span>
        </div>
        <blockquote className="max-w-[500px]">
          <div className="font-[var(--font-display)] text-6xl font-semibold text-[var(--brand-gold)] italic leading-none mb-4">&ldquo;</div>
          <p className="font-[var(--font-serif)] text-2xl font-medium text-[var(--brand-navy)] leading-tight tracking-[-0.01em]">
            Ahorro 4 horas por semana en redaccion de escritos, sin perder rigor tecnico.
          </p>
          <footer className="mt-6 flex items-center gap-3">
            <div className="h-px w-8 bg-[var(--brand-gold)]" />
            <div>
              <div className="text-[13px] font-semibold text-[var(--brand-navy)]">Dra. Maria Salerno</div>
              <div className="text-[11px] text-[var(--brand-mute)] font-mono">CPACF · Laboralista</div>
            </div>
          </footer>
        </blockquote>
      </div>
    </div>
  );
}
