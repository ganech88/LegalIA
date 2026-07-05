"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PoweredBy } from "@/components/layout/powered-by";

export default function RestablecerPage() {
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [sesionOk, setSesionOk] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listo, setListo] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // El usuario llega desde el enlace del email (el callback ya canjeó el código
  // por una sesión). Si entra directo sin sesión, lo mandamos a pedir el enlace.
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setSesionOk(Boolean(user)));
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setError(
        err.message.includes("different from the old")
          ? "La contraseña nueva debe ser distinta a la anterior."
          : "No se pudo actualizar la contraseña. Pedí un enlace nuevo e intentá otra vez."
      );
      setLoading(false);
      return;
    }
    setListo(true);
    setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 1500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--brand-paper)] p-6">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded bg-[var(--brand-navy)] font-serif text-xl font-bold italic text-[var(--brand-gold)]">L</div>
          <span className="font-[var(--font-display)] text-xl font-semibold text-[var(--brand-navy)]">LegalIA</span>
        </div>

        <div className="masthead-meta mb-4"><span>NUEVA CONTRASEÑA</span></div>
        <h1 className="mb-2 font-[var(--font-display)] text-3xl font-semibold tracking-[-0.02em] text-[var(--brand-navy)]">
          Creá tu <em className="italic text-[var(--brand-gold)]">contraseña nueva.</em>
        </h1>

        {sesionOk === null && <p className="mt-6 text-[13px] text-[var(--brand-mute)]">Verificando el enlace…</p>}

        {sesionOk === false && (
          <div className="mt-6 rounded border border-amber-200 bg-amber-50 px-4 py-4 text-[13.5px] leading-relaxed text-amber-800">
            <p className="font-semibold">El enlace expiró o no es válido.</p>
            <p className="mt-1">Los enlaces de recuperación duran poco tiempo por seguridad.</p>
            <Link href="/recuperar" className="mt-3 inline-block text-amber-900 underline">Pedir un enlace nuevo</Link>
          </div>
        )}

        {sesionOk && listo && (
          <div className="mt-6 rounded border border-emerald-200 bg-emerald-50 px-4 py-4 text-[13.5px] text-emerald-800">
            ✓ Contraseña actualizada. Entrando a tu cuenta…
          </div>
        )}

        {sesionOk && !listo && (
          <>
            {error && (
              <div className="mb-4 mt-4 rounded border border-[var(--brand-red)]/30 bg-[var(--brand-red)]/5 px-4 py-3 text-sm text-[var(--brand-red)]">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="t-overline mb-1.5 block text-[var(--brand-navy)]">Contraseña nueva</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-md border border-border bg-white px-3 py-2.5 text-[13px] transition-colors focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
                />
              </label>
              <label className="block">
                <span className="t-overline mb-1.5 block text-[var(--brand-navy)]">Repetir contraseña</span>
                <input
                  type="password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-border bg-white px-3 py-2.5 text-[13px] transition-colors focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded bg-[var(--brand-navy)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)] disabled:opacity-60"
              >
                {loading ? "Guardando…" : "Guardar contraseña nueva"}
              </button>
            </form>
          </>
        )}
        <div className="mt-10">
          <PoweredBy />
        </div>
      </div>
    </div>
  );
}
