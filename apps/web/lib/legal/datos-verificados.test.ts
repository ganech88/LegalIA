import { describe, it, expect } from "vitest";
import { datosVerificadosPara } from "./datos-verificados";

const hoy = new Date("2026-11-26T12:00:00Z");

describe("datosVerificadosPara", () => {
  it("consulta de ART: fórmula y pisos de la SRT vigentes", () => {
    const t = datosVerificadosPara("Indemnización ART — cálculo y pisos SRT", hoy);
    expect(t).toContain("53 × ingreso base");
    expect(t).toContain("Res. SRT 39/2026");
    expect(t).toContain("114.354.110");
    expect(t).not.toContain("UMA");
  });
  it("in itinere e incapacidad también disparan el bloque de la LRT", () => {
    expect(datosVerificadosPara("¿Corresponde el 20% en un accidente in itinere?", hoy)).toContain("art. 3, ley 26.773");
    expect(datosVerificadosPara("incapacidad del 30 por ciento", hoy)).toContain("art. 14.2");
  });
  it("honorarios: valor de la UMA cargado", () => {
    const t = datosVerificadosPara("¿Cuánto vale la UMA?", hoy);
    expect(t).toContain("108.005");
    expect(t).not.toContain("Riesgos del Trabajo");
  });
  it("un artículo cualquiera ('art. 245') no dispara el bloque de la ART", () => {
    expect(datosVerificadosPara("¿Qué cambió en el art. 245 LCT con la ley 27.802?", hoy)).toBe("");
    expect(datosVerificadosPara("plazo para apelar una sentencia", hoy)).toBe("");
  });
});
