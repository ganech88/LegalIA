/**
 * Carga de normas nacionales completas desde InfoLeg (texto actualizado).
 *
 * A diferencia del parser de códigos de ingest.ts (pensado para el CCCN, con
 * tres numeraciones en la misma página), este recorre la norma en orden: un
 * encabezado "ARTICULO N" solo abre un artículo nuevo si N es el siguiente
 * esperado y está escrito igual que el primero. Así, los artículos citados
 * entre comillas por una ley modificatoria ("Sustitúyese el artículo 245 por
 * el siguiente: Artículo 245.- ...") quedan dentro del artículo que los trae.
 */
import type { ChunkLegal } from "./ingest";

export interface NormaInfoleg {
  clave: string;
  infolegId: number;
  /** Nombre de la fuente en la base. Distinto del corpus curado, para que la reingesta semanal no la pise. */
  source_name: string;
  /** Prefijo del contenido de cada artículo. */
  prefijo: string;
  source_type: "ley" | "codigo";
  area_derecho: string[];
  /** Debe aparecer en el encabezado de la página: evita cargar otra norma por un ID equivocado. */
  esperado: RegExp;
  /** Mínimo de artículos para aceptar el parseo. */
  minimo: number;
}

export const NORMAS_INFOLEG: NormaInfoleg[] = [
  { clave: "lrt", infolegId: 27971, source_name: "Ley 24.557 de Riesgos del Trabajo (texto actualizado)", prefijo: "Ley 24.557 de Riesgos del Trabajo", source_type: "ley", area_derecho: ["laboral"], esperado: /24\.?557|RIESGOS DEL TRABAJO/i, minimo: 35 },
  { clave: "ley26773", infolegId: 203798, source_name: "Ley 26.773 (reparación de accidentes y enfermedades, texto actualizado)", prefijo: "Ley 26.773 — Régimen de ordenamiento de la reparación de los daños derivados de accidentes de trabajo y enfermedades profesionales", source_type: "ley", area_derecho: ["laboral"], esperado: /26\.?773/, minimo: 12 },
  { clave: "ley27348", infolegId: 272119, source_name: "Ley 27.348 (complementaria de Riesgos del Trabajo)", prefijo: "Ley 27.348 — Complementaria de la Ley sobre Riesgos del Trabajo", source_type: "ley", area_derecho: ["laboral"], esperado: /27\.?348/, minimo: 15 },
  { clave: "ley27802", infolegId: 423680, source_name: "Ley 27.802 de Modernización Laboral (texto completo)", prefijo: "Ley 27.802 de Modernización Laboral", source_type: "ley", area_derecho: ["laboral"], esperado: /27\.?802|MODERNIZACI[OÓ]N LABORAL/i, minimo: 100 },
  { clave: "ley27742", infolegId: 401266, source_name: "Ley 27.742 Bases (texto completo)", prefijo: "Ley 27.742 de Bases y Puntos de Partida para la Libertad de los Argentinos", source_type: "ley", area_derecho: ["laboral", "administrativo"], esperado: /27\.?742|BASES Y PUNTOS DE PARTIDA/i, minimo: 150 },
  { clave: "ley24013", infolegId: 412, source_name: "Ley 24.013 de Empleo (texto actualizado)", prefijo: "Ley 24.013 Nacional de Empleo", source_type: "ley", area_derecho: ["laboral"], esperado: /24\.?013/, minimo: 80 },
  { clave: "cpccn", infolegId: 16547, source_name: "CPCCN completo (ley 17.454, texto actualizado)", prefijo: "Código Procesal Civil y Comercial de la Nación", source_type: "codigo", area_derecho: ["procesal", "civil"], esperado: /17\.?454|PROCESAL CIVIL Y COMERCIAL/i, minimo: 500 },
];

export function urlsInfoleg(id: number): string[] {
  const desde = Math.floor(id / 5000) * 5000;
  const base = `https://servicios.infoleg.gob.ar/infolegInternet/anexos/${desde}-${desde + 4999}/${id}`;
  return [`${base}/texact.htm`, `${base}/norma.htm`];
}

