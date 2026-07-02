/**
 * Fuente única de verdad de planes y precios (ARS).
 * Los límites deben coincidir con la función SQL check_and_increment_usage
 * (migración 0010) y con PLAN_LIMITS en types/index.ts.
 */

export type PlanId = "free" | "profesional" | "estudio";

export interface PlanDef {
  id: PlanId;
  name: string;
  /** Precio mensual en ARS (0 = gratis). */
  priceARS: number;
  /** null = ilimitado */
  escritosMes: number | null;
  consultasMes: number | null;
  maxUsuarios: number;
  features: string[];
  /** Solo los planes pagos se pueden contratar por checkout. */
  checkout: boolean;
}

export const PLANS: Record<PlanId, PlanDef> = {
  free: {
    id: "free",
    name: "Gratis",
    priceARS: 0,
    escritosMes: 3,
    consultasMes: 20,
    maxUsuarios: 1,
    features: [
      "Plan gratis permanente (sin tarjeta)",
      "3 escritos por mes con verificación de citas",
      "20 consultas IA",
      "Calculadoras legales ilimitadas",
      "Anexo de liquidación auditable",
      "Exportar a Word y PDF",
    ],
    checkout: false,
  },
  profesional: {
    id: "profesional",
    name: "Profesional",
    priceARS: 15000,
    escritosMes: 30,
    consultasMes: null,
    maxUsuarios: 1,
    features: [
      "30 escritos por mes con verificación de citas",
      "Consultas IA ilimitadas",
      "Estilo de redacción personalizado",
      "Agenda de vencimientos con alertas",
      "Calculadoras + anexo auditable",
      "Historial de escritos",
      "Soporte prioritario",
    ],
    checkout: true,
  },
  estudio: {
    id: "estudio",
    name: "Estudio",
    priceARS: 30000,
    escritosMes: null,
    consultasMes: null,
    maxUsuarios: 5,
    features: [
      "Escritos ilimitados",
      "Hasta 5 usuarios del estudio",
      "Mini CRM de casos compartidos",
      "Estilo de redacción personalizado",
      "Exportación masiva",
      "Soporte dedicado",
    ],
    checkout: true,
  },
};

export function getPlan(id: string | null | undefined): PlanDef {
  if (id && id in PLANS) return PLANS[id as PlanId];
  return PLANS.free;
}

/** Precio anual: 10 meses (2 meses gratis respecto del mensual). */
export function precioAnual(plan: PlanDef): number {
  return plan.priceARS * 10;
}

export type CicloFacturacion = "mensual" | "anual";

export function isPaidPlan(id: string | null | undefined): boolean {
  return getPlan(id).priceARS > 0;
}

export function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
