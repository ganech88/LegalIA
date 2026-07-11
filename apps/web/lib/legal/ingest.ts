/**
 * Ingestión de la base de conocimiento legal a pgvector (legal_knowledge).
 *
 * Fuentes:
 * 1. Corpus curado local (corpus.ts + corpus-complementario.ts) — garantizado.
 * 2. LCT 20.744 completa desde InfoLeg (texto actualizado oficial).
 *
 * Server-only. Requiere GOOGLE_AI_API_KEY (embeddings) y service role (insert).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { LEYES, JURISPRUDENCIA } from "./corpus";
import { embedDocuments } from "@/lib/ai/embeddings";

export interface ChunkLegal {
  source_type: string;      // 'ley' | 'codigo' | 'jurisprudencia'
  source_name: string;      // 'LCT 20.744', 'CCCN', 'Fallo Vizzoti...'
  article_number: string | null;
  title: string;
  content: string;
  jurisdiction: string;
  area_derecho: string[];
}

/** Chunks del corpus curado local (artículos + fallos verificados). */
export function chunksFromCorpus(): ChunkLegal[] {
  const chunks: ChunkLegal[] = [];
  for (const ley of LEYES) {
    for (const art of ley.articulos) {
      chunks.push({
        source_type: ley.id === "cccn" || ley.id === "cpccn" || ley.id === "cn" ? "codigo" : "ley",
        source_name: `${ley.nombre_corto} ${ley.numero}`.trim(),
        article_number: art.numero,
        title: art.titulo,
        content: `${ley.nombre} — Art. ${art.numero} (${art.titulo}): ${art.texto}`,
        jurisdiction: "nacional",
        area_derecho: [ley.area],
      });
    }
  }
  for (const fallo of JURISPRUDENCIA.filter((f) => f.verificado)) {
    chunks.push({
      source_type: "jurisprudencia",
      source_name: `Fallo ${fallo.caratula}`,
      article_number: null,
      title: fallo.tema,
      content: `${fallo.caratula} (${fallo.tribunal}, ${fallo.fecha}). Tema: ${fallo.tema}. Sumario: ${fallo.sumario}. Voces: ${fallo.voces.join(", ")}.`,
      jurisdiction: "nacional",
      area_derecho: [fallo.area],
    });
  }
  return chunks;
}

/** HTML de InfoLeg → texto plano (entidades ISO-8859-1 incluidas). */
function limpiarHtmlInfoleg(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&aacute;/g, "á").replace(/&eacute;/g, "é").replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó").replace(/&uacute;/g, "ú").replace(/&ntilde;/g, "ñ")
    .replace(/&Aacute;/g, "Á").replace(/&Eacute;/g, "É").replace(/&Iacute;/g, "Í")
    .replace(/&Oacute;/g, "Ó").replace(/&Uacute;/g, "Ú").replace(/&Ntilde;/g, "Ñ")
    .replace(/&deg;|&ordm;/g, "°")
    .replace(/&mdash;|&#8212;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ");
}

/** URLs del texto actualizado de la LCT en InfoLeg (puede estar en partes). */
const LCT_INFOLEG_URLS = [
  "https://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/25552/texact.htm",
];