const ENTIDADES: Record<string, string> = {
  nbsp: " ", aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ", uuml: "ü",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú", Ntilde: "Ñ", Uuml: "Ü",
  deg: "°", ordm: "°", ordf: "ª", mdash: "—", ndash: "–", amp: "&", quot: '"', laquo: "«", raquo: "»",
  ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", iquest: "¿", iexcl: "¡", lt: "<", gt: ">",
};

export function limpiarHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h\d|li)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&([a-zA-Z]+);/g, (m, n) => ENTIDADES[n] ?? m)
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

export async function descargarInfoleg(id: number): Promise<{ texto: string; url: string }> {
  let ultimo = "sin respuesta";
  for (const url of urlsInfoleg(id)) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "LegalIA/1.0" }, signal: AbortSignal.timeout(25000) });
      if (!res.ok) {
        ultimo = `HTTP ${res.status}`;
        continue;
      }
      // InfoLeg sirve ISO-8859-1.
      const texto = limpiarHtml(new TextDecoder("latin1").decode(await res.arrayBuffer()));
      if (texto.length > 500) return { texto, url };
      ultimo = "página vacía";
    } catch (e) {
      ultimo = e instanceof Error ? e.message : "error de red";
    }
  }
  throw new Error(`InfoLeg no devolvió la norma ${id} (${ultimo}).`);
}

const ENCABEZADO = /(ART[IÍ]CULO|Art[ií]culo|ART\.?|Art\.?)\s*(\d+)\s*(bis|ter|quater|quinquies)?\s*[°ºª]?\s*(?:bis|ter|quater|quinquies)?\s*[.\-—–:]+/g;
const NOTA = /\((?:Art[ií]culo|Inciso|Apartado|P[áa]rrafo|Nota Infoleg)[^)]{0,600}\)/i;

interface Articulo {
  numero: string;
  cuerpo: string;
}

