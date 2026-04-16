"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Scale } from "lucide-react";
import { ESPECIALIDADES, JURISDICCIONES, COLEGIOS_ABOGADOS } from "@/types";
import type { Especialidad, Jurisdiccion } from "@/types";

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

    const { data: { user } } = await supabase.auth.getUser();
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Completá tu perfil</CardTitle>
          <CardDescription>
            Paso {step} de 3 — Necesitamos algunos datos para personalizar tu experiencia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo *</Label>
                <Input
                  id="fullName"
                  placeholder="Dr. Juan Pérez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="matricula">Número de matrícula</Label>
                <Input
                  id="matricula"
                  placeholder="T° XX F° XXX"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Colegio de Abogados</Label>
                <Select value={colegioAbogados} onValueChange={(v) => setColegioAbogados(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccioná tu colegio" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLEGIOS_ABOGADOS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!fullName}
              >
                Siguiente
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Especialidades (seleccioná una o más)</Label>
                <div className="flex flex-wrap gap-2">
                  {ESPECIALIDADES.map((esp) => (
                    <Badge
                      key={esp.value}
                      variant={especialidades.includes(esp.value) ? "default" : "outline"}
                      className="cursor-pointer text-sm py-1.5 px-3"
                      onClick={() => toggleEspecialidad(esp.value)}
                    >
                      {esp.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Atrás
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep(3)}
                  disabled={especialidades.length === 0}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Jurisdicción principal *</Label>
                <Select value={jurisdiccion} onValueChange={(v) => setJurisdiccion(v as Jurisdiccion)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccioná tu jurisdicción" />
                  </SelectTrigger>
                  <SelectContent>
                    {JURISDICCIONES.map((j) => (
                      <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estudio">Nombre del estudio (opcional)</Label>
                <Input
                  id="estudio"
                  placeholder="Estudio Jurídico Pérez & Asociados"
                  value={estudioNombre}
                  onChange={(e) => setEstudioNombre(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Atrás
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={loading || !jurisdiccion}
                >
                  {loading ? "Guardando..." : "Comenzar a usar LegalIA"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
