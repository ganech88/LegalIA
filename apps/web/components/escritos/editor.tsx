"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, Save, Check, AlignJustify, FileText, PenLine, ShieldCheck, History } from "lucide-react";
import { PanelCitas } from "./panel-citas";
import { PanelVersiones } from "./panel-versiones";
import { CasoSelector } from "./caso-selector";
import type { Escrito } from "@/types";

interface EscritoEditorProps {
  escrito: Escrito;
}

/** Detecta títulos de sección para resaltarlos en negrita en el DOCX. */
function isHeading(line: string): boolean {
  // Encabezado con numeral romano: "I. OBJETO", "VIII) PETITORIO", "IV - HECHOS"
  if (/^[IVXLCDM]+\s*[.)\-]\s+\S/.test(line)) return true;
  const keywords = [
    "OBJETO", "PERSONERIA", "PERSONERÍA", "HECHOS", "DERECHO", "PRUEBA",
    "PETITORIO", "LIQUIDACION", "LIQUIDACIÓN", "RESERVA", "COMPETENCIA",
    "DOCUMENTAL", "TESTIMONIAL", "PERICIAL", "INFORMATIVA", "CONFESIONAL",
  ];
  const letters = line.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, "");
  const isAllCaps = letters.length > 0 && letters === letters.toUpperCase() && line.length <= 60;
  return isAllCaps && keywords.some((k) => line.toUpperCase().includes(k));
}

