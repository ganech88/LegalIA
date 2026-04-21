"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      <div className="flex min-h-screen items-center justify-center bg-[var(--brand-paper)] px-4">
        <div className="w-full max-w-md card-editorial p-10 text-center">
          <div className="font-[var(--font-display)] text-5xl italic text-[var(--brand-gold)] mb-4">✉</div>
          <h2 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--brand-navy)]">Revisa tu email</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--brand-ink-2)]">
            Te enviamos un link de confirmacion a{" "}
            <span className="font-semibold text-[var(--brand-navy)]">{email}</span>.
            Hace click en el link para activar tu cuenta.
          </p>
          <Link href="/login">
            <button className="mt-6 w-full rounded border border-[var(--brand-navy)] py-3 text-sm font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-navy)] hover:text-white transition-colors">
              Volver al login
            </button>
          </Link>
        </div>
      </div>
    );
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
            <span>REGISTRO</span>
          </div>
          <h1 className="font-[var(--font-display)] text-4xl font-semibold text-[var(--brand-navy)] tracking-[-0.025em] mb-2">
            Crear cuenta<em className="italic text-[var(--brand-gold)]"> gratis.</em>
          </h1>
          <p className="text-[14px] text-[var(--brand-mute)] mb-8">
            Sin tarjeta de credito. 3 escritos gratis desde el primer dia.
          </p>

          {error && (
            <div className="mb-5 rounded border border-[var(--brand-red)]/30 bg-[var(--brand-red)]/5 px-4 py-3 text-sm text-[var(--brand-red)]">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <label className="block">
              <span className="t-overline text-[var(--brand-navy)] block mb-1.5">Nombre completo</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Dr. Juan Perez"
                className="w-full rounded-md border border-border bg-white px-3 py-2.5 text-[13px] transition-colors focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
              />
            </label>
            <label className="block">
              <span className="t-overline text-[var(--brand-navy)] block mb-1.5">Email profesional</span>
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
                minLength={6}
                placeholder="Minimo 6 caracteres"
                className="w-full rounded-md border border-border bg-white px-3 py-2.5 text-[13px] transition-colors focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
              />
              {password.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        password.length >= level * 3
                          ? level === 1 ? "bg-[var(--brand-red)]" : level === 2 ? "bg-[var(--brand-gold)]" : "bg-emerald-500"
                          : "bg-border"
                      }`}
                    />
                  ))}
                </div>
              )}
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-[var(--brand-navy)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)] disabled:opacity-60"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta gratis →"}
            </button>
          </form>

          <p className="mt-3 text-center text-[11px] text-[var(--brand-mute)]">
            Al registrarte aceptas los terminos y condiciones y la politica de privacidad.
          </p>
          <p className="mt-4 text-center text-[13px] text-[var(--brand-ink-2)]">
            ¿Ya tenes cuenta?{" "}
            <Link href="/login" className="font-semibold text-[var(--brand-navy)] border-b border-[var(--brand-gold)] pb-px">
              Ingresa →
            </Link>
          </p>
        </div>

        <div className="text-[11px] text-[var(--brand-mute)]">
          © 2026 Desarrollo sin Fronteras
        </div>
      </div>

      {/* Right panel */}
      <div className="hidden lg:flex bg-gradient-to-br from-[var(--brand-paper-2)] to-[var(--brand-paper-3)] p-10 items-center justify-center relative">
        <div className="absolute top-10 left-10 right-10 masthead-meta">
          <span>NUEVO USUARIO</span>
          <span>ED. DIGITAL</span>
        </div>
        <div className="max-w-[440px] text-center">
          <div className="font-[var(--font-display)] text-7xl font-semibold italic text-[var(--brand-gold)] mb-6">60s</div>
          <h2 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--brand-navy)] mb-4">
            Empeza en 60 segundos
          </h2>
          <ul className="space-y-3 text-left max-w-[300px] mx-auto">
            {["Plan gratuito sin vencimiento", "Exporta a Word / DOCX", "Cancela cuando quieras"].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-[13px] text-[var(--brand-ink-2)]">
                <span className="text-[var(--brand-gold)]">§</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              { v: "2.400+", l: "escritos generados" },
              { v: "98%", l: "precision en citas" },
            ].map(({ v, l }) => (
              <div key={l} className="card-editorial p-4 text-center">
                <div className="font-[var(--font-display)] text-2xl font-semibold text-[var(--brand-navy)]">{v}</div>
                <div className="mt-0.5 text-[11px] text-[var(--brand-mute)]">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
