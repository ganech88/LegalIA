import { describe, it, expect } from "vitest";
import { parsearSerieBcra } from "./tasa-pasiva-bcra";

describe("parsearSerieBcra", () => {
  it("forma plana (results con fecha y valor), ordena por fecha", () => {
    const p = parsearSerieBcra({ status: 200, results: [
      { idVariable: 1198, fecha: "2026-03-10", valor: 102.5 },
      { idVariable: 1198, fecha: "2026-03-09", valor: 102.4 },
    ] });
    expect(p.map((x) => x.fecha)).toEqual(["2026-03-09", "2026-03-10"]);
  });
  it("forma anidada (results[].detalle[])", () => {
    const p = parsearSerieBcra({ results: [{ idVariable: 1198, detalle: [{ fecha: "2026-03-09", valor: 1.1 }] }] });
    expect(p).toEqual([{ fecha: "2026-03-09", valor: 1.1 }]);
  });
  it("respuesta inesperada → vacío", () => {
    expect(parsearSerieBcra({ errorMessages: ["x"] })).toEqual([]);
    expect(parsearSerieBcra(null)).toEqual([]);
  });
});
