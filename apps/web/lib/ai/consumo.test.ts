import { describe, it, expect } from "vitest";
import { costoUSD, resumir, type FilaUso } from "./consumo";

const fila = (user: string, modelo: string | null, tin: number | null, tout: number | null, dia = "2026-11-25"): FilaUso => ({
  user_id: user, modelo_usado: modelo, tokens_input: tin, tokens_output: tout, created_at: `${dia}T12:00:00Z`,
});

describe("costoUSD", () => {
  it("Haiku: 1 y 5 dólares por millón", () => {
    expect(costoUSD("claude-haiku-4-5-20251001", 1_000_000, 1_000_000)).toBeCloseTo(6, 6);
    expect(costoUSD("haiku-4.5", 3000, 600)).toBeCloseTo(0.006, 6);
  });
  it("Sonnet: 3 y 15 dólares por millón", () => {
    expect(costoUSD("claude-sonnet-4-6", 4000, 3500)).toBeCloseTo(0.0645, 6);
  });
  it("modelos gratuitos y desconocidos cuestan 0", () => {
    expect(costoUSD("google:gemini-3.8-flash", 1e6, 1e6)).toBe(0);
    expect(costoUSD(null, 1e6, 1e6)).toBe(0);
  });
});

describe("resumir", () => {
  it("agrupa por usuario, modelo y día, y ordena por gasto", () => {
    const r = resumir(
      [fila("a", "claude-haiku-4-5-20251001", 3000, 600), fila("b", "google:gemini-3.8-flash", 3000, 600)],
      [fila("b", "claude-sonnet-4-6", 4000, 3500, "2026-11-24")],
    );
    expect(r.consultas).toBe(2);
    expect(r.escritos).toBe(1);
    expect(r.porUsuario[0].user_id).toBe("b");
    expect(r.porUsuario[0].escritos).toBe(1);
    expect(r.usd).toBeCloseTo(0.006 + 0.0645, 6);
    expect(Object.keys(r.porDia).sort()).toEqual(["2026-11-24", "2026-11-25"]);
    expect(r.porModelo["google:gemini-3.8-flash"].usd).toBe(0);
  });
  it("filas viejas sin tokens usan un uso por defecto", () => {
    const r = resumir([fila("a", "haiku-4.5", null, null)], []);
    expect(r.tokens).toBe(3600);
  });
});
