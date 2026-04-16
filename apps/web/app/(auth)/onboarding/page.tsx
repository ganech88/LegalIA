"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Scale, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { ESPECIALIDADES, JURISDICCIONES, COLEGIOS_ABOGADOS } from "@/types";
import type { Especialidad, Jurisdiccion } from "@/types";

const STEPS = [
  { number: 1, label: "Tus datos" },
  { number: 2, label: "Especialidad" },
  { number: 3, label: "Jurisdicción" },
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
      setError("Sesión expirada. Por favor, volvé a ingresar.");
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
      setError("Error al guardar. Intentá de nuevo.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const progressPercent = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-[#faf9f7] px-4 py-10"
      style={{ background: "linear-gradient(160deg, #f8f9fe 0%, #faf9f7 100%)" }}
    >
      {/* Header */}
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e3a5f]">
          <Scale className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-[#0f172a]">
          Legal<span className="text-[#d97706]">IA</span>
        </span>
      </div>

      <div className="w-full max-w-lg animate-fade-in-up">
        {/* Progress stepper */}
        <div className="mb-8">
          {/* Step labels */}
          <div className="mb-3 flex justify-between">
            {STEPS.map((s) => (
              <div key={s.number} className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                    step > s.number
                      ? "border-[#d97706] bg-[#d97706] text-white"
                      : step === s.number
                      ? "border-[#1e3a5f] bg-[#1e3a5f] text-white"
                      : "border-slate-300 bg-white text-slate-400"
                  }`}
                >
                  {step > s.number ? <CheckCircle2 className="h-4 w-4" /> : s.number}
                </div>
                <span
                  className={`text-xs font-medium transition-colors duration-200 ${
                    step >= s.number ? "text-[#1e3a5f]" : "text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="relative h-1.5 rounded-full bg-slate-200">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-[#1e3a5f] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#d97706]">
              Paso {step} de 3
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-[#0f172a]">
              {step === 1 && "Contanos sobre vos"}
              {step === 2 && "¿En qué te especializás?"}
              {step === 3 && "¿Dónde ejercés?"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {step === 1 && "Estos datos personalizan tus escritos y asistencia."}
              {step === 2 && "Seleccioná una o más áreas de práctica."}
              {step === 3 && "Usamos esto para adaptar el formato procesal correcto."}
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="mt-0.5 shrink-0">⚠</span>
              {error}
            </div>
          )}

          {/* ── Step 1 ───────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nombre completo *
                </Label>
                <div className="input-brand rounded-xl border border-slate-300 bg-white transition-all">
                  <Input
                    id="fullName"
                    placeholder="Dr. Juan Pérez"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="matricula" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Número de matrícula
                </Label>
                <div className="input-brand rounded-xl border border-slate-300 bg-white transition-all">
                  <Input
                    id="matricula"
                    placeholder="T° XX F° XXX"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Colegio de Abogados
                </Label>
                <Select
                  value={colegioAbogados}
                  onValueChange={(v) => setColegioAbogados(v ?? "")}
                >
                  <SelectTrigger className="rounded-xl border-slate-300 bg-white">
                    <SelectValue placeholder="Seleccioná tu colegio" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLEGIOS_ABOGADOS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <button
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e3a5f] py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-[#1d4ed8] disabled:opacity-50"
                onClick={() => setStep(2)}
                disabled={!fullName}
              >
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ── Step 2 ───────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {ESPECIALIDADES.map((esp) => (
                    <button
                      key={esp.value}
                      type="button"
                      onClick={() => toggleEspecialidad(esp.value)}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                        especialidades.includes(esp.value)
                          ? "border-[#1e3a5f] bg-[#1e3a5f] text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-[#1e3a5f] hover:text-[#1e3a5f]"
                      }`}
                    >
                      {esp.label}
                    </button>
                  ))}
                </div>
                {especialidades.length > 0 && (
                  <p className="text-xs text-emerald-600">
                    {especialidades.length} especialidad{especialidades.length > 1 ? "es" : ""} seleccionada{especialidades.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={especialidades.length === 0}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1e3a5f] py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-[#1d4ed8] disabled:opacity-50"
                >
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3 ───────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Jurisdicción principal *
                </Label>
                <Select
                  value={jurisdiccion}
                  onValueChange={(v) => setJurisdiccion(v as Jurisdiccion)}
                >
                  <SelectTrigger className="rounded-xl border-slate-300 bg-white">
                    <SelectValue placeholder="Seleccioná tu jurisdicción" />
                  </SelectTrigger>
                  <SelectContent>
                    {JURISDICCIONES.map((j) => (
                      <SelectItem key={j.value} value={j.value}>
                        {j.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="estudio" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nombre del estudio <span className="font-normal text-slate-400">(opcional)</span>
                </Label>
                <div className="input-brand rounded-xl border border-slate-300 bg-white transition-all">
                  <Input
                    id="estudio"
                    placeholder="Estudio Jurídico Pérez & Asociados"
                    value={estudioNombre}
                    onChange={(e) => setEstudioNombre(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !jurisdiccion}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#d97706] py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-[#b45309] hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      Comenzar a usar LegalIA
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Podés modificar estos datos en cualquier momento desde tu perfil.
        </p>
      </div>
    </div>
  );
}
