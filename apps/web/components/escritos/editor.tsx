"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, Save, Check, AlignJustify } from "lucide-react";
import type { Escrito } from "@/types";

interface EscritoEditorProps {
  escrito: Escrito;
}

export function EscritoEditor({ escrito }: EscritoEditorProps) {
  const [content, setContent] = useState(escrito.contenido_editado || escrito.contenido_generado);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
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
              size: { width: 11906, height: 16838 },
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
            onClick={handleExportDocx}
            title="Exportar como DOCX"
            className="flex items-center gap-1.5 rounded border border-border bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--brand-ink-2)] hover:border-[var(--brand-gold)]"
          >
            <Download className="h-3.5 w-3.5" />
            DOCX
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
      <div className="flex flex-1 flex-col overflow-hidden bg-[var(--brand-paper)]">
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
        </div>
        <div className="font-mono text-[10px] text-[var(--brand-mute)]">
          Times New Roman 12pt · A4 · Interlineado doble
        </div>
      </div>
    </div>
  );
}
