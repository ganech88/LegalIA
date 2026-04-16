"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Sparkles,
  User,
  ThumbsUp,
  ThumbsDown,
  Scale,
  BookOpen,
  Gavel,
  MessageSquare,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  id?: string;
}

const SUGGESTIONS = [
  { icon: Gavel,     text: "¿Cuál es el plazo para reclamar indemnización por despido?" },
  { icon: BookOpen,  text: "¿Qué dice el art. 245 de la LCT?" },
  { icon: Scale,     text: "¿Cuándo corresponde la multa del art. 80?" },
  { icon: MessageSquare, text: "¿Qué es el preaviso y cuándo se devenga?" },
];

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f]">
        <Sparkles className="h-3.5 w-3.5 text-[#fbbf24]" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="typing-dot bg-slate-400" />
        <span className="typing-dot bg-slate-400" />
        <span className="typing-dot bg-slate-400" />
      </div>
    </div>
  );
}

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
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ message: userMessage }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessages((prev) => [
        ...prev,
        {
          role:    "assistant",
          content: data.error || "Error al procesar tu consulta. Intentá de nuevo.",
        },
      ]);
      setLoading(false);
      return;
    }

    const reader  = res.body?.getReader();
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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function handleSuggestion(text: string) {
    setInput(text);
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col">
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="mb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1e3a5f]">
            <Sparkles className="h-4 w-4 text-[#fbbf24]" />
          </div>
          <div>
            <h1 className="heading-serif text-2xl text-[#0f172a]">
              Asistente IA
            </h1>
          </div>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Consultá sobre legislación y jurisprudencia argentina. Responde con citas verificadas.
        </p>
      </div>

      {/* ── Chat container ──────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {messages.length === 0 ? (
            /* ── Empty state ── */
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-6 py-8 text-center">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1e3a5f]">
                  <Sparkles className="h-9 w-9 text-[#fbbf24]" />
                </div>
                <div
                  aria-hidden
                  className="absolute -inset-1 rounded-2xl opacity-20"
                  style={{ background: "radial-gradient(circle, #d97706, transparent)" }}
                />
              </div>
              <div className="max-w-sm">
                <h3 className="text-xl font-bold text-[#0f172a]">
                  ¿En qué puedo ayudarte hoy?
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Consultame sobre derecho laboral, civil, comercial y más.
                  Siempre cito los artículos y leyes aplicables.
                </p>
              </div>

              {/* Suggestions */}
              <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map(({ icon: Icon, text }) => (
                  <button
                    key={text}
                    onClick={() => handleSuggestion(text)}
                    className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-xs text-slate-600 transition-all hover:border-[#1e3a5f] hover:bg-white hover:text-[#1e3a5f] hover:shadow-sm"
                  >
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#d97706]" />
                    {text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f]">
                      <Sparkles className="h-3.5 w-3.5 text-[#fbbf24]" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] ${
                      msg.role === "user"
                        ? "rounded-2xl rounded-tr-none bg-[#1e3a5f] px-4 py-3 text-sm text-white shadow-sm"
                        : "rounded-2xl rounded-tl-none border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>
                    {msg.role === "assistant" && msg.content && (
                      <div className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-2">
                        <span className="mr-1 text-[10px] text-slate-400">¿Fue útil?</span>
                        <button
                          aria-label="Útil"
                          className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          aria-label="No útil"
                          className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200">
                      <User className="h-3.5 w-3.5 text-slate-600" />
                    </div>
                  )}
                </div>
              ))}

              {loading && <TypingIndicator />}
              <div ref={scrollRef} />
            </div>
          )}
        </div>

        {/* ── Input area ───────────────────────────────────── */}
        <div className="shrink-0 border-t border-slate-100 bg-white p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="input-brand flex-1 rounded-xl border border-slate-200 bg-slate-50 transition-all focus-within:bg-white">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribí tu consulta legal... (Enter para enviar)"
                className="min-h-[44px] max-h-32 resize-none border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={1}
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="h-11 w-11 shrink-0 rounded-xl bg-[#1e3a5f] text-white shadow-sm transition-all hover:bg-[#1d4ed8] hover:shadow-md disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-2 text-center text-[10px] text-slate-400">
            Recordá verificar la vigencia de la normativa citada. LegalIA es una herramienta de asistencia profesional.
          </p>
        </div>
      </div>
    </div>
  );
}
