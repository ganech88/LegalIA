"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, ShieldAlert, Scale, FileText } from "lucide-react";

/**
 * "Me demandaron": subís o pegás la demanda recibida → análisis con IA
 * (plazo de contestación, debilidades, defensas, excepciones, prueba a
 * reunir) → borrador de contestación pre-armado en un clic.
 */

interface Defensa { defensa: string; base_legal: string }
interface Analisis {
  resumen: string;
  actor: string | null;
  demandado: string | null;
  fuero: string;
  pretension: string;
  monto_reclamado: string | null;
  plazo_contestacion: { dias_habiles: number; fundamento: string; nota?: string };
  hechos_clave: string[];
  debilidades_detectadas: string[];
  defensas_sugeridas: Defensa[];
  excepciones_posibles: string[];
  prueba_a_reunir: string[];
  advertencias: string[];
}

export default function ContestarPage() {
  const [texto, setTexto] = useState("");
  const [archivo, setArchivo] = useState<{ base64: string; media_type: string; nombre: string } | null>(null);
  const [analisis, setAnalisis] = useState<Analisis | null>(null);
  const [loading, setLoading] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    if (f.size > 4 * 1024 * 1024) { setError("El archivo supera los 4 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setArchivo({ base64, media_type: f.type || "application/pdf", nombre: f.name });
    };
    reader.readAsDataURL(f);
  }

  async function analizar() {
    if (!texto.trim() && !archivo) return;
    setLoading(true);
    setError(null);
    setAnalisis(null);
    try {
      const res = await fetch("/api/analizar-documento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modo: "demanda",
          ...(archivo ? { archivo: { base64: archivo.base64, media_type: archivo.media_type } } : {}),
          ...(texto.trim() ? { texto: texto.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "No se pudo analizar la demanda.");
      else setAnalisis(data.analisis as Analisis);
    } catch {
      setError("No se pudo conectar con el servicio de análisis.");
    }
    setLoading(false);
  }

  async function generarContestacion() {
    if (!analisis) return;
    setGenerando(true);
    setError(null);
    const descripcion =
      `Contestación de demanda. Análisis previo del caso:\n` +
      `Actor: ${analisis.actor ?? "s/d"}. Demandado (mi cliente): ${analisis.demandado ?? "s/d"}.\n` +
      `Pretensión: ${analisis.pretension}. Monto reclamado: ${analisis.monto_reclamado ?? "s/d"}.\n` +
      `Hechos alegados por la actora: ${analisis.hechos_clave.join("; ")}.\n` +
      `Debilidades de la demanda a explotar: ${analisis.debilidades_detectadas.join("; ")}.\n` +
      `Defensas a desarrollar: ${analisis.defensas_sugeridas.map((d) => `${d.defensa} (${d.base_legal})`).join("; ")}.\n` +
      `Excepciones previas a plantear: ${analisis.excepciones_posibles.join("; ") || "ninguna"}.\n` +
      `Estructura: negativa general y particularizada de los hechos, excepciones previas si corresponden, defensas de fondo, ofrecimiento de prueba, reserva del caso federal y petitorio.`;

    try {
      const res = await fetch("/api/generate-escrito-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_escrito: "Contestación de demanda",
          fuero: analisis.fuero || "laboral",
          jurisdiccion: "nacional",
          descripcion,
          datos_caso: `Resumen de la demanda recibida: ${analisis.resumen}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "No se pudo generar el borrador.");
      else { router.push(`/escritos/${data.id}`); return; }
    } catch {
      setError("No se pudo conectar con el generador.");
    }
    setGenerando(false);
  }

  const inputCls =
    "w-full rounded border border-border bg-white px-3 py-2.5 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]";

  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="sticky top-0 z-20 flex items-center border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <Link href="/escritos" className="hover:text-[var(--brand-navy)]">Escritos</Link>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Contestar demanda</span>
        </nav>
      </header>

      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
        <header className="mb-6 pb-6 border-b border-[var(--brand-navy)]">
          <div className="masthead-meta mb-2"><span>DEFENSA · ANÁLISIS CON IA</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
            ¿Te demandaron? Subila.
          </h1>
          <p className="mt-2 text-[14px] text-[var(--brand-ink-2)] max-w-[640px]">
            Análisis de la demanda recibida: plazo para contestar, debilidades detectadas, defensas y
            excepciones sugeridas con base legal, prueba a reunir — y el borrador de contestación en un clic.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-6">
          {/* Entrada */}
          <div className="card-editorial p-6 space-y-4">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded border-2 border-dashed border-border bg-[var(--brand-paper)] px-4 py-5 text-center hover:border-[var(--brand-gold)]">
              <Upload className="h-5 w-5 text-[var(--brand-gold)]" />
              <span className="text-[12.5px] font-semibold text-[var(--brand-navy)]">
                {archivo ? archivo.nombre : "Subir PDF de la demanda"}
              </span>
              <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={onFile} className="hidden" />
            </label>
            <div className="text-center font-mono text-[10px] uppercase tracking-widest text-[var(--brand-mute)]">— o pegá el texto —</div>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={12}
              placeholder="Pegá acá el texto de la demanda…"
              className={inputCls}
            />
            <button
              onClick={analizar}
              disabled={loading || (!texto.trim() && !archivo)}
              className="w-full rounded bg-[var(--brand-navy)] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[var(--brand-navy-2)] disabled:opacity-50"
            >
              {loading ? "Analizando la demanda…" : "Analizar demanda"}
            </button>
            {error && <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p>}
            <p className="text-[10.5px] leading-snug text-[var(--brand-mute)]">
              Cuenta como una consulta. El documento no se almacena. El borrador de contestación cuenta como un escrito.
            </p>
          </div>

          {/* Análisis */}
          <div className="card-editorial p-6">
            {!analisis ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <Scale className="mb-3 h-10 w-10 text-[var(--brand-gold)] opacity-50" />
                <p className="text-[13px] text-[var(--brand-mute)] max-w-[400px]">
                  Acá vas a ver el análisis completo: plazo, debilidades de la demanda, defensas con base legal,
                  excepciones y la prueba que conviene reunir ya.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="masthead-meta mb-2"><span>ANÁLISIS DE LA DEMANDA</span></div>
                  <p className="text-[13.5px] leading-relaxed text-[var(--brand-ink)]">{analisis.resumen}</p>
                  <p className="mt-2 text-[12px] text-[var(--brand-mute)]">
                    {analisis.actor ?? "Actor s/d"} c/ {analisis.demandado ?? "demandado s/d"} · fuero {analisis.fuero}
                    {analisis.monto_reclamado ? ` · reclama ${analisis.monto_reclamado}` : ""}
                  </p>
                </div>

                <div className="rounded border border-[var(--brand-gold)]/40 bg-[var(--brand-gold)]/10 px-4 py-3">
                  <p className="text-[13px] font-bold text-[var(--brand-navy)]">
                    ⏱ Plazo para contestar: {analisis.plazo_contestacion.dias_habiles} días hábiles ({analisis.plazo_contestacion.fundamento})
                  </p>
                  {analisis.plazo_contestacion.nota && (
                    <p className="mt-1 text-[11.5px] text-[var(--brand-ink-2)]">{analisis.plazo_contestacion.nota}</p>
                  )}
                  <Link href="/agenda/cedula" className="mt-1 inline-block text-[11.5px] text-[var(--brand-navy)] underline underline-offset-2">
                    Calculá el vencimiento exacto y agendalo →
                  </Link>
                </div>

                <Seccion titulo="Debilidades detectadas" items={analisis.debilidades_detectadas} icono="alerta" />
                <Seccion titulo="Defensas sugeridas" items={analisis.defensas_sugeridas.map((d) => `${d.defensa} — ${d.base_legal}`)} />
                {analisis.excepciones_posibles.length > 0 && <Seccion titulo="Excepciones previas posibles" items={analisis.excepciones_posibles} />}
                <Seccion titulo="Prueba a reunir ya" items={analisis.prueba_a_reunir} />

                {analisis.advertencias.length > 0 && (
                  <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11.5px] text-amber-800">
                    {analisis.advertencias.map((a, i) => <p key={i}>⚠ {a}</p>)}
                  </div>
                )}

                <button
                  onClick={generarContestacion}
                  disabled={generando}
                  className="flex w-full items-center justify-center gap-2 rounded bg-[var(--brand-gold)] px-4 py-3 text-[14px] font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-gold)]/80 disabled:opacity-60"
                >
                  <FileText className="h-4 w-4" />
                  {generando ? "Generando el borrador…" : "Generar borrador de contestación →"}
                </button>

                <p className="text-[10.5px] leading-snug text-[var(--brand-mute)]">
                  El análisis es asistencia estratégica: verificá cada norma citada (usá el semáforo de citas del
                  editor) y los cálculos de plazos antes de actuar.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Seccion({ titulo, items, icono }: { titulo: string; items: string[]; icono?: "alerta" }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-[var(--brand-navy)]">
        {icono === "alerta" && <ShieldAlert className="h-3.5 w-3.5 text-[var(--brand-gold)]" />}
        {titulo}
      </h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-[12.5px] leading-snug text-[var(--brand-ink-2)]">
            <span className="text-[var(--brand-gold)]">§</span>{item}
          </li>
        ))}
      </ul>
    </div>
  );
}
