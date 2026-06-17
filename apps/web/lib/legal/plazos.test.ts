import { describe, it, expect } from "vitest";
import {
  esDiaHabil,
  motivoInhabil,
  calcularVencimiento,
  calcularPrescripcion,
} from "./plazos";
import { parseLocalDate } from "./fecha";

describe("días hábiles judiciales", () => {
  it("1 de mayo es feriado", () => {
    expect(esDiaHabil(parseLocalDate("2026-05-01"))).toBe(false);
    expect(motivoInhabil(parseLocalDate("2026-05-01"))).toBe("feriado");
  });

  it("enero es feria judicial (verano)", () => {
    expect(motivoInhabil(parseLocalDate("2026-01-15"))).toBe("feria judicial");
  });

  it("la feria de invierno de julio se excluye", () => {
    expect(motivoInhabil(parseLocalDate("2026-07-20"))).toBe("feria judicial");
  });

  it("un miércoles común es hábil", () => {
    expect(esDiaHabil(parseLocalDate("2026-03-04"))).toBe(true);
  });
});

describe("calcularVencimiento (días hábiles)", () => {
  it("5 días hábiles desde lunes 2/3/2026 vence el 9/3 y salta el fin de semana", () => {
    const r = calcularVencimiento({ desde: "2026-03-02", diasHabiles: 5 });
    expect(r.vencimiento).toBe("2026-03-09");
    expect(r.diaGracia).toBe("2026-03-10");
    expect(r.excluidos.some((e) => e.fecha === "2026-03-07" && e.motivo === "fin de semana")).toBe(true);
    expect(r.excluidos.some((e) => e.fecha === "2026-03-08")).toBe(true);
  });

  it("salta un feriado (1 de mayo)", () => {
    // jueves 30/4 → no cuenta el día; vie 1/5 feriado; sáb/dom; lun 4/5 = 1er hábil
    const r = calcularVencimiento({ desde: "2026-04-30", diasHabiles: 1 });
    expect(r.vencimiento).toBe("2026-05-04");
  });
});

describe("calcularPrescripcion (calendario)", () => {
  it("2 años laborales (art. 256 LCT)", () => {
    expect(calcularPrescripcion({ desde: "2024-06-14", anios: 2 }).vencimiento).toBe("2026-06-14");
  });
});
