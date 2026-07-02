import { describe, it, expect } from "vitest";
import { verificarCitas } from "./citas";

describe("verificarCitas — artículos", () => {
  it("verifica un artículo existente en el corpus (art. 245 LCT)", () => {
    const r = verificarCitas("Conforme el art. 245 LCT corresponde la indemnización por antigüedad.");
    const cita = r.citas.find((c) => c.cita.includes("245"));
    expect(cita).toBeDefined();
    expect(cita!.estado).toBe("verificada");
    expect(cita!.fuente).toContain("LCT");
  });

  it("verifica artículos múltiples (arts. 232, 233 y 245 LCT)", () => {
    const r = verificarCitas("Se reclaman los rubros de los arts. 232, 233 y 245 de la LCT.");
    const nums = r.citas.filter((c) => c.tipo === "articulo" && c.estado === "verificada");
    expect(nums.length).toBeGreaterThanOrEqual(3);
  });

  it("verifica leyes complementarias (art. 2 ley 25.323)", () => {
    const r = verificarCitas("Corresponde el incremento del art. 2 de la Ley 25.323.");
    const cita = r.citas.find((c) => c.fuente?.includes("25.323"));
    expect(cita).toBeDefined();
    expect(cita!.estado).toBe("verificada");
  });

  it("verifica el art. 14 bis de la Constitución Nacional", () => {
    const r = verificarCitas("La protección contra el despido arbitrario del art. 14 bis de la Constitución Nacional.");
    const cita = r.citas.find((c) => c.cita.includes("14 bis"));
    expect(cita).toBeDefined();
    expect(cita!.estado).toBe("verificada");
  });

  it("marca como no verificable un artículo inexistente en el corpus", () => {
    const r = verificarCitas("Según el art. 999 LCT el trabajador tiene derecho.");
    const cita = r.citas.find((c) => c.cita.includes("999"));
    expect(cita).toBeDefined();
    expect(cita!.estado).toBe("no_verificable");
  });

  it("marca como no verificable una ley fuera del corpus", () => {
    const r = verificarCitas("Conforme el art. 52 de la ley 19.550 de sociedades.");
    const cita = r.citas.find((c) => c.cita.includes("52"));
    expect(cita).toBeDefined();
    expect(cita!.estado).toBe("no_verificable");
  });

  it("no confunde palabras que contienen 'cn' con la Constitución Nacional", () => {
    const r = verificarCitas("El art. 400 según la técnica registral aplicable.");
    const cita = r.citas.find((c) => c.cita.includes("400"));
    expect(cita?.fuente ?? "").not.toContain("CN");
  });
});

describe("verificarCitas — fallos", () => {
  it("verifica un leading case confirmado (Vizzoti)", () => {
    const r = verificarCitas('Conforme la doctrina "Vizzoti" de la CSJN, el tope no puede reducir la base más del 33%.');
    const fallo = r.citas.find((c) => c.tipo === "fallo" && c.cita.includes("Vizzoti"));
    expect(fallo).toBeDefined();
    expect(fallo!.estado).toBe("verificada");
  });

  it("marca como dudoso un fallo del corpus no confirmado", () => {
    const r = verificarCitas("Como se resolvió en Cantilo sobre teletrabajo.");
    const fallo = r.citas.find((c) => c.tipo === "fallo" && c.cita.includes("Cantilo"));
    expect(fallo).toBeDefined();
    expect(fallo!.estado).toBe("dudosa");
  });

  it("marca como no verificable una carátula desconocida", () => {
    const r = verificarCitas('Así lo dijo la CNAT en "Zutano, Pedro c/ Empresa Inexistente SA s/ despido".');
    const fallo = r.citas.find((c) => c.tipo === "fallo" && c.cita.includes("Zutano"));
    expect(fallo).toBeDefined();
    expect(fallo!.estado).toBe("no_verificable");
  });

  it("el resumen cuenta por estado", () => {
    const r = verificarCitas("El art. 245 LCT y la doctrina Vizzoti. También Zutano c/ Empresa Falsa SA.");
    expect(r.resumen.verificadas).toBeGreaterThanOrEqual(2);
    expect(r.resumen.no_verificables).toBeGreaterThanOrEqual(1);
  });
});
