import { describe, it, expect } from "vitest";
import { partirEnArticulos, chunksDeNorma, limpiarHtml, urlsInfoleg, NORMAS_INFOLEG } from "./infoleg";

const norma = NORMAS_INFOLEG[0];

describe("urlsInfoleg", () => {
  it("arma el rango de 5000 de InfoLeg", () => {
    expect(urlsInfoleg(27971)[0]).toBe("https://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/27971/texact.htm");
    expect(urlsInfoleg(412)[1]).toBe("https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/412/norma.htm");
    expect(urlsInfoleg(423680)[0]).toContain("/420000-424999/423680/");
  });
});

describe("limpiarHtml", () => {
  it("quita etiquetas y traduce entidades", () => {
    expect(limpiarHtml("<p>ART&Iacute;CULO 1&deg; &mdash; Reparaci&oacute;n&nbsp;integral</p>").trim()).toBe("ARTÍCULO 1° — Reparación integral");
  });
});

describe("partirEnArticulos", () => {
  const ley = [
    "LEY DE RIESGOS DEL TRABAJO. Ley N° 24.557. El Senado y Cámara de Diputados sancionan:",
    "ARTICULO 1° — Normativa aplicable y objetivos de la Ley sobre Riesgos del Trabajo.",
    "ARTICULO 2° — Ambito de aplicación. Están obligatoriamente incluidos en el ámbito de la LRT los funcionarios.",
    "ARTICULO 3° — (Artículo derogado por art. 99 de la Ley N° 27.742 B.O. 8/7/2024)",
    "ARTICULO 4° — Obligaciones de las partes. Los empleadores y los trabajadores comprendidos en el ámbito de la LRT.",
    "ARTICULO 4° bis — Incorporado. Las aseguradoras deberán informar al trabajador sus derechos.",
    "ARTICULO 5° — Recargo por incumplimientos. Si el accidente se hubiere producido por incumplimientos.",
  ].join("\n");

  it("respeta el orden y reconoce bis", () => {
    const a = partirEnArticulos(ley);
    expect(a.map((x) => x.numero)).toEqual(["1", "2", "3", "4", "4 bis", "5"]);
    expect(a[1].cuerpo).toContain("Ambito de aplicación");
  });

  it("los artículos derogados se conservan con su nota", () => {
    const c = chunksDeNorma(ley, norma);
    const tres = c.find((x) => x.article_number === "3");
    expect(tres?.title).toBe("Derogado");
    expect(tres?.content).toContain("ARTÍCULO DEROGADO");
    expect(tres?.content).toContain("27.742");
  });

  it("una ley modificatoria no parte por los artículos que cita entre comillas", () => {
    const modificatoria = [
      "LEY DE MODERNIZACIÓN LABORAL. Ley 27802.",
      "ARTÍCULO 1°.- Objeto. La presente ley tiene por objeto modernizar el régimen laboral vigente.",
      "ARTÍCULO 2°.- Sustitúyese el artículo 245 de la Ley de Contrato de Trabajo por el siguiente:",
      "Artículo 245.- Indemnización por antigüedad o despido. En los casos de despido dispuesto por el empleador sin justa causa.",
      "Artículo 3.- texto citado que no es de esta ley y no debe abrir un artículo nuevo.",
      "ARTÍCULO 3°.- Sustitúyese el artículo 231 de la misma ley por el siguiente:",
      "Artículo 231.- Plazos. El contrato de trabajo no podrá ser disuelto sin previo aviso.",
      "ARTÍCULO 4°.- La presente ley entrará en vigencia el día de su publicación en el Boletín Oficial.",
    ].join("\n");
    const a = partirEnArticulos(modificatoria);
    expect(a.map((x) => x.numero)).toEqual(["1", "2", "3", "4"]);
    expect(a[1].cuerpo).toContain("Artículo 245.- Indemnización por antigüedad");
    expect(a[2].cuerpo).toContain("Artículo 231.- Plazos");
  });

  it("no confunde el artículo sustituido con uno propio aunque esté escrito igual", () => {
    const t = [
      "Artículo 1°- Sustitúyese el artículo 2° de la Ley de Contrato de Trabajo por el siguiente:",
      "Artículo 2°- Ámbito de aplicación. La vigencia de esta ley quedará condicionada a su compatibilidad.",
      "Artículo 2°- Sustitúyese el artículo 4° de la Ley de Contrato de Trabajo por el siguiente:",
      "Artículo 4°- Concepto de trabajo. Constituye trabajo toda actividad lícita prestada a favor de otro.",
      "Artículo 3°- Sustitúyese el artículo 9° de la misma ley por el siguiente:",
      "Artículo 9°- El principio de la norma más favorable para el trabajador rige en caso de duda.",
      "Artículo 4°- Comuníquese al Poder Ejecutivo nacional, con las formalidades de estilo.",
    ].join("\n");
    const a = partirEnArticulos(t);
    expect(a.map((x) => x.numero)).toEqual(["1", "2", "3", "4"]);
    expect(a[0].cuerpo).toContain("Ámbito de aplicación");
    expect(a[1].cuerpo).toContain("Concepto de trabajo");
    expect(a[3].cuerpo).toContain("Comuníquese");
  });

  it("acepta 'Art 684.' sin punto después de Art", () => {
    const a = partirEnArticulos("Art. 1. - Uno, con texto suficiente.\nArt 2. - Dos, con texto suficiente.\nArt. 3. - Tres, con texto suficiente.");
    expect(a.map((x) => x.numero)).toEqual(["1", "2", "3"]);
  });

  it("el epígrafe que precede al encabezado pasa al artículo que titula", () => {
    const t = "Art. 1. - Los recursos se concederán en efecto suspensivo.\nPLAZO\nArt. 2. - No habiendo disposiciones en contrario, el plazo para apelar será de CINCO (5) días.\nFORMA DE INTERPOSICION DEL RECURSO\nArt. 3. - El recurso de apelación se interpondrá por escrito o verbalmente.";
    const a = partirEnArticulos(t);
    expect(a[0].cuerpo).not.toContain("PLAZO");
    expect(a[1].cuerpo.startsWith("PLAZO. No habiendo")).toBe(true);
    expect(a[2].cuerpo.startsWith("FORMA DE INTERPOSICION DEL RECURSO. El recurso")).toBe(true);
  });

  it("tolera un artículo faltante sin perder los siguientes", () => {
    const a = partirEnArticulos("ARTICULO 1° — Uno, con texto suficiente.\nARTICULO 2° — Dos, con texto suficiente.\nARTICULO 5° — Cinco, con texto suficiente.");
    expect(a.map((x) => x.numero)).toEqual(["1", "2", "5"]);
  });

  it("sin artículo 1 no devuelve nada", () => {
    expect(partirEnArticulos("Texto sin estructura de artículos.")).toEqual([]);
  });
});
