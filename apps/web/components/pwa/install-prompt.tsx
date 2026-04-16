"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Detect iOS (no beforeinstallprompt support)
    const ua = navigator.userAgent;
    const ios =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (ios) {
      // On iOS, check if dismissed before
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed) {
        setIsIOS(true);
        setShowBanner(true);
      }
      return;
    }

    // Android/Desktop: listen for beforeinstallprompt
    function handlePrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed) {
        setShowBanner(true);
      }
    }

    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  }

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up p-4 sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10">
        {/* Decorative gradient */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl"
          style={{
            background:
              "linear-gradient(135deg, #1e3a5f 0%, #7c3aed 100%)",
          }}
        />

        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1e3a5f] shadow-lg shadow-[#1e3a5f]/20">
            <Download className="h-5 w-5 text-[#fbbf24]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-[#0f172a]">
              Instalá LegalIA
            </h3>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              {isIOS
                ? "Tocá el botón de compartir y luego \"Agregar a inicio\" para instalar la app."
                : "Accedé más rápido desde tu pantalla de inicio, como una app nativa."}
            </p>
          </div>
        </div>

        {isIOS ? (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
            <span>Tocá</span>
            <svg
              className="h-5 w-5 text-[#007AFF]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
            </svg>
            <span>
              y luego <strong>Agregar a inicio</strong>
            </span>
          </div>
        ) : (
          <button
            onClick={handleInstall}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e3a5f] py-2.5 text-sm font-bold text-white transition-all hover:bg-[#1d4ed8] hover:shadow-lg"
          >
            <Download className="h-4 w-4" />
            Instalar app
          </button>
        )}
      </div>
    </div>
  );
}
