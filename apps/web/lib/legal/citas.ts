/**
 * Verificación de citas legales en escritos generados o editados.
 *
 * DIFERENCIAL DEL PRODUCTO: cada cita de artículo o fallo se contrasta contra
 * el corpus verificado. El abogado ve un semáforo por cita:
 *  - verificada:     el artículo/fallo existe en el corpus y coincide.
 *  - dudosa:         hay una coincidencia parcial (fallo no confirmado, etc.).
 *  - no_verificable: la fuente no está en el corpus — el abogado DEBE revisarla.
 */

import { LEYES, JURISPRUDENCIA, type Ley } from "./corpus";

export type EstadoCita = "verificada" | "dudosa" | "no_verificable";

export interface CitaVerificada {
  /** Texto de la cita tal como aparece en el escrito. */
  cita: string;
  tipo: "articulo" | "fallo";
  estado: EstadoCita;
  /** Explicación breve para el abogado. */
  detalle: string;
  /** Fuente del corpus si se encontró (p. ej. "LCT 20.744 art. 245"). */
  fuente?: string;
  /** Datos para re-verificar contra la base legal completa (legal_knowledge). */
  lookup?: { sources: string[]; articulo: string };
}

/**
 * Nombres de fuente en legal_knowledge para cada ley del corpus. La base
 * incluye textos COMPLETOS (LCT y CCCN íntegros vía InfoLeg) que superan al
 * corpus curado local: si el artículo no está acá, se re-verifica allá.
 */
const DB_SOURCES: Record<string, string[]> = {
  cccn: ["CCCN completo (ley 26.994)", "CCCN 26.994"],
};

function dbSources(ley: Ley): string[] {
  return DB_SOURCES[ley.id] ?? [`${ley.nombre_corto} ${ley.numero}`.trim()];
}

/** Leyes que NO están en el corpus local pero SÍ completas en legal_knowledge. */
const LEYES_SOLO_DB: Array<{ alias: string[]; sources: string[]; nombre: string }> = [
  {
    alias: ["ley 18.345", "ley 18345", "18.345", "lo 18.345", "organizacion y procedimiento de la justicia nacional del trabajo"],
    sources: ["Ley 18.345 (procedimiento laboral CABA)"],
    nombre: "ley 18.345",
  },
];

function buscarLeySoloDB(refLey: string): { sources: string[]; nombre: string } | null {
  const ref = normalizar(refLey);
  for (const l of LEYES_SOLO_DB) {
    if (l.alias.some((a) => contieneToken(ref, normalizar(a)))) return l;
  }
  return null;
}

/** Alias con que los escritos suelen referirse a cada ley del corpus. */
const ALIAS_LEYES: Record<string, string[]> = {
  lct: ["lct", "ley de contrato de trabajo", "ley 20.744", "ley 20744", "20.744"],
  cccn: ["cccn", "codigo civil y comercial", "código civil y comercial", "ccyc", "ley 26.994", "26.994"],
  cpccn: ["cpccn", "codigo procesal civil y comercial", "código procesal civil y comercial", "ley 17.454", "17.454"],
  lrt: ["lrt", "ley de riesgos del trabajo", "ley 24.557", "ley 24557", "24.557"],
  lne: ["lne", "ley nacional de empleo", "ley 24.013", "ley 24013", "24.013"],
  l25323: ["ley 25.323", "ley 25323", "25.323"],
  l25345: ["ley 25.345", "ley 25345", "25.345"],
  l27555: ["ley 27.555", "ley 27555", "27.555", "ley de teletrabajo"],
  l23592: ["ley 23.592", "ley 23592", "23.592", "ley antidiscriminatoria"],
  l26773: ["ley 26.773", "ley 26773", "26.773"],
  cn: ["constitucion nacional", "constitución nacional", "c.n."],
};

