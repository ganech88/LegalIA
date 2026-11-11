"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PoweredBy } from "@/components/layout/powered-by";
import { Turnstile, TURNSTILE_SITE_KEY } from "@/components/auth/turnstile";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const reiniciarCaptcha = () => { setCaptcha(null); setCaptchaKey((k) => k + 1); };
  const router = useRouter();
  const supabase = createClient();

  // ?error= del callback de auth y ?next= del middleware (leídos en el cliente
  // para no convertir la página en dinámica ni envolverla en Suspense).
  const [next, setNext] = useState("/dashboard");
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const sp = new URLSearchParams(window.location.search);
        if (sp.get("error") === "auth_callback_failed") {
          setError("El enlace de acceso expiró o ya fue usado. Ingresá con tu contraseña o pedí uno nuevo.");
        }
        const n = sp.get("next");
        if (n && n.startsWith("/") && !n.startsWith("//")) setNext(n);
      } catch { /* ignore */ }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken: captcha ?? undefined },
    });

    if (authError) {
      reiniciarCaptcha();
      setError(
        authError.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos"
          : authError.message
      );
      setLoading(false);
      return;
    }

    router.push(next);
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
            <Turnstile key={captchaKey} onToken={setCaptcha} />
            <button
              type="submit"
              disabled={loading || (Boolean(TURNSTILE_SITE_KEY) && !captcha)}
              className="w-full rounded bg-[var(--brand-navy)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)] disabled:opacity-60"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
          <div className="mt-4 flex justify-between text-[12px]">
            <Link href="/recuperar" className="text-[var(--brand-mute)] hover:text-[var(--brand-navy)] underline underline-offset-2">¿Olvidaste tu contraseña?</Link>
            <Link href="/register" className="text-[var(--brand-navy)] border-b border-[var(--brand-gold)] pb-px">Crear cuenta →</Link>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[var(--brand-mute)]">
          <span>© 2026</span>
          <PoweredBy />
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
            Cada cita verificada contra el corpus legal. Cada liquidación auditable rubro por rubro.
          </p>
          <footer className="mt-6 flex items-center gap-3">
            <div className="h-px w-8 bg-[var(--brand-gold)]" />
            <div>
              <div className="text-[13px] font-semibold text-[var(--brand-navy)]">LegalIA</div>
              <div className="text-[11px] text-[var(--brand-mute)] font-mono">Vos la firmás. Nosotros te mostramos por qué es correcta.</div>
            </div>
          </footer>
        </blockquote>
      </div>
    </div>
  );
}
