import { describe, it, expect } from "vitest";
import { articulosCitados } from "./busqueda-dirigida";

describe("articulosCitados", () => {
  it("reconoce artículo y número de ley", () => {
    expect(articulosCitados("¿Qué dice el artículo 3 de la ley 27.802?")).toEqual([{ numero: "3", fuente: "%27.802%" }]);
    expect(articulosCitados("art. 14 bis ley 24557")).toEqual([{ numero: "14 bis", fuente: "%24.557%" }]);
  });
  it("reconoce las normas por su nombre", () => {
    expect(articulosCitados("plazo del art. 244 del CPCCN")).toEqual([{ numero: "244", fuente: "CPCCN completo%" }]);
    expect(articulosCitados("arts. 245 de la LCT")[0]).toEqual({ numero: "245", fuente: "LCT%" });
  });
  it("sin norma reconocible no busca nada", () => {
    expect(articulosCitados("¿qué dice el artículo 3?")).toEqual([]);
    expect(articulosCitados("plazo para apelar una sentencia")).toEqual([]);
  });
});
