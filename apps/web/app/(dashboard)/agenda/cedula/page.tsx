"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { calcularVencimiento, PRESETS_PLAZO } from "@/lib/legal/plazos";
import { Upload, CalendarPlus, AlertTriangle, FileText } from "lucide-react";

/**
 * "Subí la cédula": foto o PDF de la notificación → la IA detecta el acto,
 * la fecha y el plazo → LegalIA calcula el vencimiento en días hábiles
 * judiciales y lo agenda con alerta. El hábito diario del abogado.
 */

interface Analisis {
  tipo_documento: string;
  tipo_acto: string;
  fecha_notificacion: string | null;
  tribunal: string | null;
  caratula: string | null;
  expediente: string | null;
  plazo: { dias_habiles: number | null; fundamento: string; preset_id: string } | null;
  resumen: string;
  advertencias: string[];
}

export default function CedulaPage() {
  const [archivo, setArchivo] = useState<{ base64: string; media_type: string; nombre: string } | null>(null);
  const [analisis, setAnalisis] = useState<Analisis | null>(null);
  const [fechaNotif, setFechaNotif] = useState("");
  const [dias, setDias] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agendado, setAgendado] = useState(false);
  const supabase = createClient();

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    setAnalisis(null);
    setAgendado(false);
    if (f.size > 4 * 1024 * 1024) {
      setError("El archivo supera los 4 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      setArchivo({ base64, media_type: f.type || "application/pdf", nombre: f.name });
    };
    reader.readAsDataURL(f);
  }

  async function analizar() {
    if (!archivo) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analizar-documento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "cedula", archivo: { base64: archivo.base64, media_type: archivo.media_type } }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo analizar el documento.");
      } else {
        const a = data.analisis as Analisis;
        setAnalisis(a);
        if (a.fecha_notificacion) setFechaNotif(a.fecha_notificacion);
        if (a.plazo?.dias_habiles) setDias(a.plazo.dias_habiles);
      }
    } catch {
      setError("No se pudo conectar con el servicio de análisis.");
    }
    setLoading(false);
  }

  const vencimiento = fechaNotif
    ? (() => { try { return calcularVencimiento({ desde: fechaNotif, diasHabiles: dias }); } catch { return null; } })()
    : null;

  async function agendar() {
    if (!vencimiento || !analisis) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("vencimientos").insert({
      user_id: user.id,
      titulo: `${analisis.tipo_acto}${analisis.caratula ? ` — ${analisis.caratula}` : ""}`.slice(0, 200),
      descripcion: `Detectado desde ${analisis.tipo_documento}. Plazo: ${dias} días hábiles (${analisis.plazo?.fundamento ?? "verificar"}). Notificado el ${fechaNotif}. Día de gracia: ${vencimiento.diaGracia}.`,
      fecha_vencimiento: vencimiento.vencimiento,
      tipo: "plazo_procesal",
    });
    setAgendado(true);
  }

  const inputCls =
    "w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]";

  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="sticky top-0 z-20 flex items-center border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <Link href="/agenda" className="hover:text-[var(--brand-navy)]">Agenda</Link>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Subir cédula</span>
        </nav>
      </header>

      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
        <header className="mb-6 pb-6 border-b border-[var(--brand-navy)]">
          <div className="masthead-meta mb-2"><span>NOTIFICACIONES · IA CON VISIÓN</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
            Subí la cédula. LegalIA te agenda el plazo.
          </h1>
          <p className="mt-2 text-[14px] text-[var(--brand-ink-2)] max-w-[640px]">
            Sacale una foto o subí el PDF de la notificación: detectamos el acto, la fecha y el plazo,
            calculamos el vencimiento en días hábiles judiciales y lo agendamos con alerta por email.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
          {/* Carga */}
          <div className="card-editorial p-6 space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded border-2 border-dashed border-border bg-[var(--brand-paper)] px-6 py-10 text-center hover:border-[var(--brand-gold)]">
              <Upload className="h-7 w-7 text-[var(--brand-gold)]" />
              <span className="text-[13px] font-semibold text-[var(--brand-navy)]">
                {archivo ? archivo.nombre : "Elegí una foto o PDF de la cédula"}
              </span>
              <span className="text-[11px] text-[var(--brand-mute)]">JPG, PNG o PDF · máx. 4 MB · no se almacena</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={onFile} className="hidden" />
            </label>

            <button
              onClick={analizar}
              disabled={!archivo || loading}
              className="w-full rounded bg-[var(--brand-navy)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)] disabled:opacity-50"
            >
              {loading ? "Analizando el documento…" : "Analizar con IA"}
            </button>

            {error && (
              <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p>
            )}

            <p className="text-[10.5px] leading-snug text-[var(--brand-mute)]">
              El análisis cuenta como una consulta de tu plan. El documento se procesa y se descarta: no queda
              almacenado en LegalIA.
            </p>
          </div>

          {/* Resultado */}
          <div className="card-editorial p-6">
            {!analisis ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <FileText className="mb-3 h-10 w-10 text-[var(--brand-gold)] opacity-50" />
                <p className="text-[13px] text-[var(--brand-mute)] max-w-[380px]">
                  Acá vas a ver qué se notifica, la fecha, el tribunal y el plazo — con el vencimiento
                  calculado en días hábiles, listo para agendar.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="masthead-meta mb-2"><span>ANÁLISIS DEL DOCUMENTO</span></div>
                  <h3 className="font-[var(--font-display)] text-lg font-semibold text-[var(--brand-navy)]">
                    {analisis.tipo_acto}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-[var(--brand-ink-2)]">{analisis.resumen}</p>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12.5px]">
                  {analisis.caratula && (<><dt className="font-semibold text-[var(--brand-navy)]">Carátula</dt><dd className="text-[var(--brand-ink-2)]">{analisis.caratula}</dd></>)}
                  {analisis.expediente && (<><dt className="font-semibold text-[var(--brand-navy)]">Expediente</dt><dd className="text-[var(--brand-ink-2)]">{analisis.expediente}</dd></>)}
                  {analisis.tribunal && (<><dt className="font-semibold text-[var(--brand-navy)]">Tribunal</dt><dd className="text-[var(--brand-ink-2)]">{analisis.tribunal}</dd></>)}
                  {analisis.plazo?.fundamento && (<><dt className="font-semibold text-[var(--brand-navy)]">Fundamento del plazo</dt><dd className="text-[var(--brand-ink-2)]">{analisis.plazo.fundamento}</dd></>)}
                </dl>

                {analisis.advertencias?.length > 0 && (
                  <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2.5">
                    {analisis.advertencias.map((a, i) => (
                      <p key={i} className="flex items-start gap-1.5 text-[11.5px] text-amber-800">
                        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />{a}
                      </p>
                    ))}
                  </div>
                )}

                <div className="rounded border border-border bg-[var(--brand-paper)] p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="t-overline text-[var(--brand-navy)] block mb-1">Fecha de notificación</span>
                      <input type="date" value={fechaNotif} onChange={(e) => { setFechaNotif(e.target.value); setAgendado(false); }} className={inputCls} />
                    </label>
                    <label className="block">
                      <span className="t-overline text-[var(--brand-navy)] block mb-1">Plazo (días hábiles)</span>
                      <select value={dias} onChange={(e) => { setDias(Number(e.target.value)); setAgendado(false); }} className={inputCls}>
                        {PRESETS_PLAZO.map((p) => (
                          <option key={p.id} value={p.dias}>{p.dias} días — {p.label}</option>
                        ))}
                        <option value={3}>3 días — otro</option>
                      </select>
                    </label>
                  </div>

                  {vencimiento && (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-bold text-[var(--brand-navy)]">
                          Vence el {vencimiento.vencimiento.split("-").reverse().join("/")}
                        </p>
                        <p className="text-[11px] text-[var(--brand-mute)]">
                          Día de gracia (art. 124 CPCCN): {vencimiento.diaGracia.split("-").reverse().join("/")} ·
                          se excluyeron {vencimiento.excluidos.length} día(s) inhábil(es)
                        </p>
                      </div>
                      <button
                        onClick={agendar}
                        disabled={agendado}
                        className="flex items-center gap-1.5 rounded bg-[var(--brand-gold)] px-4 py-2.5 text-[13px] font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-gold)]/80 disabled:opacity-60"
                      >
                        <CalendarPlus className="h-4 w-4" />
                        {agendado ? "✓ Agendado con alerta" : "Agendar vencimiento"}
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-[10.5px] leading-snug text-[var(--brand-mute)]">
                  Verificá fecha y plazo contra el documento original y la jurisdicción: los plazos provinciales
                  y de fueros especiales pueden diferir. La detección es asistencia, no reemplaza tu control.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
