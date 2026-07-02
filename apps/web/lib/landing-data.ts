import { FileText, MessageSquare, Calculator } from "lucide-react";
import type { ElementType } from "react";

/**
 * Datos de la landing.
 *
 * IMPORTANTE (cumplimiento — Ley 24.240 de Defensa del Consumidor):
 * No incluir testimonios, métricas ni resultados que no sean reales y
 * verificables. Agregar testimonios SOLO con consentimiento expreso del
 * profesional y datos reales. Las métricas deben reflejar valores efectivos
 * del producto (no proyecciones presentadas como hechos).
 */

export interface Feature {
  icon: ElementType;
  bg: string;
  iconColor: string;
  title: string;
  description: string;
  tag: "Disponible" | "Próximamente";
}

export interface Testimonial {
  name: string;
  role: string;
  initials: string;
  color: string;
  quote: string;
  stars: number;
  consentVerified: boolean; // solo true si el profesional dio consentimiento expreso
}

export interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted: boolean;
}

export const FEATURES: Feature[] = [
  {
    icon: FileText,
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Generador de escritos",
    description:
      "Demandas laborales, cartas documento, contestaciones y recursos. Formato procesal argentino por jurisdicción — CABA, PBA y nacional. Cada cita legal se contrasta contra el corpus verificado.",
    tag: "Disponible",
  },
  {
    icon: MessageSquare,
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Asistente legal IA",
    description:
      "Consultá sobre la LCT, CCCN, CPCCN y más. Las respuestas citan los artículos para que puedas verificarlos antes de usarlos.",
    tag: "Disponible",
  },
  {
    icon: Calculator,
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "Calculadoras legales",
    description:
      "Indemnización por despido (art. 245 LCT), Ley 25.323, intereses y actualización. Verificá cada rubro antes de presentar.",
    tag: "Disponible",
  },
];

/**
 * Sin testimonios hasta tener casos reales con consentimiento.
 * Reemplazar por testimonios verificados (consentVerified: true) en lanzamiento.
 */
export const TESTIMONIALS: Testimonial[] = [];

export const PLANS: Plan[] = [
  {
    name: "Gratis",
    price: "$0",
    period: "/mes · para siempre",
    description: "Sin tarjeta ni vencimiento",
    features: [
      "3 escritos por mes con citas verificadas",
      "20 consultas al asistente IA",
      "Calculadoras legales ilimitadas",
      "Anexo de liquidación auditable",
      "Exportar a Word y PDF",
    ],
    cta: "Empezar gratis",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Profesional",
    price: "$15.000",
    period: "/mes",
    description: "Para el abogado independiente",
    features: [
      "30 escritos por mes con citas verificadas",
      "Consultas IA ilimitadas",
      "Estilo de redacción personalizado",
      "Agenda de vencimientos con alertas",
      "Historial y soporte prioritario",
    ],
    cta: "Elegir Profesional",
    href: "/register?plan=profesional",
    highlighted: true,
  },
  {
    name: "Estudio",
    price: "$30.000",
    period: "/mes",
    description: "Para estudios de hasta 5 personas",
    features: [
      "Escritos ilimitados",
      "Hasta 5 usuarios",
      "Mini CRM de casos compartidos",
      "Exportación masiva",
      "Soporte dedicado",
    ],
    cta: "Contactar ventas",
    href: "/register?plan=estudio",
    highlighted: false,
  },
];

export const TRUST_INDICATORS = [
  { text: "Datos cifrados en reposo" },
  { text: "Citas verificadas contra el corpus legal" },
  { text: "Liquidaciones auditables rubro por rubro" },
  { text: "Vos revisás antes de presentar" },
] as const;

/**
 * Propuestas de valor honestas (no métricas inventadas). Si en el futuro se
 * muestran números reales (escritos generados, usuarios), deben provenir de la
 * base de datos, no de constantes.
 */
export const VALUE_PROPS = [
  { value: "Art. 245", label: "liquidación laboral calculada al detalle" },
  { value: "CABA · PBA", label: "formato procesal por jurisdicción" },
  { value: "Con citas", label: "artículos de ley que podés verificar" },
  { value: "DOCX", label: "exportás listo para presentar" },
] as const;

export const LEGAL_TAGS = [
  "LCT 20.744",
  "CCCN",
  "CPCCN",
  "Ley 24.557",
  "Ley 25.323",
  "Fallos CSJN",
] as const;
