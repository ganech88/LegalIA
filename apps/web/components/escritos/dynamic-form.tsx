"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { FormField, EscritoTemplate } from "@/types";

interface DynamicFormProps {
  template: EscritoTemplate;
}

export function DynamicForm({ template }: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

    const res = await fetch("/api/generate-escrito", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template_id: template.id,
        datos_caso: values,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Error al generar el escrito. Intentá de nuevo.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    router.push(`/escritos/${data.id}`);
  }

  const fields: FormField[] = template.campos_requeridos.fields;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
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

      <Button type="submit" className="w-full" disabled={loading} size="lg">
        {loading ? "Generando escrito..." : "Generar escrito"}
      </Button>
    </form>
  );
}
