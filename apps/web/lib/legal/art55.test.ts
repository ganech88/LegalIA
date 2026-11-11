import { describe, it, expect } from "vitest";
import { calcularArt55, generarAnexoArt55 } from "./art55";

// Capital 1.000.000; coeficiente IPC elegido para que el techo dé 2.700.000
// en un período de 365 días: capital_ipc × 1,03 = 2.700.000.
const base = {
  capital: 1_000_000,
  coeficiente_ipc: 2_700_000 / 1.03 / 1_000_000,
  fecha_desde: "2025-01-01",
  fecha_hasta: "2026-01-01",
};

describe("calcularArt55", () => {
  it("techo = IPC + 3 % anual; piso sobre el total = 67 % del techo", () => {
    const r = calcularArt55({ ...base, coeficiente_pasiva: 2.2 });
    expect(r.dias).toBe(365);
    expect(r.techo_total).toBeCloseTo(2_700_000, 2);
    expect(r.criterios.total.piso).toBeCloseTo(1_809_000, 2);
    expect(r.criterios.ajuste.piso).toBeCloseTo(2_139_000, 2);
  });

  it("pasiva por debajo del piso → rige el piso", () => {
    const r = calcularArt55({ ...base, coeficiente_pasiva: 1.5 });
    expect(r.criterios.total.rige).toBe("piso");
    expect(r.criterios.total.resultado).toBeCloseTo(1_809_000, 2);
    expect(r.criterios.ajuste.resultado).toBeCloseTo(2_139_000, 2);
    expect(r.criterios_difieren).toBe(true);
  });

  it("pasiva dentro de la banda → rige la tasa pasiva", () => {
    const r = calcularArt55({ ...base, coeficiente_pasiva: 2.2 });
    expect(r.criterios.total.rige).toBe("pasiva");
    expect(r.criterios.total.resultado).toBeCloseTo(2_200_000, 2);
    expect(r.criterios.ajuste.rige).toBe("pasiva");
    expect(r.criterios_difieren).toBe(false);
  });

  it("pasiva por encima del techo → rige el techo", () => {
    const r = calcularArt55({ ...base, coeficiente_pasiva: 3 });
    expect(r.criterios.total.rige).toBe("techo");
    expect(r.criterios.total.resultado).toBeCloseTo(2_700_000, 2);
    expect(r.criterios.ajuste.resultado).toBeCloseTo(2_700_000, 2);
  });

  it("entre los dos pisos: los criterios difieren", () => {
    const r = calcularArt55({ ...base, coeficiente_pasiva: 2 });
    expect(r.criterios.total.rige).toBe("pasiva");
    expect(r.criterios.ajuste.rige).toBe("piso");
    expect(r.criterios_difieren).toBe(true);
  });

  it("el anexo informa los tres incisos y el fallo", () => {
    const r = calcularArt55({ ...base, coeficiente_pasiva: 2 });
    const t = generarAnexoArt55(r, { ...base, coeficiente_pasiva: 2, fuente_ipc: "INDEC", fuente_pasiva: "BCRA" });
    expect(t).toContain("art. 55 inc. a");
    expect(t).toContain("Cabana Opanasiuk");
    expect(t).toContain("piso sobre el ajuste");
  });
});
