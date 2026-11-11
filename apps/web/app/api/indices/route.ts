import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { calcularCoeficiente, INDICES, type IndiceId } from "@/lib/legal/indices-live";
import { checkIpRateLimit, getClientIp } from "@/lib/rate-limit";
import { calcularCoeficientePasiva } from "@/lib/legal/tasa-pasiva-bcra";

/**
 * GET /api/indices?indice=ipc&desde=2024-01-01&hasta=2026-05-01
 * Devuelve el coeficiente de actualización con datos oficiales (datos.gob.ar)
 * y la fuente + fecha de cada punto, para que la liquidación sea auditable.
 */
export async function GET(request: Request) {
  // Datos públicos (datos.gob.ar): se sirve sin sesión para la calculadora
  // pública, con un límite por IP más estricto para anónimos.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const maxPorMinuto = user ? 30 : 10;

  if (!checkIpRateLimit(getClientIp(request), "indices", maxPorMinuto, 60)) {
    return NextResponse.json({ error: "Demasiadas consultas. Esperá un momento." }, { status: 429 });
  }

  const url = new URL(request.url);
  const indice = url.searchParams.get("indice") as IndiceId | null;
  const desde = url.searchParams.get("desde");
  const hasta = url.searchParams.get("hasta");

  const esPasiva = url.searchParams.get("indice") === "pasiva55";
  if (!esPasiva && (!indice || !Object.hasOwn(INDICES, indice))) {
    return NextResponse.json({ error: "Índice inválido. Opciones: ipc, ripte, cer, uva, pasiva55." }, { status: 400 });
  }
  const reFecha = /^\d{4}-\d{2}(-\d{2})?$/;
  if (!desde || !hasta || !reFecha.test(desde) || !reFecha.test(hasta)) {
    return NextResponse.json({ error: "Fechas inválidas (formato YYYY-MM o YYYY-MM-DD)." }, { status: 400 });
  }

  // Tasa pasiva del art. 55 ley 27.802 (serie diaria del BCRA).
  if (esPasiva) {
    if (desde.length !== 10 || hasta.length !== 10) {
      return NextResponse.json({ error: "La tasa pasiva requiere fechas completas (YYYY-MM-DD)." }, { status: 400 });
    }
    try {
      const r = await calcularCoeficientePasiva(desde, hasta);
      return NextResponse.json({ indice: "pasiva55", nombre: "Tasa pasiva Ley 27.802, art. 55 inc. a)", ...r });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al consultar la serie del BCRA";
      return NextResponse.json({ error: msg }, { status: 502 });
    }
  }
  if (!indice) return NextResponse.json({ error: "Índice inválido." }, { status: 400 });

  // Normalizar YYYY-MM → primer día del mes.
  const d = desde.length === 7 ? `${desde}-01` : desde;
  const h = hasta.length === 7 ? `${hasta}-01` : hasta;

  try {
    const r = await calcularCoeficiente(indice, d, h);
    return NextResponse.json({
      indice: r.indice.id,
      nombre: r.indice.nombre,
      fuente: r.indice.fuente,
      coeficiente: r.coeficiente,
      valor_desde: r.punto_desde.valor,
      fecha_dato_desde: r.punto_desde.fecha,
      valor_hasta: r.punto_hasta.valor,
      fecha_dato_hasta: r.punto_hasta.fecha,
      dato_parcial: r.dato_parcial,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error al consultar la serie oficial";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
