"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { FormField, EscritoTemplate } from "@/types";

interface DynamicFormProps {
  initialValues?: Record<string, unknown>;
  template: EscritoTemplate;
  /** Caso al que se vincula el escrito generado (expediente vivo). */
  casoId?: string;
}

export function DynamicForm({ template, initialValues, casoId }: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues ?? {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [contenidoSinGuardar, setContenidoSinGuardar] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const router = useRouter();
  const draftKey = `legalia:draft:${template.id}`;

  // Prellenado desde la calculadora (sessionStorage): solo campos de este
  // template + el anexo de liquidación (que viaja aunque no sea un campo).
  // Si no hay prellenado, restauramos el borrador del formulario (un refresh
  // ya no borra 10 minutos de carga).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("legalia:prefill");
      if (raw) {
        const data = JSON.parse(raw) as Record<string, unknown>;
        const fieldNames = new Set((template.campos_requeridos.fields as FormField[]).map((f) => f.name));
        const seed: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(data)) {
          if (fieldNames.has(k) || k === "anexo_liquidacion") seed[k] = v;
        }
        const consumido = Object.keys(seed).some((k) => k !== "anexo_liquidacion");
        if (consumido) {
          setValues((prev) => ({ ...seed, ...prev }));
          setPrefilled(true);
          // Solo se borra cuando ESTE template lo usó: abrir otra plantilla no lo pierde.
          sessionStorage.removeItem("legalia:prefill");
          return;
        }
      }
      const draft = sessionStorage.getItem(draftKey);
      if (draft) {
        const data = JSON.parse(draft) as Record<string, unknown>;
        setValues((prev) => (Object.keys(prev).length > 0 ? prev : data));
      }
    } catch { /* ignore */ }
  }, [template, draftKey]);

  // Borrador automático del formulario.
  useEffect(() => {
    try {
      if (Object.keys(values).length > 0) sessionStorage.setItem(draftKey, JSON.stringify(values));
    } catch { /* ignore */ }
  }, [values, draftKey]);

  // Contador visible mientras genera (60-90 s es normal con el modelo grande).
  useEffect(() => {
    if (!loading) { setSegundos(0); return; }
    const t = setInterval(() => setSegundos((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [loading]);

  function setValue(name: string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function toggleMultiselect(name: string, option: string) {
    const current = (values[name] as string[]) || [];
    const updated = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    setValue(name, updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setContenidoSinGuardar(null);

    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 150_000);

    try {
      const res = await fetch("/api/generate-escrito", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: template.id,
          datos_caso: values,
          ...(casoId ? { caso_id: casoId } : {}),
        }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Error al generar el escrito. Intentá de nuevo.");
        if (typeof data.contenido === "string") setContenidoSinGuardar(data.contenido);
        setLoading(false);
        return;
      }

      try { sessionStorage.removeItem(draftKey); } catch { /* ignore */ }
      router.push(`/escritos/${data.id}`);
    } catch (err) {
      const abortado = err instanceof DOMException && err.name === "AbortError";
      setError(
        abortado
          ? "La generación se canceló o tardó demasiado. Si se descontó un escrito de tu cuota sin resultado, se te devuelve automáticamente."
          : "No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo.",
      );
      setLoading(false);
    } finally {
      clearTimeout(timeout);
      abortRef.current = null;
    }
  }

  const fields: FormField[] = template.campos_requeridos.fields;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {prefilled && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Se prellenaron fechas, remuneración y liquidación desde la calculadora. Revisá y completá el resto de los datos.
        </div>
      )}

      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </Label>

          {field.type === "text" && (
            <Input
              id={field.name}
              value={(values[field.name] as string) || ""}
              onChange={(e) => setValue(field.name, e.target.value)}
              required={field.required}
            />
          )}

          {field.type === "textarea" && (
            <Textarea
              id={field.name}
              value={(values[field.name] as string) || ""}
              onChange={(e) => setValue(field.name, e.target.value)}
              required={field.required}
              rows={4}
            />
          )}

          {field.type === "date" && (
            <Input
              id={field.name}
              type="date"
              value={(values[field.name] as string) || ""}
              onChange={(e) => setValue(field.name, e.target.value)}
              required={field.required}
            />
          )}

          {field.type === "number" && (
            <Input
              id={field.name}
              type="number"
              value={(values[field.name] as string) || ""}
              onChange={(e) => setValue(field.name, e.target.value)}
              required={field.required}
            />
          )}

          {field.type === "select" && field.options && (
            <Select
              value={(values[field.name] as string) || ""}
              onValueChange={(v) => setValue(field.name, v)}
              required={field.required}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Seleccioná ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {field.type === "multiselect" && field.options && (
            <div className="flex flex-wrap gap-2">
              {field.options.map((opt) => {
                const selected = ((values[field.name] as string[]) || []).includes(opt);
                return (
                  <Badge
                    key={opt}
                    variant={selected ? "default" : "outline"}
                    className="cursor-pointer text-sm py-1.5 px-3"
                    onClick={() => toggleMultiselect(field.name, opt)}
                  >
                    {opt}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {contenidoSinGuardar && (
        <div className="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <p>El escrito se generó pero no pudo guardarse. Copialo ahora para no perderlo:</p>
          <Textarea readOnly value={contenidoSinGuardar} rows={8} className="bg-white font-mono text-[12px]" />
          <Button type="button" variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(contenidoSinGuardar).then(() => toast.success("Escrito copiado")).catch(() => toast.error("No se pudo copiar"))}>
            Copiar escrito
          </Button>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading} size="lg">
        {loading ? `Generando escrito… ${segundos}s` : "Generar escrito"}
      </Button>
      {loading ? (
        <div className="flex items-center justify-between text-[12px] text-muted-foreground">
          <span>Redactando con el modelo principal: suele tardar entre 45 y 90 segundos. Podés esperar en esta pestaña.</span>
          <button type="button" className="underline" onClick={() => abortRef.current?.abort()}>Cancelar</button>
        </div>
      ) : (
        <p className="text-[12px] text-muted-foreground">
          Los datos se guardan como borrador en este navegador hasta que generes el escrito.
        </p>
      )}
    </form>
  );
}
