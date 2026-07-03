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

  // HTML → texto plano.
  const texto = html
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
 * Embebe e inserta chunks. Borra las filas previas de cada source_name para
 * que la operación sea idempotente.
 */
export async function ingestChunks(admin: SupabaseClient, chunks: ChunkLegal[]): Promise<number> {
  if (chunks.length === 0) return 0;

  const embeddings = await embedDocuments(chunks.map((c) => c.content));

  const sources = Array.from(new Set(chunks.map((c) => c.source_name)));
  for (const source of sources) {
    const { error } = await admin.from("legal_knowledge").delete().eq("source_name", source);
    if (error) throw new Error(`Error limpiando ${source}: ${error.message}`);
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
