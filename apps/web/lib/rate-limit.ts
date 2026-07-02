/**
 * Rate limiting por IP (ventana deslizante, en memoria).
 *
 * Complementa el rate limit por usuario (RPC check_rate_limit en Supabase).
 * Al ser en memoria es por instancia serverless: no es perfecto bajo
 * escalado horizontal, pero corta abuso básico (scraping, fuerza bruta,
 * consumo de cuota de IA desde una misma IP) sin dependencias externas.
 */

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

/** Devuelve la IP del request (Vercel setea x-forwarded-for). */
export function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * true si el request está dentro del límite; false si debe rechazarse (429).
 */
export function checkIpRateLimit(
  ip: string,
  action: string,
  max: number,
  windowSeconds: number,
): boolean {
  const key = `${action}:${ip}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // Evitar crecimiento sin límite de la Map.
  if (buckets.size > MAX_BUCKETS && !buckets.has(key)) {
    buckets.clear();
  }

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }

  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
  if (bucket.timestamps.length >= max) return false;

  bucket.timestamps.push(now);
  return true;
}
