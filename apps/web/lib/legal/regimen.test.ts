import { describe, it, expect } from "vitest";
import { regimenPorFecha, FECHA_LEY_BASES, FECHA_MODERNIZACION } from "./regimen";
import { calcularIndemnizacionArt245, calcularActualizacion27802 } from "./calculadoras";

describe("regimenPorFecha", () => {
  it("antes del 09/07/2024: multas vigentes, prueba 3 meses", () => {
    const r = regimenPorFecha("2024-07-08");
    expect(r.regimen).toBe("pre_bases");
    expect(r.ley_25323_art1).toBe(true);
    expect(r.multa_art_80).toBe(true);
    expect(r.periodo_prueba_meses).toBe(3);
  });
  it("desde el 09/07/2024: Ley Bases", () => {
    const r = regimenPorFecha(FECHA_LEY_BASES);
    expect(r.regimen).toBe("ley_bases");
    expect(r.ley_25323_art1).toBe(false);
    expect(r.ley_25323_art2).toBe(true);
    expect(r.multa_art_80).toBe(false);
    expect(r.periodo_prueba_meses).toBe(6);
    expect(r.preaviso_en_prueba).toBe(0.5);
    expect(r.art_245_bis).toBe(true);
  });
  it("desde el 06/03/2026: Modernización Laboral", () => {
    const r = regimenPorFecha(FECHA_MODERNIZACION);
    expect(r.regimen).toBe("modernizacion");
    expect(r.preaviso_en_prueba).toBe(0);
    expect(r.base_excluye_sac).toBe(true);
    expect(r.actualizacion_ipc_mas_3).toBe(true);
  });
});

describe("calcularIndemnizacionArt245 — vigencia por fecha", () => {
  const base = { mejor_remuneracion: 1_000_000, fecha_ingreso: "2018-03-01" };

  it("despido 2026: art. 1 ley 25.323 y art. 80 pedidos → NO se liquidan y se advierte", () => {
    const r = calcularIndemnizacionArt245({ ...base, fecha_despido: "2026-05-15", ley_25323_art1: true, multa_art_80: true });
    expect(r.ley_25323_art1).toBe(0);
    expect(r.multa_art_80).toBe(0);
    expect(r.advertencias.length).toBe(2);
    expect(r.regimen.regimen).toBe("modernizacion");
  });

  it("despido 2023: las mismas multas SÍ se liquidan", () => {
    const r = calcularIndemnizacionArt245({ ...base, fecha_despido: "2023-05-15", ley_25323_art1: true, multa_art_80: true });
    expect(r.ley_25323_art1).toBe(r.indemnizacion_antiguedad);
    expect(r.multa_art_80).toBe(3_000_000);
    expect(r.advertencias.length).toBe(0);
  });

  it("art. 2 ley 25.323 sigue vigente en 2026", () => {
    const r = calcularIndemnizacionArt245({ ...base, fecha_despido: "2026-05-15", ley_25323_art2: true });
    expect(r.ley_25323_art2).toBeCloseTo(0.5 * (r.indemnizacion_antiguedad + r.preaviso + r.integracion), 6);
  });

  it("período de prueba: sin art. 245 ni integración; preaviso 15 días antes de la 27.802 y 0 después", () => {
    const antes = calcularIndemnizacionArt245({ mejor_remuneracion: 1_000_000, fecha_ingreso: "2025-09-01", fecha_despido: "2025-11-10", en_periodo_prueba: true });
    expect(antes.indemnizacion_antiguedad).toBe(0);
    expect(antes.integracion).toBe(0);
    expect(antes.preaviso).toBe(500_000);
    const despues = calcularIndemnizacionArt245({ mejor_remuneracion: 1_000_000, fecha_ingreso: "2026-04-01", fecha_despido: "2026-06-10", en_periodo_prueba: true });
    expect(despues.preaviso).toBe(0);
    expect(despues.indemnizacion_antiguedad).toBe(0);
  });

  it("art. 245 bis: +50% del art. 245 solo desde la Ley Bases", () => {
    const si = calcularIndemnizacionArt245({ ...base, fecha_despido: "2025-01-15", art_245_bis_pct: 50 });
    expect(si.art_245_bis).toBeCloseTo(si.indemnizacion_antiguedad * 0.5, 6);
    const no = calcularIndemnizacionArt245({ ...base, fecha_despido: "2024-01-15", art_245_bis_pct: 50 });
    expect(no.art_245_bis).toBe(0);
    expect(no.advertencias[0]).toMatch(/245 bis/);
  });

  it("ley 27.802: el piso del 67% se aplica aunque no se marque Vizzoti", () => {
    const r = calcularIndemnizacionArt245({ ...base, fecha_despido: "2026-05-15", tope_cct: 100_000 });
    expect(r.tope_aplicado).toBe(true);
    expect(r.base_calculo).toBe(670_000);
  });

  it("vacaciones: SAC sobre vacaciones = vacaciones / 12", () => {
    const r = calcularIndemnizacionArt245({ ...base, fecha_despido: "2026-05-15" });
    expect(r.sac_vacaciones).toBeCloseTo(r.vacaciones_proporcionales / 12, 6);
    expect(r.rubros.some((x) => x.label.startsWith("SAC s/ vacaciones"))).toBe(true);
  });
});

describe("calcularActualizacion27802 (art. 276 LCT / art. 55)", () => {
  it("IPC ×1,5 en 365 días + 3% → capital × 1,5 × 1,03", () => {
    const r = calcularActualizacion27802({ capital: 1_000_000, coeficiente_ipc: 1.5, fecha_desde: "2026-03-06", fecha_hasta: "2027-03-06" });
    expect(r.dias).toBe(365);
    expect(r.capital_ipc).toBe(1_500_000);
    expect(r.interes_3).toBeCloseTo(45_000, 3);
    expect(r.total_art_276).toBeCloseTo(1_545_000, 3);
    expect(r.art_55.techo_total).toBeCloseTo(1_545_000, 3);
    expect(r.art_55.piso_total).toBeCloseTo(1_000_000 + 545_000 * 0.67, 3);
  });
});
