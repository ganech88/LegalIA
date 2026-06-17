import { describe, it, expect } from "vitest";
import {
  calcularHonorarios,
  calcularTasaJusticia,
  calcularCuotaAlimentaria,
} from "./honorarios";

describe("calcularHonorarios", () => {
  it("base 1.000.000 al 16% con 3/3 etapas = 160.000", () => {
    const r = calcularHonorarios({ baseRegulatoria: 1_000_000, porcentaje: 16, etapasCumplidas: 3 });
    expect(r.honorario).toBe(160_000);
    expect(r.honorarioPleno).toBe(160_000);
  });

  it("con 1 de 3 etapas cumplidas paga un tercio", () => {
    const r = calcularHonorarios({ baseRegulatoria: 1_000_000, porcentaje: 16, etapasCumplidas: 1 });
    expect(Math.round(r.honorario)).toBe(53_333);
  });

  it("expresa el honorario en UMAs", () => {
    const r = calcularHonorarios({ baseRegulatoria: 1_000_000, porcentaje: 16, etapasCumplidas: 3, valorUMA: 40_000 });
    expect(r.enUMA).toBe(4); // 160.000 / 40.000
  });
});

describe("calcularTasaJusticia", () => {
  it("3% nacional sobre el monto del juicio", () => {
    const r = calcularTasaJusticia({ monto: 1_000_000 });
    expect(r.tasa).toBe(30_000);
    expect(r.alicuota).toBe(3);
  });
  it("permite alícuota provincial distinta", () => {
    expect(calcularTasaJusticia({ monto: 1_000_000, alicuota: 2.2 }).tasa).toBeCloseTo(22_000, 2);
  });
});

describe("calcularCuotaAlimentaria", () => {
  it("ingreso 500.000 al 20% = 100.000 (orientativo)", () => {
    expect(calcularCuotaAlimentaria({ ingresoNeto: 500_000, porcentaje: 20 }).cuota).toBe(100_000);
  });
});
