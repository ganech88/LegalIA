"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, Save, Check, FileText, AlignJustify } from "lucide-react";
import type { Escrito } from "@/types";

interface EscritoEditorProps {
  escrito: Escrito;
}

export function EscritoEditor({ escrito }: EscritoEditorProps) {
  const [content, setContent]   = useState(escrito.contenido_editado || escrito.contenido_generado);
  const [saving, setSaving]     = useState(false);
  const [copied, setCopied]     = useState(false);
  const [saveOk, setSaveOk]     = useState(false);
  const supabase = createClient();

  const wordCount = useMemo(
    () => content.trim().split(/\s+/).filter(Boolean).length,
    [content]
  );

  const charCount = content.length;

  async function handleSave() {
    setSaving(true);
    setSaveOk(false);
    await supabase
      .from("escritos")
      .update({ contenido_editado: content })
      .eq("id", escrito.id);
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
    const { Document, Packer, Paragraph, TextRun } = await import("docx");
    const { saveAs } = await import("file-saver");

    const paragraphs = content.split("\n").map(
      (line) =>
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: "Times New Roman",
              size: 24,
            }),
          ],
          spacing: { line: 360 },
          alignment: "both" as unknown as undefined,
        })
    );

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size:   { width: 11906, height: 16838 },
              margin: { top: 1417, right: 1417, bottom: 1417, left: 1417 },
            },
          },
          children: paragraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${escrito.titulo}.docx`);
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
        {/* Title + icon */}
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1e3a5f]">
            <FileText className="h-3.5 w-3.5 text-white" />
          </div>
          <h2 className="truncate text-sm font-bold text-[#0f172a]">
            {escrito.titulo}
          </h2>
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={handleCopy}
            title="Copiar al portapapeles"
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              copied
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100"
            }`}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copiado" : "Copiar"}
          </button>

          <button
            onClick={handleExportDocx}
            title="Exportar como DOCX"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-100"
          >
            <Download className="h-3.5 w-3.5" />
            DOCX
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            title="Guardar cambios"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 disabled:opacity-60 ${
              saveOk
                ? "bg-emerald-600 text-white"
                : "bg-[#1e3a5f] text-white hover:bg-[#1d4ed8] hover:shadow-md"
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

      {/* ── Document area ───────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#faf9f7]">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`
            flex-1 resize-none rounded-none border-0 bg-transparent p-8 shadow-none
            font-serif text-[15px] leading-[1.9] text-slate-800
            placeholder:text-slate-400
            focus-visible:ring-0 focus-visible:ring-offset-0
            min-h-[520px]
          `}
          style={{ fontFamily: "'Times New Roman', Times, serif" }}
          spellCheck
        />
      </div>

      {/* ── Status bar ──────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2">
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <AlignJustify className="h-3 w-3" />
            {wordCount.toLocaleString("es-AR")} palabras
          </span>
          <span className="text-slate-300">·</span>
          <span>{charCount.toLocaleString("es-AR")} caracteres</span>
        </div>
        <div className="text-[10px] font-medium text-slate-400">
          Formato: Times New Roman 12pt · A4 · Interlineado doble
        </div>
      </div>
    </div>
  );
}
