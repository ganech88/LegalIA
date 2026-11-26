"use client";

import { useState } from "react";

interface Fila {
  clave: string;
  nombre: string;
  infolegId: number;
  cargados: number;
}

/** Botones de prueba y carga de cada norma del catálogo de InfoLeg. */
export function IngestaNormas({ normas }: { normas: Fila[] }) {
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [salida, setSalida] = useState<Record<string, string>>({});

  async function ejecutar(clave: string, probar: boolean) {
    setOcupado(clave);
    setSalida((s) => ({ ...s, [clave]: probar ? "Descargando y revisando…" : "Cargando…" }));
    try {
      const res = await fetch("/api/admin/ingest-norma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clave, probar }),
      });
      const d = await res.json().catch(() => ({}));
      const texto = d.error
        ? `Error: ${d.error}`
        : `${d.valido ? "Correcto" : "No válido"} · ${d.articulos} artículos (del ${d.primero} al ${d.ultimo}), ${d.derogados} derogados${d.cargado ? ` · cargados ${d.cargado}` : ""}${d.motivo ? ` · ${d.motivo}` : ""}`;
      setSalida((s) => ({ ...s, [clave]: texto }));
    } catch {
      setSalida((s) => ({ ...s, [clave]: "Error de conexión." }));
    }
    setOcupado(null);
  }

  const boton = "rounded border px-3 py-1.5 text-[12px] font-semibold disabled:opacity-50";
  return (
    <ul className="divide-y divide-border">
      {normas.map((n) => (
        <li key={n.clave} className="py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[13px] font-semibold text-[var(--brand-navy)]">{n.nombre}</div>
              <div className="text-[11px] text-[var(--brand-mute)]">InfoLeg {n.infolegId} · en la base: {n.cargados} artículos</div>
            </div>
            <div className="flex gap-2">
              <button type="button" disabled={ocupado !== null} onClick={() => ejecutar(n.clave, true)} className={`${boton} border-border text-[var(--brand-ink-2)]`}>Probar</button>
              <button type="button" disabled={ocupado !== null} onClick={() => ejecutar(n.clave, false)} className={`${boton} border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white`}>{n.cargados ? "Actualizar" : "Cargar"}</button>
            </div>
          </div>
          {salida[n.clave] && <p className="mt-2 text-[12px] text-[var(--brand-ink-2)]">{salida[n.clave]}</p>}
        </li>
      ))}
    </ul>
  );
}
