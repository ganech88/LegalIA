"use client";

import { Scale, WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf9f7] px-4 text-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e3a5f]">
        <Scale className="h-5 w-5 text-white" />
      </div>
      <h1 className="heading-serif mt-4 text-2xl text-[#0f172a]">
        Sin conexión
      </h1>
      <div className="mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <WifiOff className="h-8 w-8 text-slate-400" />
      </div>
      <p className="mt-4 max-w-sm text-sm text-slate-500">
        No hay conexión a internet. Verificá tu conexión y volvé a intentar.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 rounded-xl bg-[#1e3a5f] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#1d4ed8]"
      >
        Reintentar
      </button>
    </div>
  );
}
