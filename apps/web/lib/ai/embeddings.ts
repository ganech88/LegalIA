/**
 * Embeddings con bge-m3 en Cloudflare Workers AI: multilingüe, 1024 dimensiones
 * y con cupo gratuito diario (10.000 neurons ≈ 9 millones de tokens).
 * Variables: CLOUDFLARE_ACCOUNT_ID y CLOUDFLARE_AI_TOKEN.
 * Los vectores se guardan en legal_knowledge.embedding_m3.
 */

const MODEL = "@cf/baai/bge-m3";
export const EMBEDDING_DIM = 1024;
const BATCH_SIZE = 24;
const MAX_CHARS = 6000;

function normalize(v: number[]): number[] {
  const norm = Math.sqrt(v.reduce((acc, x) => acc + x * x, 0));
  return norm === 0 ? v : v.map((x) => x / norm);
}

export function embeddingsDisponibles(): boolean {
  return Boolean(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_AI_TOKEN);
}

/** Activa si están las credenciales; RAG_SEMANTICO=0 la apaga sin tocar nada más. */
export function busquedaSemanticaActiva(): boolean {
  return embeddingsDisponibles() && process.env.RAG_SEMANTICO !== "0";
}

async function callBatch(texts: string[]): Promise<number[][]> {
  const cuenta = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_AI_TOKEN;
  if (!cuenta || !token) throw new Error("Cloudflare Workers AI no configurado");

  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cuenta}/ai/run/${MODEL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ text: texts.map((t) => t.slice(0, MAX_CHARS)) }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Cloudflare embeddings ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as { result?: { data?: number[][] } };
  const data = json.result?.data ?? [];
  if (data.length !== texts.length || data.some((v) => v.length !== EMBEDDING_DIM)) {
    throw new Error(`Cloudflare devolvió ${data.length} embeddings para ${texts.length} textos`);
  }
  return data.map(normalize);
}

/** Embeddings de documentos (ingestión), en tandas secuenciales. */
export async function embedDocuments(texts: string[]): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    out.push(...(await callBatch(texts.slice(i, i + BATCH_SIZE))));
  }
  return out;
}

/** Embedding de una consulta (búsqueda). */
export async function embedQuery(text: string): Promise<number[]> {
  const [v] = await callBatch([text]);
  return v;
}