function normalizar(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** true si `token` aparece en `ref` como palabra completa (evita falsos positivos con siglas cortas). */
function contieneToken(ref: string, token: string): boolean {
  if (token.length > 5) return ref.includes(token);
  const esc = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`).test(ref);
}

function buscarLey(refLey: string): Ley | null {
  const ref = normalizar(refLey);
  for (const ley of LEYES) {
    const alias = ALIAS_LEYES[ley.id] ?? [];
    if (alias.some((a) => contieneToken(ref, normalizar(a)))) return ley;
    if (contieneToken(ref, normalizar(ley.nombre_corto)) || contieneToken(ref, normalizar(ley.numero))) return ley;
  }
  return null;
}

/**
 * Extrae y verifica citas de artículos con este patrón:
 * "art. 245 LCT", "artículo 245 de la LCT", "arts. 232, 233 y 245 LCT",
 * "art. 1746 CCCN", "art. 2 de la ley 25.323".
 */
function verificarArticulos(texto: string): CitaVerificada[] {
  const resultados: CitaVerificada[] = [];
  const vistos = new Set<string>();

  // Captura "art(s)/artículo(s) <números>" + hasta 60 caracteres de contexto a derecha.
  // El contexto admite "." solo dentro de números (p. ej. "Ley 25.323") para no cortar la oración.
  const re = /art(?:iculo|ículo)?s?\.?\s+((?:\d+\s*(?:bis|ter|quater)?\s*[,y]?\s*)+)((?:\.(?=\d)|[^.\n]){0,80})/gi;
  let m: RegExpExecArray | null;

  while ((m = re.exec(texto)) !== null) {
    const numeros = m[1].match(/\d+\s*(?:bis|ter|quater)?/gi) ?? [];
    const contexto = m[2] ?? "";
    const ley = buscarLey(contexto);

    for (const numRaw of numeros) {
      const numero = numRaw.replace(/\s+/g, " ").trim();
      const key = `${numero}|${ley?.id ?? normalizar(contexto).slice(0, 30)}`;
      if (vistos.has(key)) continue;
      vistos.add(key);

      const citaTexto = `art. ${numero}${ley ? ` ${ley.nombre_corto}` : ` ${contexto.trim().slice(0, 40)}`.trimEnd()}`;

      if (!ley) {
        // ¿Está en la base completa aunque no en el corpus local?
        const soloDb = buscarLeySoloDB(contexto);
        resultados.push({
          cita: soloDb ? `art. ${numero} ${soloDb.nombre}` : citaTexto,
          tipo: "articulo",
          estado: "no_verificable",
          detalle: soloDb
            ? `Verificando contra el texto completo de la ${soloDb.nombre}...`
            : "No se pudo identificar la norma citada dentro del corpus. Verificá número y vigencia antes de presentar.",
          lookup: soloDb ? { sources: soloDb.sources, articulo: numero.toLowerCase() } : undefined,
        });
        continue;
      }

      const articulo = ley.articulos.find(
        (a) => normalizar(a.numero) === normalizar(numero),
      );
      if (articulo) {
        resultados.push({
          cita: citaTexto,
          tipo: "articulo",
          estado: "verificada",
          detalle: `${articulo.titulo} — coincide con el corpus verificado.`,
          fuente: `${ley.nombre_corto} ${ley.numero}, art. ${articulo.numero}`,
        });
      } else {
        resultados.push({
          cita: citaTexto,
          tipo: "articulo",
          estado: "no_verificable",
          detalle: `La ${ley.nombre_corto} está en el corpus pero el art. ${numero} no está cargado. Verificá el texto de la norma antes de presentar.`,
          fuente: `${ley.nombre_corto} ${ley.numero}`,
          lookup: { sources: dbSources(ley), articulo: numero.toLowerCase() },
        });
      }
    }
  }

  return resultados;
}

/**
 * Verifica menciones de fallos contra la jurisprudencia del corpus.
 * Busca patrones "Apellido ... c/ ..." y también nombres de leading cases
 * conocidos ("Vizzoti", "Aquino", etc.).
 */
function verificarFallos(texto: string): CitaVerificada[] {
  const resultados: CitaVerificada[] = [];
  const t = normalizar(texto);

  for (const fallo of JURISPRUDENCIA) {
    // Apellido de la carátula (primera palabra) como marcador del leading case.
    const apellido = normalizar(fallo.caratula.split(/[,\s]/)[0]);
    if (apellido.length < 4) continue;
    if (!t.includes(apellido)) continue;

    resultados.push(
      fallo.verificado
        ? {
            cita: fallo.caratula,
            tipo: "fallo",
            estado: "verificada",
            detalle: `${fallo.tribunal}, ${fallo.fecha} — ${fallo.tema}. Cita confirmada en el corpus.`,
            fuente: `${fallo.tribunal} — ${fallo.caratula}`,
          }
        : {
            cita: fallo.caratula,
            tipo: "fallo",
            estado: "dudosa",
            detalle: "El criterio existe en la biblioteca pero la cita exacta NO está confirmada. Verificá carátula, tribunal y fecha antes de citarlo.",
          },
    );
  }

  // Detección de posibles fallos citados que NO están en el corpus:
  // patrón "Xxxx c/ Yyyy" no coincidente con la jurisprudencia cargada.
  const reCaratula = /["“]?([A-ZÁÉÍÓÚÑ][\wáéíóúñ]+(?:,\s+[A-ZÁÉÍÓÚÑ][\wáéíóúñ.\s]+)?)\s+c\/\s*([A-ZÁÉÍÓÚÑ][^\n"”]{2,60})/g;
  let m: RegExpExecArray | null;
  const yaListados = new Set(resultados.map((r) => normalizar(r.cita.split(/[,\s]/)[0])));
  const detectados = new Set<string>();

  while ((m = reCaratula.exec(texto)) !== null) {
    const actor = normalizar(m[1].split(/[,\s]/)[0]);
    if (yaListados.has(actor) || detectados.has(actor)) continue;
    detectados.add(actor);
    resultados.push({
      cita: `${m[1]} c/ ${m[2].trim().slice(0, 60)}`,
      tipo: "fallo",
      estado: "no_verificable",
      detalle: "Este fallo NO está en el corpus verificado. Confirmá que exista (carátula, tribunal, fecha) antes de presentarlo: las citas inventadas son causal de sanción.",
    });
  }

  return resultados;
}

export interface ResultadoVerificacion {
  citas: CitaVerificada[];
  resumen: { verificadas: number; dudosas: number; no_verificables: number };
}

export function resumirCitas(citas: CitaVerificada[]): ResultadoVerificacion["resumen"] {
  return {
    verificadas: citas.filter((c) => c.estado === "verificada").length,
    dudosas: citas.filter((c) => c.estado === "dudosa").length,
    no_verificables: citas.filter((c) => c.estado === "no_verificable").length,
  };
}

export function verificarCitas(texto: string): ResultadoVerificacion {
  const citas = [...verificarArticulos(texto), ...verificarFallos(texto)];
  return { citas, resumen: resumirCitas(citas) };
}
