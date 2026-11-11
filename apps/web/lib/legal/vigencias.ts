/**
 * Vigilancia de datos que se vencen solos. El diferencial del producto es
 * estar al día: este registro dice qué dato legal cargado a mano está por
 * quedar viejo, para avisar ANTES de que un abogado lo use desactualizado.
 * Lo consume el cron diario (aviso semanal por email al administrador).
 */
import { UMA_VALORES } from "./honorarios";
import { PISOS_SRT } from "./art";
import { FERIADOS_ESPECIFICOS, FERIA_JUDICIAL, PUENTES_TURISTICOS } from "./plazos";

export type EstadoVigencia = "ok" | "por_vencer" | "vencido";

export interface ChequeoVigencia {
  id: string;
  nombre: string;
  estado: EstadoVigencia;
  detalle: string;
  fuente: string;
}

/** Hitos normativos con fecha cierta: al llegar, hay que revisar textos y cálculos. */
export const HITOS_NORMATIVOS: { fecha: string; nombre: string; accion: string; fuente: string }[] = [
  {
    fecha: "2026-12-01",
    nombre: "Entrada en vigencia del Fondo de Asistencia Laboral (decreto 1228/2026)",
    accion: "Confirmar que no hubo nueva prórroga y actualizar corpus, prompts y calculadora art. 245.",
    fuente: "https://www.boletinoficial.gob.ar/",
  },
  {
    fecha: "2027-01-01",
    nombre: "Derogaciones diferidas de la ley 27.802 (estatutos especiales)",
    accion: "Marcar como derogadas en el corpus las normas con eficacia diferida al 01/01/2027.",
    fuente: "https://www.argentina.gob.ar/normativa",
  },
];

const MS_DIA = 24 * 60 * 60 * 1000;
const dias = (a: string, b: string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / MS_DIA);
const tieneAnio = (set: Set<string>, anio: number) => [...set].some((f) => f.startsWith(`${anio}-`));

export function revisarVigencias(hoy: Date = new Date()): ChequeoVigencia[] {
  const hoyISO = hoy.toISOString().slice(0, 10);
  const anio = hoy.getUTCFullYear();
  const mes = hoy.getUTCMonth() + 1;
  const out: ChequeoVigencia[] = [];

  // UMA: la CSJN publica con unos dos meses de atraso y vigencia retroactiva.
  const uma = UMA_VALORES[UMA_VALORES.length - 1];
  const atrasoUma = dias(uma.desde, hoyISO);
  out.push({
    id: "uma",
    nombre: "Valor de la UMA (ley 27.423)",
    estado: atrasoUma > 130 ? "vencido" : atrasoUma > 100 ? "por_vencer" : "ok",
    detalle: `Último valor cargado: vigencia ${uma.desde} (${uma.resolucion}), hace ${atrasoUma} días.`,
    fuente: "https://www.cpacf.org.ar/",
  });

  // Pisos SRT (ley 26.773): resolución semestral.
  const pisos = [...PISOS_SRT].sort((a, b) => a.vigencia_hasta.localeCompare(b.vigencia_hasta)).at(-1);
  if (pisos) {
    const faltan = dias(hoyISO, pisos.vigencia_hasta);
    out.push({
      id: "pisos_srt",
      nombre: "Pisos indemnizatorios SRT (ART)",
      estado: faltan < 0 ? "vencido" : faltan <= 30 ? "por_vencer" : "ok",
      detalle: faltan < 0 ? `Vencieron el ${pisos.vigencia_hasta}.` : `Vigentes hasta el ${pisos.vigencia_hasta} (faltan ${faltan} días).`,
      fuente: "https://www.boletinoficial.gob.ar/",
    });
  }

  // Feriados: desde noviembre hay que tener cargado el año siguiente.
  const anioFeriados = mes >= 11 ? anio + 1 : anio;
  out.push({
    id: "feriados",
    nombre: `Feriados ${anioFeriados}`,
    estado: tieneAnio(FERIADOS_ESPECIFICOS, anioFeriados) ? "ok" : "vencido",
    detalle: tieneAnio(FERIADOS_ESPECIFICOS, anioFeriados) ? "Cargados." : "Faltan Carnaval, Viernes Santo y trasladables.",
    fuente: "https://www.argentina.gob.ar/interior/feriados-nacionales",
  });
  out.push({
    id: "puentes",
    nombre: `Días no laborables con fines turísticos ${anio}`,
    estado: tieneAnio(PUENTES_TURISTICOS, anio) ? "ok" : "por_vencer",
    detalle: tieneAnio(PUENTES_TURISTICOS, anio) ? "Cargados." : "Sin cargar: verificar el decreto anual.",
    fuente: "https://www.boletinoficial.gob.ar/",
  });

  // Feria de invierno: la acordada de la CSJN sale hacia junio.
  const hayFeria = Boolean(FERIA_JUDICIAL[anio]);
  out.push({
    id: "feria",
    nombre: `Feria judicial de invierno ${anio}`,
    estado: hayFeria ? "ok" : mes >= 7 ? "vencido" : mes >= 6 ? "por_vencer" : "ok",
    detalle: hayFeria ? "Cargada." : "Sin cargar: se aplica solo la feria de enero y se advierte al usuario.",
    fuente: "https://www.csjn.gov.ar/",
  });

  for (const h of HITOS_NORMATIVOS) {
    const faltan = dias(hoyISO, h.fecha);
    // Se avisa desde 15 días antes y hasta 45 días después del hito.
    if (faltan > 15 || faltan < -45) continue;
    out.push({
      id: `hito_${h.fecha}`,
      nombre: h.nombre,
      estado: faltan <= 0 ? "vencido" : "por_vencer",
      detalle: `${faltan <= 0 ? `Ocurrió el ${h.fecha}` : `Faltan ${faltan} días (${h.fecha})`}. ${h.accion}`,
      fuente: h.fuente,
    });
  }
  return out;
}

export function pendientesDeVigilancia(hoy: Date = new Date()): ChequeoVigencia[] {
  return revisarVigencias(hoy).filter((c) => c.estado !== "ok");
}
