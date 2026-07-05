/**
 * Sello de la empresa madre: "Powered by Desarrollo sin Fronteras".
 * Se usa en la landing, páginas de auth, herramientas públicas y sidebar.
 */
export function PoweredBy({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://desarrollosinfronteras.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-1.5 text-[11px] text-[var(--brand-mute)] transition-colors hover:text-[var(--brand-navy)] ${className}`}
      title="Desarrollo sin Fronteras — Software Factory"
    >
      <span className="opacity-80">Powered by</span>
      <span className="font-semibold tracking-tight group-hover:underline underline-offset-2">
        Desarrollo <span className="italic text-[var(--brand-gold)]">sin</span> Fronteras
      </span>
    </a>
  );
}
