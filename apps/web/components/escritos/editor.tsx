"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Download, Save, Check } from "lucide-react";
import type { Escrito } from "@/types";

interface EscritoEditorProps {
  escrito: Escrito;
}

export function EscritoEditor({ escrito }: EscritoEditorProps) {
  const [content, setContent] = useState(escrito.contenido_editado || escrito.contenido_generado);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  async function handleSave() {
    setSaving(true);
    await supabase
      .from("escritos")
      .update({ contenido_editado: content })
      .eq("id", escrito.id);
    setSaving(false);
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Editor</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportDocx}>
              <Download className="h-4 w-4 mr-1" />
              DOCX
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[600px] font-serif text-sm leading-relaxed"
        />
      </CardContent>
    </Card>
  );
}
