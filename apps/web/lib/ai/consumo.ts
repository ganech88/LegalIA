/**
 * Consumo de IA por usuario, con costo ESTIMADO en dólares.
 *
 * Los tokens se estiman por largo de texto (ver estimarTokens) y los precios
 * son los de lista por millón de tokens: sirve para ver órdenes de magnitud y
 * detectar a quien se dispara, no para conciliar la factura del proveedor.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

/** USD por millón de tokens [entrada, salida]. Actualizar si cambian los precios de lista. */
const PRECIOS: { si: RegExp; in: number; out: number }[] = [
  { si: /sonnet/i, in: 3, out: 15 },
  { si: /haiku/i, in: 1, out: 5 },
];
/** Uso por defecto para filas viejas, guardadas sin tokens. */
const DEFECTO = { consulta: { in: 3000, out: 600 }, escrito: { in: 4000, out: 3500 } } as const;

export function costoUSD(modelo: string | null | undefined, tokensIn: number, tokensOut: number): number {
  const p = PRECIOS.find((x) => x.si.test(modelo ?? ""));
  if (!p) return 0; // Groq y Google en su capa gratuita, o modo demo.
  return (tokensIn * p.in + tokensOut * p.out) / 1_000_000;
}

export interface FilaUso {
  user_id: string;
  modelo_usado: string | null;
  tokens_input: number | null;
  tokens_output: number | null;
  created_at: string;
}

export interface ConsumoUsuario {
  user_id: string;
  consultas: number;
  escritos: number;
  tokens: number;
  usd: number;
}

export interface ResumenConsumo {
  usd: number;
  tokens: number;
  consultas: number;
  escritos: number;
  porModelo: Record<string, { usos: number; usd: number }>;
  porUsuario: ConsumoUsuario[];
  porDia: Record<string, number>;
}

export function resumir(consultas: FilaUso[], escritos: FilaUso[]): ResumenConsumo {
  const r: ResumenConsumo = { usd: 0, tokens: 0, consultas: consultas.length, escritos: escritos.length, porModelo: {}, porUsuario: [], porDia: {} };
  const usuarios = new Map<string, ConsumoUsuario>();
  const sumar = (f: FilaUso, tipo: "consulta" | "escrito") => {
    const tin = f.tokens_input ?? DEFECTO[tipo].in;
    const tout = f.tokens_output ?? DEFECTO[tipo].out;
    const usd = costoUSD(f.modelo_usado, tin, tout);
    const modelo = f.modelo_usado ?? "desconocido";
    r.usd += usd;
    r.tokens += tin + tout;
    r.porModelo[modelo] ??= { usos: 0, usd: 0 };
    r.porModelo[modelo].usos++;
    r.porModelo[modelo].usd += usd;
    const dia = f.created_at.slice(0, 10);
    r.porDia[dia] = (r.porDia[dia] ?? 0) + usd;
    const u = usuarios.get(f.user_id) ?? { user_id: f.user_id, consultas: 0, escritos: 0, tokens: 0, usd: 0 };
    if (tipo === "consulta") u.consultas++; else u.escritos++;
    u.tokens += tin + tout;
    u.usd += usd;
    usuarios.set(f.user_id, u);
  };
  consultas.forEach((f) => sumar(f, "consulta"));
  escritos.forEach((f) => sumar(f, "escrito"));
  r.porUsuario = [...usuarios.values()].sort((a, b) => b.usd - a.usd || b.tokens - a.tokens);
  return r;
}

const CAMPOS = "user_id, modelo_usado, tokens_input, tokens_output, created_at";

/** Consumo desde una fecha (requiere service role: lee el uso de todos los usuarios). */
export async function consumoDesde(admin: SupabaseClient, desdeISO: string, hastaISO?: string): Promise<ResumenConsumo> {
  const rango = <T extends { gte: (c: string, v: string) => T; lt: (c: string, v: string) => T }>(q: T) =>
    hastaISO ? q.gte("created_at", desdeISO).lt("created_at", hastaISO) : q.gte("created_at", desdeISO);
  const [c, e] = await Promise.all([
    rango(admin.from("consultas_ia").select(CAMPOS)).limit(10000),
    rango(admin.from("escritos").select(CAMPOS)).limit(10000),
  ]);
  return resumir((c.data ?? []) as FilaUso[], (e.data ?? []) as FilaUso[]);
}
