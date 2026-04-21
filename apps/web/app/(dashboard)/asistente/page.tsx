"use client";

import { useState, useRef, useEffect } from "react";
import { Send, ThumbsUp, ThumbsDown } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  id?: string;
}

const SUGGESTIONS = [
  "¿Que dice el art. 245 LCT?",
  "Plazos CPCCN apelacion",
  "Multa art. 80",
  "Tasa activa BNA actual",
  "Indemnizacion ART — calculo",
  "Despido indirecto — requisitos",
];

export default function AsistentePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.error || "Error al procesar tu consulta. Intenta de nuevo.",
        },
      ]);
      setLoading(false);
      return;
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let assistantContent = "";

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantContent };
          return updated;
        });
      }
    }

    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="bg-paper-rules min-h-screen">
      {/* Topbar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-[rgba(250,250,247,0.85)] px-4 md:px-6 lg:px-10 py-[18px] backdrop-blur-md">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--brand-mute)]">
          <span>Workspace</span>
          <span className="opacity-40">/</span>
          <span className="font-medium text-[var(--brand-ink)]">Asistente IA</span>
        </nav>
      </div>

      <div className="mx-auto max-w-[900px] px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
        <div className="flex min-h-[600px] flex-col overflow-hidden rounded border border-border bg-white">
          {/* Head */}
          <div className="flex items-center gap-3 bg-gradient-to-b from-[var(--brand-navy)] to-[#142847] px-5 py-4 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-[var(--brand-gold)] text-[var(--brand-navy)] font-serif text-lg font-bold italic">§</div>
            <div>
              <h3 className="font-serif text-lg font-semibold tracking-[-0.01em]">Asistente IA Juridico</h3>
              <p className="text-[11px] tracking-wide text-[var(--brand-gold-2)]">
                Derecho argentino · con citas verificadas de LCT, CCCN, CPCCN
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5ccf70] shadow-[0_0_6px_#5ccf70]" />
              Online
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-[var(--brand-paper)] px-6 py-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-navy)] font-serif text-3xl italic text-[var(--brand-gold)]">§</div>
                <h2 className="font-serif text-2xl font-semibold text-[var(--brand-navy)] tracking-[-0.01em] mb-2">
                  ¿En que te ayudo hoy?
                </h2>
                <p className="max-w-md text-sm text-[var(--brand-mute)] mb-6">
                  Consultame sobre legislacion argentina, procedimiento, plazos, multas, o pedime que te genere un escrito.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 mb-5 max-w-[88%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                  msg.role === "user"
                    ? "bg-[var(--brand-paper-3)] text-[var(--brand-navy)]"
                    : "bg-[var(--brand-navy)] text-[var(--brand-gold)] font-serif italic text-base"
                }`}>
                  {msg.role === "user" ? "TU" : "§"}
                </div>

                <div className={`rounded border px-4 py-3.5 text-[13px] leading-[1.6] ${
                  msg.role === "user"
                    ? "bg-[var(--brand-navy)] text-white border-[var(--brand-navy)]"
                    : "bg-white border-border text-[var(--brand-ink)]"
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.role === "assistant" && msg.content && (
                    <div className="mt-2.5 pt-2 border-t border-dashed border-border flex items-center gap-1.5 text-[10px] text-[var(--brand-mute)]">
                      <span>¿Fue util?</span>
                      <button className="px-1.5 py-0.5 rounded border border-border text-[var(--brand-mute)] hover:border-[var(--brand-gold)] hover:text-[var(--brand-navy)]">
                        <ThumbsUp className="h-3 w-3 inline mr-0.5" /> Si
                      </button>
                      <button className="px-1.5 py-0.5 rounded border border-border text-[var(--brand-mute)] hover:border-[var(--brand-gold)] hover:text-[var(--brand-navy)]">
                        <ThumbsDown className="h-3 w-3 inline mr-0.5" /> No
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 mb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-navy)] text-[var(--brand-gold)] font-serif italic text-base">§</div>
                <div className="rounded border border-border bg-white px-4 py-3">
                  <span className="typing-dot text-[var(--brand-mute)]" />
                  <span className="typing-dot text-[var(--brand-mute)] ml-1" />
                  <span className="typing-dot text-[var(--brand-mute)] ml-1" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
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
                onKeyDown={handleKeyDown}
                placeholder="Consulta sobre legislacion, jurisprudencia o procesal argentino…"
                className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[var(--brand-mute)]"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
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
