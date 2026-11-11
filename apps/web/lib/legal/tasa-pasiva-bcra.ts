/**
 * Serie "Tasa pasiva Ley 27.802, art. 55 inc. a)" del BCRA (variable 1198 de
 * la API de estadísticas monetarias; Res. Directorio 45/26). Es un índice
 * diario: el coeficiente entre dos fechas es índice(hasta) / índice(desde).
 *
 * Server-only. Si la API del BCRA no responde, quien llama debe ofrecer la
 * carga manual del coeficiente (calculadora oficial del BCRA): nunca se
 * inventa un valor.
 */
const VARIABLE_ID = 1198;
const BASES = [
  "https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias",
  "https://api.bcra.gob.ar/estadisticas/v3.0/Monetarias",
];
const REVALIDATE_SECONDS = 60 * 60 * 6;
const MS_DIA = 24 * 60 * 60 * 1000;
export const FUENTE_PASIVA = "BCRA — Tasa pasiva Ley 27.802, art. 55 inc. a) (Res. Directorio 45/26)";
/** La serie arranca el 03/06/1993. */
export const PASIVA_INICIO = "1993-06-03";

interface Punto {
  fecha: string;
  valor: number;
}

/** Acepta las dos formas conocidas de respuesta (v3: results[]; v4: results[].detalle[]). */
export function parsearSerieBcra(json: unknown): Punto[] {
  const out: Punto[] = [];
  const visitar = (nodo: unknown) => {
    if (Array.isArray(nodo)) {
      nodo.forEach(visitar);
      return;
    }
    if (!nodo || typeof nodo !== "object") return;
    const o = nodo as Record<string, unknown>;
    if (typeof o.fecha === "string" && typeof o.valor === "number" && Number.isFinite(o.valor)) {
      out.push({ fecha: o.fecha.slice(0, 10), valor: o.valor });
      return;
    }
    if ("detalle" in o) visitar(o.detalle);
    if ("results" in o) visitar(o.results);
  };
  visitar(json);
  return out.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const sumar = (fecha: string, dias: number) => iso(new Date(new Date(`${fecha}T00:00:00Z`).getTime() + dias * MS_DIA));

async function fetchRango(desde: string, hasta: string): Promise<Punto[]> {
  let ultimoError = "sin respuesta";
  for (const base of BASES) {
    try {
      const res = await fetch(`${base}/${VARIABLE_ID}?desde=${desde}&hasta=${hasta}&limit=100`, {
        next: { revalidate: REVALIDATE_SECONDS },
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        ultimoError = `HTTP ${res.status}`;
        continue;
      }
      const puntos = parsearSerieBcra(await res.json());
      if (puntos.length > 0) return puntos;
      ultimoError = "sin datos en el período";
    } catch (e) {
      ultimoError = e instanceof Error ? e.message : "error de red";
    }
  }
  throw new Error(`La serie de tasa pasiva del BCRA no respondió (${ultimoError}).`);
}

export interface CoeficientePasiva {
  coeficiente: number;
  valor_desde: number;
  fecha_dato_desde: string;
  valor_hasta: number;
  fecha_dato_hasta: string;
  dato_parcial: boolean;
  fuente: string;
}

export async function calcularCoeficientePasiva(desde: string, hasta: string): Promise<CoeficientePasiva> {
  if (desde < PASIVA_INICIO) {
    throw new Error("La serie de tasa pasiva del BCRA empieza el 03/06/1993.");
  }
  if (hasta <= desde) throw new Error("La fecha final debe ser posterior a la inicial.");
  const [ini, fin] = await Promise.all([
    fetchRango(desde, sumar(desde, 10)),
    fetchRango(sumar(hasta, -10), hasta),
  ]);
  const pDesde = ini[0];
  const pHasta = fin[fin.length - 1];
  if (!(pDesde.valor > 0)) throw new Error("Dato inicial inválido en la serie del BCRA.");
  return {
    coeficiente: pHasta.valor / pDesde.valor,
    valor_desde: pDesde.valor,
    fecha_dato_desde: pDesde.fecha,
    valor_hasta: pHasta.valor,
    fecha_dato_hasta: pHasta.fecha,
    dato_parcial: pHasta.fecha < sumar(hasta, -3),
    fuente: FUENTE_PASIVA,
  };
}
