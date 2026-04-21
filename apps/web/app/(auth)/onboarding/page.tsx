"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESPECIALIDADES, JURISDICCIONES, COLEGIOS_ABOGADOS } from "@/types";
import type { Especialidad, Jurisdiccion } from "@/types";

const STEPS = [
  { roman: "I", label: "Tus datos" },
  { roman: "II", label: "Especialidad" },
  { roman: "III", label: "Jurisdiccion" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [matricula, setMatricula] = useState("");
  const [colegioAbogados, setColegioAbogados] = useState("");
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [jurisdiccion, setJurisdiccion] = useState<Jurisdiccion | "">("");
  const [estudioNombre, setEstudioNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  function toggleEspecialidad(esp: Especialidad) {
    setEspecialidades((prev) =>
      prev.includes(esp) ? prev.filter((e) => e !== esp) : [...prev, esp]
    );
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Sesion expirada. Por favor, volve a ingresar.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        matricula: matricula || null,
        colegio_abogados: colegioAbogados || null,
        especialidad: especialidades,
        jurisdiccion_principal: jurisdiccion || null,
        estudio_nombre: estudioNombre || null,
      })
      .eq("id", user.id);

    if (updateError) {
      setError("Error al guardar. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--brand-paper)] px-4 py-10">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded bg-[var(--brand-navy)] font-serif text-xl font-bold italic text-[var(--brand-gold)]">L</div>
        <span className="font-[var(--font-display)] text-xl font-semibold text-[var(--brand-navy)]">LegalIA</span>
      </div>

      <div className="w-full max-w-lg">
        {/* Progress — Roman numerals */}
        <div className="mb-8">
          <div className="flex justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s.roman} className="flex flex-col items-center gap-1.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded font-[var(--font-display)] text-lg font-semibold italic transition-all ${
                  step > i + 1
                    ? "bg-[var(--brand-gold)] text-[var(--brand-navy)]"
                    : step === i + 1
                    ? "bg-[var(--brand-navy)] text-white"
                    : "bg-white border border-border text-[var(--brand-mute)]"
                }`}>
                  {s.roman}
                </div>
                <span className={`text-[11px] font-medium transition-colors ${
                  step >= i + 1 ? "text-[var(--brand-navy)]" : "text-[var(--brand-mute)]"
                }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <div className="relative h-1 rounded-full bg-border">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-[var(--brand-navy)] transition-all duration-500"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="card-editorial p-8">
          <div className="mb-6">
            <div className="masthead-meta mb-2">
              <span>PASO {STEPS[step - 1].roman} DE III</span>
            </div>
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--brand-navy)]">
              {step === 1 && "Contanos sobre vos"}
              {step === 2 && "¿En que te especializas?"}
              {step === 3 && "¿Donde ejerces?"}
            </h1>
            <p className="mt-1 text-[13px] text-[var(--brand-ink-2)]">
              {step === 1 && "Estos datos personalizan tus escritos y asistencia."}
              {step === 2 && "Selecciona una o mas areas de practica."}
              {step === 3 && "Usamos esto para adaptar el formato procesal correcto."}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded border border-[var(--brand-red)]/30 bg-[var(--brand-red)]/5 px-4 py-3 text-sm text-[var(--brand-red)]">
              {error}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="block">
                <span className="t-overline text-[var(--brand-navy)] block mb-1.5">Nombre completo *</span>
                <input
                  type="text"
                  placeholder="Dr. Juan Perez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
                />
              </label>
              <label className="block">
                <span className="t-overline text-[var(--brand-navy)] block mb-1.5">Numero de matricula</span>
                <input
                  type="text"
                  placeholder="T° XX F° XXX"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
                />
              </label>
              <div className="space-y-1.5">
                <span className="t-overline text-[var(--brand-navy)] block">Colegio de Abogados</span>
                <Select value={colegioAbogados} onValueChange={(v) => setColegioAbogados(v ?? "")}>
                  <SelectTrigger className="rounded border-border bg-white">
                    <SelectValue placeholder="Selecciona tu colegio" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLEGIOS_ABOGADOS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!fullName}
                className="w-full rounded bg-[var(--brand-navy)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)] disabled:opacity-50"
              >
                Siguiente →
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {ESPECIALIDADES.map((esp) => (
                  <button
                    key={esp.value}
                    type="button"
                    onClick={() => toggleEspecialidad(esp.value)}
                    className={`rounded border px-4 py-2.5 text-[13px] font-medium transition-all ${
                      especialidades.includes(esp.value)
                        ? "border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white"
                        : "border-border bg-white text-[var(--brand-ink-2)] hover:border-[var(--brand-gold)]"
                    }`}
                  >
                    {esp.label}
                  </button>
                ))}
              </div>
              {especialidades.length > 0 && (
                <p className="text-[12px] text-[var(--brand-gold)]">
                  {especialidades.length} seleccionada{especialidades.length > 1 ? "s" : ""}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 rounded border border-border py-3 text-[13px] font-medium text-[var(--brand-ink-2)] hover:bg-[var(--brand-paper-2)]"
                >
                  ← Atras
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={especialidades.length === 0}
                  className="flex-1 rounded bg-[var(--brand-navy)] py-3 text-[13px] font-semibold text-white hover:bg-[var(--brand-navy-2)] disabled:opacity-50"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="t-overline text-[var(--brand-navy)] block">Jurisdiccion principal *</span>
                <Select value={jurisdiccion} onValueChange={(v) => setJurisdiccion(v as Jurisdiccion)}>
                  <SelectTrigger className="rounded border-border bg-white">
                    <SelectValue placeholder="Selecciona tu jurisdiccion" />
                  </SelectTrigger>
                  <SelectContent>
                    {JURISDICCIONES.map((j) => (
                      <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <label className="block">
                <span className="t-overline text-[var(--brand-navy)] block mb-1.5">Nombre del estudio <span className="font-normal text-[var(--brand-mute)]">(opcional)</span></span>
                <input
                  type="text"
                  placeholder="Estudio Juridico Perez & Asociados"
                  value={estudioNombre}
                  onChange={(e) => setEstudioNombre(e.target.value)}
                  className="w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]"
                />
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 rounded border border-border py-3 text-[13px] font-medium text-[var(--brand-ink-2)] hover:bg-[var(--brand-paper-2)]"
                >
                  ← Atras
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !jurisdiccion}
                  className="flex-1 rounded bg-[var(--brand-gold)] py-3 text-[13px] font-bold text-[var(--brand-navy)] hover:bg-[var(--brand-gold)]/80 disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Comenzar a usar LegalIA →"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-[var(--brand-mute)]">
          Podes modificar estos datos en cualquier momento desde tu perfil.
        </p>
      </div>
    </div>
  );
}