export function EscritoEditor({ escrito }: EscritoEditorProps) {
  const [content, setContent] = useState(escrito.contenido_editado || escrito.contenido_generado);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [showCitas, setShowCitas] = useState(false);
  const [showVersiones, setShowVersiones] = useState(false);
  const [autoSavedAt, setAutoSavedAt] = useState<Date | null>(null);
  const lastSavedContent = useRef(content);
  const lastVersionAt = useRef(0);
  const supabase = createClient();

  const wordCount = useMemo(
    () => content.trim().split(/\s+/).filter(Boolean).length,
    [content]
  );

  const charCount = content.length;

  /** Snapshot en el historial de versiones (manual o automático). */
  const saveVersion = useCallback(async (contenido: string, origen: "manual" | "auto") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("escritos_versiones").insert({
      escrito_id: escrito.id,
      user_id: user.id,
      contenido,
      origen,
    });
    lastVersionAt.current = Date.now();
  }, [escrito.id, supabase]);

  // AUTOSAVE: guarda 2,5 s después de la última tecla. Nunca perdés una edición.
  useEffect(() => {
    if (content === lastSavedContent.current) return;
    const timer = setTimeout(async () => {
      const { error } = await supabase
        .from("escritos")
        .update({ contenido_editado: content })
        .eq("id", escrito.id);
      if (!error) {
        lastSavedContent.current = content;
        setAutoSavedAt(new Date());
        // Versión automática como máximo cada 5 minutos.
        if (Date.now() - lastVersionAt.current > 5 * 60 * 1000) {
          await saveVersion(content, "auto");
        }
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [content, escrito.id, supabase, saveVersion]);

  async function handleSave() {
    setSaving(true);
    setSaveOk(false);
    await supabase
      .from("escritos")
      .update({ contenido_editado: content })
      .eq("id", escrito.id);
    lastSavedContent.current = content;
    await saveVersion(content, "manual");
    setSaving(false);
    setSaveOk(true);
    setTimeout(() => setSaveOk(false), 2500);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleExportDocx() {
    const { Document, Packer, Paragraph, TextRun, AlignmentType, Header, Footer, PageNumber } =
      await import("docx");
    const { saveAs } = await import("file-saver");

    // Membrete con datos del profesional (si los cargó en su perfil).
    const { data: { user } } = await supabase.auth.getUser();
    let membrete = "";
    if (user) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name, matricula, colegio_abogados, estudio_nombre")
        .eq("id", user.id)
        .single();
      if (prof) {
        const linea1 = prof.estudio_nombre || prof.full_name || "";
        const datos = [
          prof.full_name && prof.estudio_nombre ? prof.full_name : "",
          prof.matricula ? `Mat. ${prof.matricula}` : "",
          prof.colegio_abogados || "",
        ].filter(Boolean).join(" · ");
        membrete = [linea1, datos].filter(Boolean).join("\n");
      }
    }

    const TXT = (text: string, opts: { bold?: boolean } = {}) =>
      new TextRun({ text, font: "Times New Roman", size: 24, bold: opts.bold });

    const bodyParagraphs = content.split("\n").map((line) => {
      const trimmed = line.trim();
      if (trimmed === "") {
        return new Paragraph({ children: [TXT("")], spacing: { line: 360 } });
      }
      const esTitulo = isHeading(trimmed);
      return new Paragraph({
        children: [TXT(line, { bold: esTitulo })],
        spacing: { line: 360, before: esTitulo ? 160 : 0 },
        alignment: esTitulo ? AlignmentType.LEFT : AlignmentType.JUSTIFIED,
      });
    });

    const header = membrete
      ? new Header({
          children: membrete.split("\n").map(
            (l, i) =>
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { line: 240 },
                children: [new TextRun({ text: l, font: "Times New Roman", size: i === 0 ? 22 : 18, bold: i === 0 })],
              }),
          ),
        })
      : undefined;

    const footer = new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Página ", font: "Times New Roman", size: 18 }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Times New Roman", size: 18 }),
            new TextRun({ text: " de ", font: "Times New Roman", size: 18 }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Times New Roman", size: 18 }),
          ],
        }),
      ],
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: { width: 11906, height: 16838 },
              margin: { top: 1417, right: 1417, bottom: 1417, left: 1417 },
            },
          },
          headers: header ? { default: header } : undefined,
          footers: { default: footer },
          children: bodyParagraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${escrito.titulo}.docx`);
  }

  async function handleInsertSignature() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: prof } = await supabase
      .from("profiles")
      .select("full_name, matricula, colegio_abogados")
      .eq("id", user.id)
      .single();
    const nombre = prof?.full_name || "";
    const mat = prof?.matricula ? `Mat. ${prof.matricula}` : "";
    const colegio = prof?.colegio_abogados || "";
    const firma = [
      "",
      "",
      "_______________________________",
      nombre,
      ["Abogado/a", mat].filter(Boolean).join(" — "),
      colegio,
    ].filter((l, i) => i < 3 || l).join("\n");
    setContent((c) => `${c}\n${firma}`);
  }

  function handleExportPdf() {
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const html = content.split("\n").map((line) => {
      const t = line.trim();
      if (t === "") return "<p>&nbsp;</p>";
      const heading = /^[IVXLCDM]+\s*[.)\-]\s+\S/.test(t);
      return `<p class="${heading ? "h" : ""}">${esc(line)}</p>`;
    }).join("");
    const doc = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${esc(escrito.titulo)}</title>
<style>@page{size:A4;margin:2.5cm} body{font-family:'Times New Roman',Georgia,serif;font-size:12pt;line-height:1.8;color:#000;text-align:justify}
p{margin:0 0 .2em} p.h{font-weight:bold;text-align:left;margin-top:.8em}</style></head>
<body>${html}<script>window.onload=function(){window.print()}<\/script></body></html>`;
    const w = window.open("", "_blank");
    if (!w) { alert("Permití las ventanas emergentes para exportar a PDF."); return; }
    w.document.write(doc);
    w.document.close();
  }

  return (
    <div className="flex h-full flex-col card-editorial overflow-hidden">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-[var(--brand-paper)] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="font-[var(--font-display)] text-xl font-semibold italic text-[var(--brand-gold)]">§</div>
          <h2 className="truncate font-[var(--font-display)] text-[14px] font-semibold text-[var(--brand-navy)]">
            {escrito.titulo}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={handleCopy}
            title="Copiar al portapapeles"
            className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-[11px] font-semibold transition-all ${
              copied
                ? "border-[var(--brand-gold)] bg-[var(--brand-gold)]/10 text-[var(--brand-navy)]"
                : "border-border bg-white text-[var(--brand-ink-2)] hover:border-[var(--brand-gold)]"
            }`}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar"}
          </button>

          <button
            onClick={() => { setShowCitas((v) => !v); setShowVersiones(false); }}
            title="Verificar citas legales contra el corpus"
            className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-[11px] font-semibold transition-all ${
              showCitas
                ? "border-[var(--brand-gold)] bg-[var(--brand-gold)]/10 text-[var(--brand-navy)]"
                : "border-border bg-white text-[var(--brand-ink-2)] hover:border-[var(--brand-gold)]"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Citas
          </button>

          <button
            onClick={() => { setShowVersiones((v) => !v); setShowCitas(false); }}
            title="Historial de versiones"
            className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-[11px] font-semibold transition-all ${
              showVersiones
                ? "border-[var(--brand-gold)] bg-[var(--brand-gold)]/10 text-[var(--brand-navy)]"
                : "border-border bg-white text-[var(--brand-ink-2)] hover:border-[var(--brand-gold)]"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            Versiones
          </button>

          <button
            onClick={handleInsertSignature}
            title="Insertar firma del estudio"
            className="flex items-center gap-1.5 rounded border border-border bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--brand-ink-2)] hover:border-[var(--brand-gold)]"
          >
            <PenLine className="h-3.5 w-3.5" />
            Firma
          </button>

          <button
            onClick={handleExportDocx}
            title="Exportar como DOCX"
            className="flex items-center gap-1.5 rounded border border-border bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--brand-ink-2)] hover:border-[var(--brand-gold)]"
          >
            <Download className="h-3.5 w-3.5" />
            DOCX
          </button>

          <button
            onClick={handleExportPdf}
            title="Exportar como PDF (imprimir)"
            className="flex items-center gap-1.5 rounded border border-border bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--brand-ink-2)] hover:border-[var(--brand-gold)]"
          >
            <FileText className="h-3.5 w-3.5" />
            PDF
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            title="Guardar cambios"
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-[11px] font-bold transition-all disabled:opacity-60 ${
              saveOk
                ? "bg-[var(--brand-gold)] text-[var(--brand-navy)]"
                : "bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy-2)]"
            }`}
          >
            {saving ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando...
              </>
            ) : saveOk ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Guardado
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Guardar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Document area */}
      <div className="flex flex-1 overflow-hidden bg-[var(--brand-paper)]">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`
            flex-1 resize-none rounded-none border-0 bg-transparent p-8 shadow-none
            font-[var(--font-serif)] text-[15px] leading-[1.9] text-[var(--brand-ink)]
            placeholder:text-[var(--brand-mute)]
            focus-visible:ring-0 focus-visible:ring-offset-0
            min-h-[520px]
          `}
          spellCheck
        />
        {showCitas && <PanelCitas texto={content} onClose={() => setShowCitas(false)} />}
        {showVersiones && (
          <PanelVersiones
            escritoId={escrito.id}
            onRestore={(c) => setContent(c)}
            onClose={() => setShowVersiones(false)}
          />
        )}
      </div>

      {/* Status bar */}
      <div className="flex shrink-0 items-center justify-between border-t border-border bg-[var(--brand-paper-2)] px-4 py-2">
        <div className="flex items-center gap-3 font-mono text-[10px] text-[var(--brand-mute)]">
          <span className="flex items-center gap-1">
            <AlignJustify className="h-3 w-3" />
            {wordCount.toLocaleString("es-AR")} palabras
          </span>
          <span className="opacity-40">·</span>
          <span>{charCount.toLocaleString("es-AR")} caracteres</span>
          {autoSavedAt && (
            <>
              <span className="opacity-40">·</span>
              <span className="text-emerald-700">
                Auto-guardado {autoSavedAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <CasoSelector
            escritoId={escrito.id}
            initialCasoId={(escrito as { caso_id?: string | null }).caso_id ?? null}
          />
          <div className="font-mono text-[10px] text-[var(--brand-mute)]">
            Times New Roman 12pt · A4
          </div>
        </div>
      </div>
    </div>
  );
}
