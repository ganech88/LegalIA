import { ImageResponse } from "next/og";

export const alt = "LegalIA — Escritos, calculadoras y plazos para abogados argentinos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #1a2332 0%, #243447 100%)",
          color: "#faf7f0",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              background: "#c9a227",
              color: "#1a2332",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: 700,
            }}
          >
            L
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>LegalIA</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            Escritos con citas verificadas. Liquidaciones a la ley 27.802.
          </div>
          <div style={{ fontSize: 28, color: "#c9a227" }}>
            Calculadoras laborales · Agenda de plazos · Portal del cliente · En pesos
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#a8b0bd" }}>www.legaliapp.com — para abogados argentinos</div>
      </div>
    ),
    { ...size },
  );
}
