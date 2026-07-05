"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/restablecer`,
    });

    if (err) {
      setError(
        err.message.includes("rate limit") || err.message.includes("seconds")
          ? "Demasiados intentos. Esperá un minuto y probá de nuevo."
          : "No se pudo enviar el email. Intentá de nuevo."
      );
    } else {
      // Por seguridad no revelamos si el email existe o no.
      setEnviado(true);
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--brand-paper)] p-6">
      <div className="w-full max-w-[420px]">
        <Link href="/" className="mb-8 flex items-center gap-2.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded bg-[var(--brand-navy)] font-serif text-xl font-bold italic text-[var(--brand-gold)]">L</div>
          <span className="font-[var(--font-display)] text-xl font-semibold text-[var(--brand-navy)]">LegalIA</span>
        </Link>

        <div className="masthead-meta mb-4"><span>RECUPERAR CONTRASEÑA</span></div>
        <h1 className="mb-2 font-[var(--font-display)] text-3xl font-semibold tracking-[-0.02em] text-[var(--brand-navy)]">
          ¿Olvidaste tu <em className="italic text-[var(--brand-gold)]">contraseña?</em>
        </h1>

        {enviado ? (
          <div className="mt-6 rounded border border-emerald-200 bg-emerald-50 px-4 py-4 text-[13.5px] leading-relaxed text-emerald-800">
            <p className="font-semibold">Revisá tu casilla.</p>
            <p className="mt-1">
              Si existe una cuenta con <strong>{email}</strong>, te enviamos un enlace para
              restablecer la contraseña. Si no llega en unos minutos, revisá el correo no deseado.
            </p>
            <Link href="/login" className="mt-3 inline-block text-emerald-900 underline">Volver al ingreso</Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-[14px] text-[var(--brand-mute)]">
              Ingresá tu email y te enviamos un enlace para crear una contraseña nueva.
            </p>
            {error && (
              <div className="mb-4 rounded border border-[var(--brand-red)]/30 bg-[var(--brand-red)]/5 px-4 py-3 text-sm text-[var(--brand-red)]">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="t-overline mb-1.5 block text-[var(--brand-navy)]">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="w-full rounded-md border border-border bg-white px-3 py-2.5 text-[13px] transition-colors focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded bg-[var(--brand-navy)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)] disabled:opacity-60"
              >
                {loading ? "Enviando…" : "Enviar enlace de recuperación"}
              </button>
            </form>
            <div className="mt-4 text-[12px]">
              <Link href="/login" className="border-b border-[var(--brand-gold)] pb-px text-[var(--brand-navy)]">← Volver al ingreso</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
