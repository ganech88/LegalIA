"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FUEROS, JURISDICCIONES } from "@/types";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EscritoPersonalizadoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      tipo_escrito: form.get("tipo_escrito") as string,
      fuero: form.get("fuero") as string,
      jurisdiccion: form.get("jurisdiccion") as string,
      descripcion: form.get("descripcion") as string,
      datos_caso: form.get("datos_caso") as string,
    };

    try {
      const res = await fetch("/api/generate-escrito-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al generar el escrito");
        setLoading(false);
        return;
      }

      router.push(`/escritos/${data.id}`);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/escritos"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a escritos
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">
          Escrito personalizado
        </h1>
        <p className="mt-1 text-slate-500">
          Describí qué tipo de documento legal necesitás y la IA lo genera por vos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Describí tu escrito
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="tipo_escrito">Tipo de escrito *</Label>
              <Input
                id="tipo_escrito"
                name="tipo_escrito"
                required
                placeholder="Ej: Recurso de queja, Demanda por daños, Amparo..."
              />
              <p className="text-xs text-slate-400">
                Indicá el tipo de documento legal que necesitás generar.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Fuero *</Label>
                <Select name="fuero" required defaultValue="civil">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEROS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Jurisdicción *</Label>
                <Select name="jurisdiccion" required defaultValue="CABA">
                  <SelectTrigger className="w-full">
                    <SelectValue />
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
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descripcion">Descripción detallada *</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                required
                rows={4}
                placeholder="Describí qué necesitás: qué tipo de escrito, para qué situación, qué aspectos legales debe cubrir, qué artículos aplicar..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="datos_caso">Datos del caso *</Label>
              <Textarea
                id="datos_caso"
                name="datos_caso"
                required
                rows={5}
                placeholder="Incluí todos los datos relevantes: nombres de las partes, fechas, montos, hechos del caso, pruebas disponibles, número de expediente si existe..."
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} size="lg" className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando escrito...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generar escrito personalizado
                </>
              )}
            </Button>

            <p className="text-xs text-slate-400 text-center">
              El escrito generado es un borrador. Revisalo antes de presentarlo.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
