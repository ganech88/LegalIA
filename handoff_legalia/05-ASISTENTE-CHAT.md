# 05 — Asistente IA / Chat

> **Archivo principal:** `apps/web/app/(dashboard)/asistente/page.tsx` (10KB) + componente de chat.
> **API preservada:** `app/api/chat/route.ts` NO se toca.
> **Preview embebido en dashboard:** ver también `ChatIAPreview` en 04-DASHBOARD.

---

## Anatomía del chat editorial

```
┌─────────────────────────────────────────────┐
│ HEAD: navy gradient                         │
│ [§ mark] Asistente IA Jurídico   Online ●  │
│          Derecho argentino · citas verif.   │
├─────────────────────────────────────────────┤
│ BODY: paper bg, scrollable                  │
│                                             │
│  [User msg — navy bubble, right-aligned]    │
│                                             │
│  [AI msg — white card, left-aligned]        │
│   Respuesta con <span class="cite-chip">    │
│   art. 256 LCT</span> inline.               │
│                                             │
│   ┌─ SOURCES PANEL ─────────────────────┐  │
│   │ ◆ Fuentes citadas · 3              │  │
│   │ [LCT.256] Ley 20.744 · Prescripción│  │
│   │ [L25323]  Ley 25.323 · Incremento  │  │
│   │ [LCT.80]  Art. 80 LCT · Ramírez    │  │
│   └────────────────────────────────────┘  │
│                                             │
│   ¿Fue útil? [👍 Sí] [👎 No]  ◆ Generar   │
│                                             │
├─────────────────────────────────────────────┤
│ INPUT                                       │
│ Chips sugeridos: [art. 245] [plazos]...    │
│ ┌──────────────────────────────────┐  [↑] │
│ │ Escribí tu consulta…             │      │
│ └──────────────────────────────────┘      │
│ Disclaimer legal                            │
└─────────────────────────────────────────────┘
```

---

## Componente `ChatBubble`

```tsx
// components/chat/chat-bubble.tsx
"use client";

import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown, FileText } from "lucide-react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;             // markdown/plain con citas inline como {{art.256 LCT}}
  sources?: Array<{ badge: string; title: string }>;
  feedback?: "util" | "no_util" | null;
};

export function ChatBubble({ msg, onFeedback, onGenerateEscrito }: {
  msg: ChatMessage;
  onFeedback?: (v: "util" | "no_util") => void;
  onGenerateEscrito?: () => void;
}) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-2.5 mb-5 max-w-[88%]", isUser && "ml-auto flex-row-reverse")}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
        isUser
          ? "bg-[var(--brand-paper-3)] text-[var(--brand-navy)]"
          : "bg-[var(--brand-navy)] text-[var(--brand-gold)] font-serif italic text-base"
      )}>
        {isUser ? "TÚ" : "§"}
      </div>

      <div className={cn(
        "rounded border px-4 py-3.5 text-[13px] leading-[1.6]",
        isUser
          ? "bg-[var(--brand-navy)] text-white border-[var(--brand-navy)]"
          : "bg-white border-border text-[var(--brand-ink)]"
      )}>
        {/* Render content con citas inline — ver renderWithCitations abajo */}
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: renderWithCitations(msg.content) }}
        />

        {!isUser && msg.sources && msg.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-dashed border-border">
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--brand-navy)]">
              ◆ Fuentes citadas · {msg.sources.length}
            </div>
            {msg.sources.map((s, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5">
                <span className="shrink-0 rounded bg-[var(--brand-navy)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--brand-gold)]">
                  {s.badge}
                </span>
                <span className="text-[11px] leading-[1.5] text-[var(--brand-ink-2)]">{s.title}</span>
              </div>
            ))}
          </div>
        )}

        {!isUser && (
          <div className="mt-2.5 pt-2 border-t border-dashed border-border flex items-center gap-1.5 text-[10px] text-[var(--brand-mute)]">
            <span>¿Fue útil?</span>
            <button
              onClick={() => onFeedback?.("util")}
              className={cn(
                "px-1.5 py-0.5 rounded border transition-colors",
                msg.feedback === "util"
                  ? "border-[var(--brand-green)] text-[var(--brand-green)] bg-[var(--brand-green)]/5"
                  : "border-border text-[var(--brand-mute)] hover:border-[var(--brand-gold)] hover:text-[var(--brand-navy)]"
              )}
            >
              <ThumbsUp className="h-3 w-3 inline mr-0.5" /> Sí
            </button>
            <button
              onClick={() => onFeedback?.("no_util")}
              className="px-1.5 py-0.5 rounded border border-border text-[var(--brand-mute)] hover:border-[var(--brand-gold)] hover:text-[var(--brand-navy)]"
            >
              <ThumbsDown className="h-3 w-3 inline mr-0.5" /> No
            </button>
            <button
              onClick={onGenerateEscrito}
              className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded border border-[var(--brand-gold)] text-[var(--brand-navy)] hover:bg-[var(--brand-gold-pale)] transition-colors"
            >
              <FileText className="h-3 w-3" /> Generar escrito con esto
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Renderiza citas inline: {{art.256 LCT}} → <span class="cite-chip">art. 256 LCT</span>
 *  También soporta **bold** básico.
 */
function renderWithCitations(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/\{\{([^}]+)\}\}/g, '<span class="cite-chip">$1</span>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\n/g, "<br/>");
}
```

---

## Page wrapper `asistente/page.tsx`

Mantener toda la lógica actual (streaming con fetch a `/api/chat`, estado de mensajes, etc.). Solo cambiar el layout visual:

