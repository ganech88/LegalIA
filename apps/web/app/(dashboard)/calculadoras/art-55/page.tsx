import { PageShell } from "@/components/layout/page-shell";
import { CalcArt55 } from "@/components/calculadoras/calc-art55";

export default function Art55Page() {
  return (
    <PageShell crumbs={[{ label: "Calculadoras", href: "/calculadoras" }, { label: "Reliquidación art. 55" }]}>
      <header className="mb-8 border-b border-[var(--brand-navy)] pb-6">
        <div className="masthead-meta mb-2"><span>JUICIOS EN TRÁMITE · LEY 27.802</span></div>
        <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-[var(--brand-navy)]">
          Reliquidación art. 55
        </h1>
        <p className="mt-2 max-w-[680px] text-[14px] text-[var(--brand-ink-2)]">
          Tasa pasiva del BCRA con techo en IPC + 3 % y piso del 67 %, como ordenó aplicar la Corte en «Cabana Opanasiuk» (05/11/2026).
          Con el anexo auditable y el pase directo al escrito de liquidación.
        </p>
      </header>
      <CalcArt55 variante="app" />
    </PageShell>
  );
}