/** Divide el texto de una norma en artículos, en orden y sin perder los citados. */
export function partirEnArticulos(texto: string): Articulo[] {
  const candidatos: { idx: number; fin: number; forma: string; n: number; sufijo: string }[] = [];
  for (const m of texto.matchAll(ENCABEZADO)) {
    const sufijo = (m[0].match(/\b(bis|ter|quater|quinquies)\b/i)?.[1] ?? "").toLowerCase();
    candidatos.push({ idx: m.index ?? 0, fin: (m.index ?? 0) + m[0].length, forma: m[1], n: parseInt(m[2], 10), sufijo });
  }
  const primero = candidatos.find((c) => c.n === 1 && !c.sufijo);
  if (!primero) return [];
  const mayus = (f: string) => f === f.toUpperCase();
  const mismaForma = (f: string) => mayus(f) === mayus(primero.forma);

  const inicios: typeof candidatos = [];
  let ultimo = 0;
  const sufijosVistos = new Set<string>();
  for (const c of candidatos) {
    if (c.idx < primero.idx || !mismaForma(c.forma)) continue;
    // "Sustitúyese el artículo 4° de la ley X por el siguiente: Artículo 4°- ..." — lo que
    // sigue a esa fórmula es el artículo de la otra ley, aunque esté escrito igual.
    if (c !== primero && /siguientes?(?:\s+texto)?\s*:\s*["“«'‘]?\s*$/i.test(texto.slice(Math.max(0, c.idx - 120), c.idx))) continue;
    const clave = `${c.n}${c.sufijo}`;
    const siguiente = !c.sufijo && c.n > ultimo && c.n <= ultimo + 6;
    const bis = Boolean(c.sufijo) && c.n === ultimo && !sufijosVistos.has(clave);
    if (!siguiente && !bis) continue; // cita dentro de otro artículo
    if (siguiente) ultimo = c.n;
    sufijosVistos.add(clave);
    inicios.push(c);
  }

  const articulos = inicios.map((c, i) => ({
    numero: c.sufijo ? `${c.n} ${c.sufijo}` : String(c.n),
    cuerpo: texto.slice(c.fin, i + 1 < inicios.length ? inicios[i + 1].idx : texto.length).trim(),
  }));

  // En los códigos el epígrafe va ANTES del encabezado ("PLAZO" / "Art. 244. - ..."),
  // así que queda colgado al final del artículo anterior: se pasa al que corresponde.
  const esTitulo = (l: string) => l.length >= 3 && l.length <= 110 && /[A-ZÁÉÍÓÚÑ]{3}/.test(l) && !/[a-záéíóúñ]/.test(l);
  for (let i = 0; i + 1 < articulos.length; i++) {
    const lineas = articulos[i].cuerpo.split("\n");
    const titulos: string[] = [];
    while (lineas.length > 1 && esTitulo(lineas[lineas.length - 1].trim())) titulos.unshift(lineas.pop()!.trim());
    if (titulos.length === 0) continue;
    articulos[i].cuerpo = lineas.join("\n").trim();
    const epigrafe = titulos.join(" ").replace(/\s+/g, " ");
    const sig = articulos[i + 1];
    sig.cuerpo = `${epigrafe}. ${sig.cuerpo.replace(/^[\s.\-—–]+/, "")}`;
  }
  return articulos;
}

export function chunksDeNorma(texto: string, norma: NormaInfoleg): ChunkLegal[] {
  const chunks: ChunkLegal[] = [];
  for (const a of partirEnArticulos(texto)) {
    const nota = a.cuerpo.match(NOTA)?.[0] ?? "";
    let cuerpo = a.cuerpo.replace(/\n+/g, "\n").trim();
    const sinNotas = cuerpo.split(NOTA)[0].trim();
    const derogado = /derogad/i.test(nota) && sinNotas.length < 40;
    if (derogado) {
      cuerpo = `ARTÍCULO DEROGADO. ${nota}`;
    } else if (sinNotas.length < 25) {
      continue; // encabezado suelto, sin texto
    }
    const primeraLinea = cuerpo.split("\n")[0];
    const titulo = derogado
      ? "Derogado"
      : primeraLinea.length <= 110 && !/\d{3}/.test(primeraLinea)
        ? primeraLinea.replace(/[.:—–-]+\s*$/, "")
        : `Artículo ${a.numero}`;
    chunks.push({
      source_type: norma.source_type,
      source_name: norma.source_name,
      article_number: a.numero,
      title: titulo,
      content: `${norma.prefijo} — Art. ${a.numero}: ${cuerpo.slice(0, 6000)}`,
      jurisdiction: "nacional",
      area_derecho: norma.area_derecho,
    });
  }
  return chunks;
}

export interface ResultadoNorma {
  clave: string;
  url: string;
  articulos: number;
  primero: string | null;
  ultimo: string | null;
  derogados: number;
  encabezado: string;
  muestra: string;
  valido: boolean;
  motivo?: string;
  chunks: ChunkLegal[];
}

/** Descarga y parsea una norma del catálogo. No toca la base. */
export async function prepararNorma(norma: NormaInfoleg, infolegId?: number): Promise<ResultadoNorma> {
  const { texto, url } = await descargarInfoleg(infolegId ?? norma.infolegId);
  const chunks = chunksDeNorma(texto, norma);
  const encabezado = texto.slice(0, 1500).replace(/\s+/g, " ").trim().slice(0, 300);
  let motivo: string | undefined;
  if (!norma.esperado.test(texto.slice(0, 4000))) motivo = "El encabezado de la página no corresponde a la norma esperada: revisar el ID de InfoLeg.";
  else if (chunks.length < norma.minimo) motivo = `Solo ${chunks.length} artículos (mínimo ${norma.minimo}): el formato de la página no es el esperado.`;
  return {
    clave: norma.clave,
    url,
    articulos: chunks.length,
    primero: chunks[0]?.article_number ?? null,
    ultimo: chunks.at(-1)?.article_number ?? null,
    derogados: chunks.filter((c) => c.title === "Derogado").length,
    encabezado,
    muestra: chunks[Math.min(2, chunks.length - 1)]?.content.slice(0, 300) ?? "",
    valido: !motivo,
    motivo,
    chunks,
  };
}