```tsx
"use client";

import { useState } from "react";
import { ChatBubble, type ChatMessage } from "@/components/chat/chat-bubble";
import { Send } from "lucide-react";

const SUGGESTIONS = [
  "¿Qué dice el art. 245 LCT?",
  "Plazos CPCCN apelación",
  "Multa art. 80",
  "Tasa activa BNA actual",
  "Indemnización ART — cálculo",
  "Despido indirecto — requisitos",
];

export default function AsistentePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // ...lógica existente de POST /api/chat y streaming...
  }

  function handleFeedback(msgId: string, value: "util" | "no_util") {
    // PATCH /api/chat/feedback o supabase.update(consultas_ia).eq("id", msgId)
  }

  return (
    <div className="bg-paper-rules min-h-screen">
      {/* Topbar simple */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-[rgba(250,247,241,0.85)] px-10 py-[18px] backdrop-blur-md">
        <nav className="flex items-center gap-2 text-xs text-[var(--brand-mute)]">
          <span>Workspace</span>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Asistente IA</span>
        </nav>
      </div>

      <div className="mx-auto max-w-[900px] px-10 py-8">
        <div className="flex min-h-[600px] flex-col overflow-hidden rounded border border-border bg-white">
          {/* Head */}
          <div className="flex items-center gap-3 bg-gradient-to-b from-[var(--brand-navy)] to-[#142847] px-5 py-4 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-[var(--brand-gold)] text-[var(--brand-navy)] font-serif text-lg font-bold italic">§</div>
            <div>
              <h3 className="font-serif text-lg font-semibold tracking-[-0.01em]">Asistente IA Jurídico</h3>
              <p className="text-[11px] tracking-wide text-[var(--brand-gold-2)]">
                Derecho argentino · con citas verificadas de LCT, CCCN, CPCCN
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5ccf70] shadow-[0_0_6px_#5ccf70]" />
              Online · Haiku 4.5
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-[var(--brand-paper)] px-6 py-6">
            {messages.length === 0 && <EmptyState onPickSuggestion={setInput} />}
            {messages.map(m => (
              <ChatBubble
                key={m.id}
                msg={m}
                onFeedback={v => handleFeedback(m.id, v)}
                onGenerateEscrito={() => {/* router.push("/escritos/nuevo?contexto=...") */}}
              />
            ))}
            {isStreaming && <TypingIndicator />}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-border bg-white px-5 py-4">
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setInput(s)}
                  className="rounded-full border border-border bg-[var(--brand-paper)] px-2.5 py-1 text-[11px] text-[var(--brand-navy)] transition-colors hover:border-[var(--brand-gold)] hover:bg-[var(--brand-gold-pale)]"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2.5 rounded-md border border-border bg-[var(--brand-paper)] px-3.5 py-2.5 transition-colors focus-within:border-[var(--brand-gold)] focus-within:bg-white">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Consultá sobre legislación, jurisprudencia o procesal argentino…"
                className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[var(--brand-mute)]"
                disabled={isStreaming}
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="flex h-[34px] w-[34px] items-center justify-center rounded bg-[var(--brand-navy)] text-[var(--brand-gold)] transition-opacity disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] italic text-[var(--brand-mute)]">
              LegalIA es herramienta de asistencia. El abogado es responsable de revisar antes de presentar.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onPickSuggestion }: { onPickSuggestion: (s: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-navy)] font-serif text-3xl italic text-[var(--brand-gold)]">§</div>
      <h2 className="font-serif text-2xl font-semibold text-[var(--brand-navy)] tracking-[-0.01em] mb-2">
        ¿En qué te ayudo hoy?
      </h2>
      <p className="max-w-md text-sm text-[var(--brand-mute)] mb-6">
        Consultame sobre legislación argentina, procedimiento, plazos, multas, o pedime que te genere un escrito.
      </p>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 mb-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-navy)] text-[var(--brand-gold)] font-serif italic text-base">§</div>
      <div className="rounded border border-border bg-white px-4 py-3">
        <span className="typing-dot" />
        <span className="typing-dot ml-1" />
        <span className="typing-dot ml-1" />
      </div>
    </div>
  );
}
```

---

## Citation extraction de la respuesta del LLM

En `app/api/chat/route.ts` (o donde se arme la respuesta), enviar el payload con citas estructuradas:

```ts
// Respuesta del endpoint (ejemplo)
return NextResponse.json({
  content: "El plazo de prescripción es de **dos años** conforme el {{art. 256 LCT}}...",
  sources: [
    { badge: "LCT.256", title: "Ley 20.744 · Prescripción de acciones" },
    { badge: "L25323",  title: "Ley 25.323 · Incremento por falta de pago" }
  ]
});
```

El system prompt debe instruir al modelo a envolver citas en `{{...}}`. Esto ya debería estar en `lib/ai/prompts/base-legal.ts` — ajustar si hace falta.

---

## ✅ Checklist

- [ ] `ChatBubble` creado en `components/chat/`
- [ ] `renderWithCitations` helper funciona
- [ ] Sources panel se muestra solo si `msg.sources?.length > 0`
- [ ] Feedback buttons actualizan DB (`consultas_ia.feedback`)
- [ ] Suggestion chips populan el input
- [ ] Empty state cuando no hay mensajes
- [ ] Typing indicator durante streaming
- [ ] Header navy gradient + status online
- [ ] Input disabled mientras streaming
- [ ] Disclaimer al pie

## 🔗 Siguiente

→ `06-ESCRITOS.md`
