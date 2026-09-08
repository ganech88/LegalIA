import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="font-[var(--font-display)] text-6xl italic text-[var(--brand-gold)] opacity-50">§</div>
      <h1 className="mt-4 font-[var(--font-display)] text-2xl font-semibold text-[var(--brand-navy)]">
        No encontramos lo que buscabas
      </h1>
      <p className="mt-2 max-w-[420px] text-[13px] text-[var(--brand-ink-2)]">
        El escrito, caso o plantilla puede haber sido eliminado, o el enlace está incompleto.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/dashboard" className="rounded bg-[var(--brand-navy)] px-4 py-2 text-[13px] font-semibold text-white">Ir al inicio</Link>
        <Link href="/escritos" className="rounded border border-[var(--brand-navy)] px-4 py-2 text-[13px] font-semibold text-[var(--brand-navy)]">Ver escritos</Link>
      </div>
    </div>
  );
}
