/**
 * Embeddings con Gemini (gemini-embedding-001) — sin credenciales nuevas:
 * reutiliza GOOGLE_AI_API_KEY. outputDimensionality=1536 para ser compatible
 * con el schema existente (legal_knowledge.embedding VECTOR(1536)).
 *
 * IMPORTANTE: con dimensión distinta de 3072 los vectores no vienen
 * normalizados; se normalizan acá (la búsqueda usa distancia coseno).
 */

const MODEL = "gemini-embedding-001";
const API = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}`;
const DIM = 1536;
const BATCH_SIZE = 90; // límite de la API: 100 por batch

type TaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

function normalize(v: number[]): number[] {
  const norm = Math.sqrt(v.reduce((acc, x) => acc + x * x, 0));
  if (norm === 0) return v;
  return v.map((x) => x / norm);
}

export function embeddingsDisponibles(): boolean {
  return Boolean(process.env.GOOGLE_AI_API_KEY);
}

async function callBatch(texts: string[], taskType: TaskType): Promise<number[][]> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY no configurada");

  const res = await fetch(`${API}:batchEmbedContents`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      requests: texts.map((text) => ({
        model: `models/${MODEL}`,
        content: { parts: [{ text: text.slice(0, 8000) }] },
        taskType,
        outputDimensionality: DIM,
      })),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini embeddings ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as { embeddings?: { values: number[] }[] };
  const embeddings = json.embeddings ?? [];
  if (embeddings.length !== texts.length) {
    throw new Error(`Gemini devolvió ${embeddings.length} embeddings para ${texts.length} textos`);
  }
  return embeddings.map((e) => normalize(e.values));
}

/** Embeddings de documentos (ingestión), en batches secuenciales. */
export async function embedDocuments(texts: string[]): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    out.push(...(await callBatch(texts.slice(i, i + BATCH_SIZE), "RETRIEVAL_DOCUMENT")));
  }
  return out;
}

/** Embedding de una consulta (búsqueda). */
export async function embedQuery(text: string): Promise<number[]> {
  const [v] = await callBatch([text], "RETRIEVAL_QUERY");
  return v;
}
