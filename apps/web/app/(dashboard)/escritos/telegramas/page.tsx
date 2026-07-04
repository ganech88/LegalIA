"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PASOS, getPaso } from "@/lib/legal/telegramas";
import { Copy, Check, CalendarPlus, ArrowRight } from "lucide-react";

/**
 * Wizard de comunicaciones laborales: telegrama + plazo agendado en un paso.
 * Diferencial: nadie del mercado encadena la secuencia intimación → plazo →
 * despido indirecto → demanda.
 */
export default function TelegramasPage() {
  const [pasoId, setPasoId] = useState<string>(PASOS[0].id);
  const [datos, setDatos] = useState<Record<string, string>>({});
  const [copiado, setCopiado] = useState(false);
  const [agendado, setAgendado] = useState(false);
  const supabase = createClient();

  const paso = getPaso(pasoId) ?? PASOS[0];
  const texto = paso.generar(datos);

  function setDato(name: string, value: string) {
    setDatos((prev) => ({ ...prev, [name]: value }));
    setAgendado(false);
  }

  async function copiar() {
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  async function agendarPlazo() {
    if (!paso.plazo) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + paso.plazo.dias);
    await supabase.from("vencimientos").insert({
      user_id: user.id,
      titulo: paso.plazo.titulo,
      descripcion: `${paso.plazo.descripcion} (Telegrama a ${datos.empleador || "empleador"})`,
      fecha_vencimiento: fecha.toISOString().slice(0, 10),
      tipo: "plazo_procesal",
    });
    setAgendado(true);
  }

  const inputCls =
    "w-full rounded border border-border bg-white px-3 py-2 text-[13px] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-pale)]";

  return (
    <div className="bg-paper-rules min-h-screen">
      <header className="sticky top-0 z-20 flex items-center border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-3 backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <Link href="/escritos" className="hover:text-[var(--brand-navy)]">Escritos</Link>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Telegramas laborales</span>
        </nav>
      </header>

      <div className="px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
        <header className="mb-6 pb-6 border-b border-[var(--brand-navy)]">
          <div className="masthead-meta mb-2"><span>SECUENCIA DEL DESPIDO INDIRECTO</span></div>
          <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold text-[var(--brand-navy)] tracking-[-0.03em]">
            Telegramas laborales con plazos automáticos
          </h1>
          <p className="mt-2 text-[14px] text-[var(--brand-ink-2)] max-w-[640px]">
            Cada paso genera el texto del telegrama con su base legal y agenda el plazo del paso siguiente.
            De la intimación a la demanda, sin perder un vencimiento.
          </p>
        </header>

        {/* Selector de paso */}
        <div className="mb-6 flex flex-wrap gap-2">
          {PASOS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setPasoId(p.id); setAgendado(false); }}
              className={`rounded border px-3 py-2 text-[12px] font-semibold transition-all ${
                p.id === pasoId
                  ? "border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white"
                  : "border-border bg-white text-[var(--brand-ink-2)] hover:border-[var(--brand-gold)]"
              }`}
            >
              {p.titulo}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
          {/* Formulario */}
          <div className="card-editorial p-6 space-y-4">
            <div>
              <h2 className="font-[var(--font-display)] text-[15px] font-semibold text-[var(--brand-navy)]">{paso.titulo}</h2>
              <p className="mt-1 text-[12.5px] text-[var(--brand-ink-2)]">{paso.descripcion}</p>
              <p className="mt-1.5 font-mono text-[10.5px] text-[var(--brand-mute)]">Base legal: {paso.baseLegal}</p>
            </div>
            {paso.campos.map((c) => (
              <label key={c.name} className="block">
                <span className="t-overline text-[var(--brand-navy)] block mb-1">{c.label}</span>
                {c.multiline ? (
                  <textarea rows={3} value={datos[c.name] ?? ""} onChange={(e) => setDato(c.name, e.target.value)} placeholder={c.placeholder} className={inputCls} />
                ) : (
                  <input value={datos[c.name] ?? ""} onChange={(e) => setDato(c.name, e.target.value)} placeholder={c.placeholder} className={inputCls} />
                )}
              </label>
            ))}
          </div>

          {/* Vista previa + acciones */}
          <div className="card-editorial p-6">
            <div className="masthead-meta mb-3"><span>TEXTO DEL TELEGRAMA / CARTA DOCUMENTO</span></div>
            <div className="whitespace-pre-wrap rounded border border-border bg-[var(--brand-paper)] p-4 font-[var(--font-serif)] text-[13.5px] leading-[1.75] text-[var(--brand-ink)]">
              {texto}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button onClick={copiar} className="flex items-center gap-1.5 rounded bg-[var(--brand-navy)] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--brand-navy-2)]">
                {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiado ? "Copiado" : "Copiar texto"}
              </button>
              {paso.plazo && (
                <button
                  onClick={agendarPlazo}
                  disabled={agendado}
                  className="flex items-center gap-1.5 rounded border border-[var(--brand-navy)] px-4 py-2.5 text-[13px] font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-navy)]/5 disabled:opacity-60"
                >
                  <CalendarPlus className="h-4 w-4" />
                  {agendado ? "✓ Plazo agendado" : `Agendar plazo (${paso.plazo.dias} días)`}
                </button>
              )}
              {paso.siguiente && (
                <button
                  onClick={() => { setPasoId(paso.siguiente!); setAgendado(false); }}
                  className="ml-auto flex items-center gap-1 text-[12px] font-semibold text-[var(--brand-gold)] hover:underline"
                >
                  Paso siguiente <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
              {!paso.siguiente && (
                <Link href="/calculadoras/art-245" className="ml-auto flex items-center gap-1 text-[12px] font-semibold text-[var(--brand-gold)] hover:underline">
                  Calcular liquidación y generar demanda <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {paso.plazo && (
              <p className="mt-3 text-[11px] text-[var(--brand-mute)]">
                Al agendar, el vencimiento aparece en tu <Link href="/agenda" className="underline">Agenda</Link> y
                te llega alerta por email antes de vencer.
              </p>
            )}
            <p className="mt-4 border-t border-border pt-3 text-[10.5px] leading-snug text-[var(--brand-mute)]">
              Plantillas de referencia según fórmulas de práctica habitual. El profesional debe adaptar el texto al
              caso y verificar la vigencia normativa (en especial el régimen de la ley 24.013, alcanzado por reformas
              recientes) antes de enviar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
