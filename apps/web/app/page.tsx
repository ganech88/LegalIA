import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scale, FileText, MessageSquare, Calculator } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold">LegalIA</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Ingresar</Button>
            </Link>
            <Link href="/register">
              <Button>Crear cuenta</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">
            Inteligencia artificial
            <br />
            <span className="text-slate-500">para abogados argentinos</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Generá escritos judiciales listos para presentar y consultá sobre legislación argentina
            con citas de artículos reales. Especializado en derecho laboral, civil y comercial.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-base">
                Empezar gratis
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Generador de escritos</h3>
            <p className="mt-2 text-sm text-slate-500">
              Demandas laborales, cartas documento, contestaciones y recursos.
              Con formato procesal argentino correcto por jurisdicción.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Asistente legal IA</h3>
            <p className="mt-2 text-sm text-slate-500">
              Consultá sobre la LCT, CCCN, CPCCN y más. Respuestas con citas de artículos
              reales, no alucinaciones.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50">
              <Calculator className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Calculadoras legales</h3>
            <p className="mt-2 text-sm text-slate-500">
              Indemnización por despido, intereses CNAT, actualización por RIPTE/IPC.
              Próximamente.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-slate-400">
            LegalIA es una herramienta de asistencia profesional. El abogado es responsable de
            revisar todo contenido generado antes de su presentación judicial.
          </p>
        </div>
      </main>
    </div>
  );
}
