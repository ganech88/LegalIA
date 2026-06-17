import { describe, it, expect } from "vitest";
import {
  calcularAntiguedad,
  calcularIndemnizacionArt245,
  calcularIntereses,
} from "./calculadoras";

describe("calcularAntiguedad — fracción mayor de 3 meses (art. 245)", () => {
  it("2 años 4 meses → 3 períodos (fracción > 3 meses)", () => {
    const r = calcularAntiguedad(new Date("2020-01-01"), new Date("2022-05-01"));
    expect(r.anios).toBe(2);
    expect(r.periodos).toBe(3);
  });

  it("2 años 2 meses → 2 períodos (fracción < 3 meses)", () => {
    const r = calcularAntiguedad(new Date("2020-01-01"), new Date("2022-03-10"));
    expect(r.periodos).toBe(2);
  });

  it("exactamente 3 meses de fracción NO suma período", () => {
    const r = calcularAntiguedad(new Date("2020-01-01"), new Date("2022-04-01"));
    expect(r.periodos).toBe(2);
  });

  it("3 meses y 1 día de fracción SÍ suma período", () => {
    const r = calcularAntiguedad(new Date("2020-01-01"), new Date("2022-04-02"));
    expect(r.periodos).toBe(3);
  });

  it("menos de un año siempre da al menos 1 período", () => {
    const r = calcularAntiguedad(new Date("2024-01-01"), new Date("2024-03-01"));
    expect(r.periodos).toBe(1);
  });
});

describe("calcularIndemnizacionArt245 — preaviso (art. 231/232)", () => {
  const base = { mejor_remuneracion: 100000, fecha_ingreso: "2019-06-14" };

  it("exactamente 5 años → 1 mes de preaviso", () => {
    const r = calcularIndemnizacionArt245({ ...base, fecha_despido: "2024-06-14" });
    expect(r.preaviso_meses).toBe(1);
  });

  it("más de 5 años → 2 meses de preaviso", () => {
    const r = calcularIndemnizacionArt245({ ...base, fecha_despido: "2024-06-16" });
    expect(r.preaviso_meses).toBe(2);
  });

  it("período de prueba → medio mes (15 días)", () => {
    const r = calcularIndemnizacionArt245({
      mejor_remuneracion: 100000,
      fecha_ingreso: "2024-01-01",
      fecha_despido: "2024-02-15",
      en_periodo_prueba: true,
    });
    expect(r.preaviso_meses).toBe(0.5);
    expect(r.preaviso).toBe(50000);
  });
});

describe("calcularIndemnizacionArt245 — integración mes de despido (art. 233)", () => {
  it("despido el 20 de junio → integra 10 días", () => {
    const r = calcularIndemnizacionArt245({
      mejor_remuneracion: 30000,
      fecha_ingreso: "2020-01-01",
      fecha_despido: "2024-06-20",
    });
    expect(r.integracion_dias).toBe(10);
    expect(Math.round(r.integracion)).toBe(10000); // (30000/30)*10
  });

  it("despido el último día del mes → sin integración", () => {
    const r = calcularIndemnizacionArt245({
      mejor_remuneracion: 30000,
      fecha_ingreso: "2020-01-01",
      fecha_despido: "2024-06-30",
    });
    expect(r.integracion_dias).toBe(0);
    expect(r.integracion).toBe(0);
  });
});

describe("calcularIndemnizacionArt245 — tope y doctrina Vizzoti", () => {
  it("aplica tope simple del CCT (3× promedio)", () => {
    const r = calcularIndemnizacionArt245({
      mejor_remuneracion: 1_000_000,
      fecha_ingreso: "2022-01-01",
      fecha_despido: "2024-01-01",
      tope_cct: 200_000,
    });
    expect(r.tope_aplicado).toBe(true);
    expect(r.base_calculo).toBe(600_000); // 200k × 3
  });

  it("Vizzoti: la base no baja del 67% de la mejor remuneración", () => {
    const r = calcularIndemnizacionArt245({
      mejor_remuneracion: 1_000_000,
      fecha_ingreso: "2022-01-01",
      fecha_despido: "2024-01-01",
      tope_cct: 200_000,
      aplica_vizzoti: true,
    });
    expect(r.tope_aplicado).toBe(true);
    expect(r.base_calculo).toBe(670_000); // max(600k, 670k)
  });
});

describe("calcularIndemnizacionArt245 — vacaciones proporcionales (proporción anual)", () => {
  it("año completo → 14 días al valor /25", () => {
    const r = calcularIndemnizacionArt245({
      mejor_remuneracion: 25_000,
      fecha_ingreso: "2020-01-01",
      fecha_despido: "2024-12-31",
    });
    // (25000/25) * 14 * (365/365) = 14000
    expect(Math.round(r.vacaciones_proporcionales)).toBe(14_000);
  });

  it("medio año trabajado → aprox. la mitad de las vacaciones", () => {
    const r = calcularIndemnizacionArt245({
      mejor_remuneracion: 25_000,
      fecha_ingreso: "2024-07-01",
      fecha_despido: "2024-12-31",
    });
    // 184 días / 365 ≈ 0.504 → ~7059
    expect(r.vacaciones_proporcionales).toBeGreaterThan(6_800);
    expect(r.vacaciones_proporcionales).toBeLessThan(7_200);
  });
});

describe("calcularIndemnizacionArt245 — rubros opcionales", () => {
  const base = {
    mejor_remuneracion: 100_000,
    fecha_ingreso: "2020-01-01",
    fecha_despido: "2024-06-20",
  };

  it("Ley 25.323 art. 1 duplica la indemnización por antigüedad", () => {
    const r = calcularIndemnizacionArt245({ ...base, ley_25323_art1: true });
    expect(r.ley_25323_art1).toBe(r.indemnizacion_antiguedad);
  });

  it("Ley 25.323 art. 2 = 50% de antigüedad + preaviso + integración", () => {
    const r = calcularIndemnizacionArt245({ ...base, ley_25323_art2: true });
    const esperado = 0.5 * (r.indemnizacion_antiguedad + r.preaviso + r.integracion);
    expect(r.ley_25323_art2).toBeCloseTo(esperado, 2);
  });

  it("multa art. 80 = 3 remuneraciones", () => {
    const r = calcularIndemnizacionArt245({ ...base, multa_art_80: true });
    expect(r.multa_art_80).toBe(300_000);
  });

  it("el total es la suma exacta de todos los rubros", () => {
    const r = calcularIndemnizacionArt245({
      ...base,
      ley_25323_art1: true,
      ley_25323_art2: true,
      multa_art_80: true,
    });
    const suma = r.rubros.reduce((acc, x) => acc + x.monto, 0);
    expect(r.total).toBeCloseTo(suma, 2);
  });
});

describe("calcularIntereses", () => {
  it("interés simple: 50% anual en 365 días sobre 100.000 = 50.000", () => {
    const r = calcularIntereses({
      capital: 100_000,
      tasa_anual: 50,
      fecha_desde: "2023-01-01",
      fecha_hasta: "2024-01-01",
    });
    expect(r.dias).toBe(365);
    expect(Math.round(r.intereses)).toBe(50_000);
    expect(Math.round(r.total)).toBe(150_000);
  });
});