/** Descarga y parsea la LCT completa desde InfoLeg. */
export async function chunksFromInfolegLCT(): Promise<{ chunks: ChunkLegal[]; parseInfo: string }> {
  let html = "";
  for (const url of LCT_INFOLEG_URLS) {
    const res = await fetch(url, { headers: { "User-Agent": "LegalIA/1.0" } });
    if (!res.ok) throw new Error(`InfoLeg respondió ${res.status} para ${url}`);
    // InfoLeg sirve ISO-8859-1: decodificar como latin1 para no romper acentos.
    const buf = await res.arrayBuffer();
    html += new TextDecoder("latin1").decode(buf) + "\n";
  }

  const texto = limpiarHtmlInfoleg(html);

  // Separar por encabezados "Art. N" / "ARTICULO N". Los números pueden llevar
  // "bis"/"ter" y símbolo de grado (2°).
  const partes = texto.split(/(?=(?:Art\.|ART[IÍ]CULO)\s*\d+\s*(?:bis|ter|quater)?\s*[°º]?\s*[.\-—–])/gi);

  const chunks: ChunkLegal[] = [];
  const vistos = new Set<string>();
  for (const parte of partes) {
    const m = parte.match(/^(?:Art\.|ART[IÍ]CULO)\s*(\d+\s*(?:bis|ter|quater)?)\s*[°º]?\s*[.\-—–]+\s*([\s\S]*)$/i);
    if (!m) continue;
    const numero = m[1].replace(/\s+/g, " ").trim().toLowerCase();
    if (vistos.has(numero)) continue;

    let cuerpo = m[2].replace(/\s*\n\s*/g, "\n").trim();
    // Cortar notas de InfoLeg al pie del artículo (referencias a normas modificatorias).
    cuerpo = cuerpo.split(/\(Art[íi]culo (?:sustituido|incorporado|derogado)/i)[0].trim();
    if (cuerpo.length < 40) continue; // descartar falsos positivos

    // Título: primera oración corta si parece un epígrafe.
    const primeraLinea = cuerpo.split("\n")[0];
    const titulo = primeraLinea.length <= 90 && !/\d{3}/.test(primeraLinea)
      ? primeraLinea.replace(/\.$/, "")
      : `Artículo ${numero}`;

    vistos.add(numero);
    chunks.push({
      source_type: "ley",
      source_name: "LCT 20.744",
      article_number: numero,
      title: titulo,
      content: `Ley de Contrato de Trabajo 20.744 — Art. ${numero}: ${cuerpo.slice(0, 6000)}`,
      jurisdiction: "nacional",
      area_derecho: ["laboral"],
    });
  }

  const nums = chunks
    .map((c) => parseInt(c.article_number ?? "0", 10))
    .filter((n) => !Number.isNaN(n));
  const parseInfo = `LCT InfoLeg: ${chunks.length} artículos parseados (del ${Math.min(...nums)} al ${Math.max(...nums)})`;
  return { chunks, parseInfo };
}


/**
 * CCCN completo desde InfoLeg (anexo de la ley 26.994, texto actualizado).
 * La página es enorme (2.671 artículos), así que la ingesta va POR TRAMOS
 * [desde, hasta] en invocaciones separadas del cron/endpoint. El fetch de la
 * página completa se repite por tramo (rápido server-side); lo caro son los
 * embeddings, que sí se limitan al tramo.
 */
const CCCN_INFOLEG_URL =
  "https://servicios.infoleg.gob.ar/infolegInternet/anexos/235000-239999/235975/texact.htm";

export const CCCN_TOTAL_ARTICULOS = 2671;

export async function chunksFromInfolegCCCN(
  desde: number,
  hasta: number,
): Promise<{ chunks: ChunkLegal[]; parseInfo: string }> {
  const res = await fetch(CCCN_INFOLEG_URL, { headers: { "User-Agent": "LegalIA/1.0" } });
  if (!res.ok) throw new Error(`InfoLeg respondió ${res.status} para el CCCN`);
  const buf = await res.arrayBuffer();
  const html = new TextDecoder("latin1").decode(buf);

  let texto = limpiarHtmlInfoleg(html);

  // La página arranca con la ley aprobatoria 26.994 (arts. 1-9 propios) y
  // recién después viene el código. Cortar en el TITULO PRELIMINAR del anexo
  // para no confundir los artículos de la ley con los del código.
  const idx = texto.search(/T[IÍ]TULO\s+PRELIMINAR/i);
  if (idx > 0) texto = texto.slice(idx);

  const partes = texto.split(/(?=(?:Art\.|ART[IÍ]CULO)\s*\d+\s*(?:bis|ter|quater)?\s*[°º]?\s*[.\-—–])/gi);

  // La página trae TRES bloques con numeración propia: la ley aprobatoria
  // 26.994 (arts. 1-12, ANTES del código), el código (arts. 1-2671) y el
  // Anexo II con leyes modificadas (24.240, 19.550..., DESPUÉS del código,
  // también arrancando en 1). Ni "primera aparición" ni "última aparición"
  // sirven. Delimitación robusta: el art. 2671 solo existe en el código;
  // desde su PRIMERA aparición caminamos hacia atrás mientras la numeración
  // descienda — esa secuencia decreciente es exactamente el código.
  interface Occ { n: number; numero: string; cuerpo: string; idx: number }
  const occs: Occ[] = [];
  for (const parte of partes) {
    const m = parte.match(/^(?:Art\.|ART[IÍ]CULO)\s*(\d+\s*(?:bis|ter|quater)?)\s*[°º]?\s*[.\-—–]+\s*([\s\S]*)$/i);
    if (!m) continue;
    const numero = m[1].replace(/\s+/g, " ").trim().toLowerCase();
    const n = parseInt(numero, 10);
    if (Number.isNaN(n)) continue;
    let cuerpo = m[2].replace(/\s*\n\s*/g, "\n").trim();
    cuerpo = cuerpo.split(/\(Art[íi]culo (?:sustituido|incorporado|derogado)/i)[0].trim();
    if (cuerpo.length < 30) continue;
    occs.push({ n, numero, cuerpo, idx: occs.length });
  }

  const fin = occs.findIndex((o) => o.n === CCCN_TOTAL_ARTICULOS);
  if (fin < 0) {
    return { chunks: [], parseInfo: `CCCN InfoLeg: no se encontró el art. ${CCCN_TOTAL_ARTICULOS}; formato de página inesperado.` };
  }
  // Caminata hacia atrás por número ESPERADO: el código desciende casi siempre
  // de a 1 (2671, 2670, ...). Aceptamos una ocurrencia solo si su número está
  // en (esperado-10, esperado]: las citas a artículos dentro de notas de
  // InfoLeg (que también matchean el regex) citan números lejanos y quedan
  // salteadas sin derailar la caminata. Gap 10 tolera artículos que el parser
  // no levantó (cuerpo corto, formato raro).
  const codigo: Occ[] = [occs[fin]];
  let esperado = occs[fin].n - 1;
  let salteadas = 0;
  for (let i = fin - 1; i >= 0 && esperado >= 1; i--) {
    const n = occs[i].n;
    if (n <= esperado && n > esperado - 10) {
      codigo.push(occs[i]);
      esperado = n - 1;
    } else {
      salteadas++;
    }
  }
  codigo.reverse();

  // Pasada de recuperación: si una nota cita un artículo CERCANO, la caminata
  // acepta la cita (roba el número) y saltea los artículos reales intermedios
  // (corridas de hasta 9). Reconstruimos por POSICIÓN documental: para cada
  // número n, el artículo real es la PRIMERA ocurrencia con ese número ubicada
  // entre las posiciones de los vecinos aceptados (las notas van después del
  // artículo real, y las citas lejanas caen fuera del rango de posiciones).
  const porN = new Map<number, Occ>();
  for (const o of codigo) if (!porN.has(o.n)) porN.set(o.n, o);
  const walkOrdenado = Array.from(porN.values()).sort((a, b) => a.n - b.n);
  const maxN = walkOrdenado[walkOrdenado.length - 1].n;
  // Barrido ascendente actualizando el vecino inferior con lo YA corregido
  // (un vecino robado tiene idx corrido a la derecha y rompe los límites si
  // no se corrige primero). El vecino superior sale de la caminata original:
  // un robo solo corre idx a la derecha, y elegir la PRIMERA ocurrencia del
  // rango tolera un límite derecho holgado.
  // Límite izquierdo global: la posición del primer artículo aceptado por la
  // caminata (el art. 1 del código). Sin esto, la recuperación de n=1..12 se
  // roba los artículos de la ley aprobatoria, que están ANTES del código.
  const inicioCodigo = codigo[0].idx;
  let lower: Occ | null = null;
  let upperPtr = 0;
  for (let n = 1; n <= maxN; n++) {
    while (upperPtr < walkOrdenado.length && walkOrdenado[upperPtr].n <= n) upperPtr++;
    const desdeIdx = lower ? lower.idx : inicioCodigo - 1;
    const hastaIdx = upperPtr < walkOrdenado.length ? walkOrdenado[upperPtr].idx : Number.MAX_SAFE_INTEGER;
    const candidato = occs.find((o) => o.n === n && o.idx > desdeIdx && o.idx < hastaIdx);
    if (candidato) porN.set(n, candidato); // primera ocurrencia del rango = artículo real
    const actual = porN.get(n);
    if (actual) lower = actual;
  }
  const codigoFinal = Array.from(porN.values()).sort((a, b) => a.n - b.n);

  const chunks: ChunkLegal[] = [];
  const vistos = new Set<string>();
  for (const o of codigoFinal) {
    if (o.n < desde || o.n > hasta) continue;
    if (vistos.has(o.numero)) continue;
    vistos.add(o.numero);
    const primeraLinea = o.cuerpo.split("\n")[0];
    const titulo = primeraLinea.length <= 90 && !/\d{3}/.test(primeraLinea)
      ? primeraLinea.replace(/\.$/, "")
      : `Artículo ${o.numero}`;
    chunks.push({
      source_type: "codigo",
      source_name: "CCCN completo (ley 26.994)",
      article_number: o.numero,
      title: titulo,
      content: `Código Civil y Comercial de la Nación — Art. ${o.numero} (${titulo}): ${o.cuerpo.slice(0, 6000)}`,
      jurisdiction: "nacional",
      area_derecho: ["civil", "comercial"],
    });
  }

  const parseInfo = `CCCN InfoLeg tramo ${desde}-${hasta}: ${chunks.length} artículos parseados (código delimitado: ${codigoFinal.length} arts tras recuperación, caminata: ${codigo.length}, salteadas: ${salteadas}, ${occs.length} ocurrencias en página)`;
  return { chunks, parseInfo };
}

/**
 * Embebe e inserta chunks. Borra las filas previas de cada source_name para
 * que la operación sea idempotente.
 */
export async function ingestChunks(
  admin: SupabaseClient,
  chunks: ChunkLegal[],
  opts: { deleteBy?: "source" | "article" } = {},
): Promise<number> {
  if (chunks.length === 0) return 0;
  const deleteBy = opts.deleteBy ?? "source";

  const embeddings = await embedDocuments(chunks.map((c) => c.content));

  const sources = Array.from(new Set(chunks.map((c) => c.source_name)));
  for (const source of sources) {
    if (deleteBy === "article") {
      // Solo borra los artículos de este tramo: permite ingestar una fuente
      // grande en varias invocaciones sin pisar los tramos anteriores.
      const nums = chunks.filter((c) => c.source_name === source).map((c) => c.article_number);
      const { error } = await admin
        .from("legal_knowledge")
        .delete()
        .eq("source_name", source)
        .in("article_number", nums);
      if (error) throw new Error(`Error limpiando tramo de ${source}: ${error.message}`);
    } else {
      const { error } = await admin.from("legal_knowledge").delete().eq("source_name", source);
      if (error) throw new Error(`Error limpiando ${source}: ${error.message}`);
    }
  }

  // Insert en tandas de 100 filas.
  for (let i = 0; i < chunks.length; i += 100) {
    const rows = chunks.slice(i, i + 100).map((c, j) => ({
      ...c,
      embedding: JSON.stringify(embeddings[i + j]),
      metadata: { ingestado_en: new Date().toISOString() },
    }));
    const { error } = await admin.from("legal_knowledge").insert(rows);
    if (error) throw new Error(`Error insertando filas: ${error.message}`);
  }
  return chunks.length;
}
