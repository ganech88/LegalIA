import { describe, it, expect } from "vitest";
import { revisarVigencias, pendientesDeVigilancia } from "./vigencias";

const estado = (fecha: string, id: string) => revisarVigencias(new Date(`${fecha}T12:00:00Z`)).find((c) => c.id === id)?.estado;

describe("revisarVigencias", () => {
  it("con los datos cargados al 10/11/2026 no hay nada pendiente", () => {
    expect(pendientesDeVigilancia(new Date("2026-11-10T12:00:00Z"))).toEqual([]);
  });
  it("avisa del FAL desde 15 días antes del 01/12/2026", () => {
    expect(estado("2026-11-20", "hito_2026-12-01")).toBe("por_vencer");
    expect(estado("2026-12-02", "hito_2026-12-01")).toBe("vencido");
  });
  it("los pisos SRT avisan 30 días antes de vencer y después", () => {
    expect(estado("2027-02-10", "pisos_srt")).toBe("por_vencer");
    expect(estado("2027-03-05", "pisos_srt")).toBe("vencido");
  });
  it("la UMA queda vieja si pasan más de 100 días sin cargar un valor", () => {
    expect(estado("2027-01-15", "uma")).not.toBe("ok");
  });
  it("la feria de invierno 2027 se reclama desde junio", () => {
    expect(estado("2027-05-15", "feria")).toBe("ok");
    expect(estado("2027-06-15", "feria")).toBe("por_vencer");
  });
});
