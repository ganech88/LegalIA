import { describe, it, expect } from "vitest";
import { calcularART, PISOS_SRT } from "./art";

const pisos = PISOS_SRT[0];

describe("calcularART (ley 24.557 + 26.773 + 27.348)", () => {
  it("ILP parcial 30%, 40 años: 53 × IBM × 0,30 × 65/40 con piso proporcional", () => {
    const r = calcularART({ ingreso_base_mensual: 2_000_000, porcentaje_incapacidad: 30, edad: 40, tipo: "ilp", aplica_20_por_ciento: false, pisos });
    expect(r.formula).toBeCloseTo(53 * 2_000_000 * 0.3 * (65 / 40), 3);
    expect(r.piso).toBeCloseTo(pisos.piso_art_14 * 0.3, 3);
    expect(r.rubros.length).toBe(1);
  });

  it("ILP 70% (≥ 66%) es TOTAL: no se multiplica por el porcentaje y suma art. 11.4.b", () => {
    const r = calcularART({ ingreso_base_mensual: 2_000_000, porcentaje_incapacidad: 70, edad: 40, tipo: "ilp", aplica_20_por_ciento: false, pisos });
    expect(r.formula).toBeCloseTo(53 * 2_000_000 * (65 / 40), 3);
    expect(r.piso).toBe(pisos.piso_art_15);
    expect(r.rubros.some((x) => x.norma.includes("11.4.b"))).toBe(true);
  });

  it("ILP 55%: parcial + compensación art. 11.4.a", () => {
    const r = calcularART({ ingreso_base_mensual: 2_000_000, porcentaje_incapacidad: 55, edad: 40, tipo: "ilp", aplica_20_por_ciento: false, pisos });
    expect(r.rubros.some((x) => x.norma.includes("11.4.a"))).toBe(true);
  });

  it("muerte con +20%: el adicional no baja del mínimo SRT", () => {
    const r = calcularART({ ingreso_base_mensual: 500_000, porcentaje_incapacidad: 0, edad: 60, tipo: "muerte", aplica_20_por_ciento: true, pisos });
    const adicional = r.rubros.find((x) => x.norma.includes("26.773"))!;
    expect(adicional.monto).toBeGreaterThanOrEqual(pisos.minimo_art_3_26773);
    expect(r.rubros.some((x) => x.norma.includes("11.4.c"))).toBe(true);
  });

  it("piso SRT se aplica cuando la fórmula da menos", () => {
    const r = calcularART({ ingreso_base_mensual: 300_000, porcentaje_incapacidad: 10, edad: 64, tipo: "ilp", aplica_20_por_ciento: false, pisos });
    expect(r.aplica_piso).toBe(true);
    expect(r.rubros[0].monto).toBeCloseTo(pisos.piso_art_14 * 0.1, 3);
  });
});
