"use client";

/**
 * Hook de verificación de citas en dos pasos:
 * 1. Instantáneo, offline: contra el corpus curado local (citas.ts).
 * 2. Asincrónico: las citas que quedaron sin verificar pero cuya ley SÍ está
 *    identificada se re-consultan contra legal_knowledge (textos completos de
 *    LCT y CCCN ingestados desde InfoLeg). Si el artículo existe allá, la cita
 *    pasa a "verificada" con el epígrafe real de la norma.
 */

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  verificarCitas,
  resumirCitas,
  type CitaVerificada,
  type ResultadoVerificacion,
} from "./citas";

export function useCitasVerificadas(texto: string): ResultadoVerificacion {
  const local = useMemo(() => verificarCitas(texto), [texto]);
  const [mejoradas, setMejoradas] = useState<CitaVerificada[] | null>(null);

  useEffect(() => {
    setMejoradas(null);
    const pendientes = local.citas.filter((c) => c.estado !== "verificada" && c.lookup);
    if (pendientes.length === 0) return;

    let cancelado = false;
    const supabase = createClient();
    const numeros = Array.from(new Set(pendientes.map((c) => c.lookup!.articulo)));
    const fuentes = Array.from(new Set(pendientes.flatMap((c) => c.lookup!.sources)));

    supabase
      .from("legal_knowledge")
      .select("source_name, article_number, title")
      .in("source_name", fuentes)
      .in("article_number", numeros)
      .then(({ data }) => {
        if (cancelado || !data || data.length === 0) return;
        setMejoradas(
          local.citas.map((c) => {
            if (c.estado === "verificada" || !c.lookup) return c;
            const hit = data.find(
              (r) =>
                c.lookup!.sources.includes(r.source_name) &&
                (r.article_number ?? "").toLowerCase() === c.lookup!.articulo,
            );
            if (!hit) return c;
            return {
              ...c,
              estado: "verificada" as const,
              detalle: `${hit.title} — coincide con el texto completo de la norma (fuente oficial InfoLeg).`,
              fuente: `${hit.source_name}, art. ${hit.article_number}`,
            };
          }),
        );
      });

    return () => {
      cancelado = true;
    };
  }, [local]);

  const citas = mejoradas ?? local.citas;
  return { citas, resumen: resumirCitas(citas) };
}
