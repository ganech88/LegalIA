import { FileText, MessageSquare, Calculator, CheckCircle2 } from "lucide-react";
import type { ElementType } from "react";

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
      "Demandas laborales, cartas documento, contestaciones y recursos. Formato procesal argentino correcto por jurisdicción — CABA, PBA y nacional.",
    tag: "Disponible",
  },
  {
    icon: MessageSquare,
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Asistente legal IA",
    description:
      "Consultá sobre la LCT, CCCN, CPCCN y más. Respuestas con citas de artículos reales. Sin alucinaciones, con fuentes verificables.",
    tag: "Disponible",
  },
  {
    icon: Calculator,
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "Calculadoras legales",
    description:
      "Indemnización por despido, intereses CNAT, actualización por RIPTE/IPC. Tasas actualizadas automáticamente.",
    tag: "Próximamente",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Dra. Claudia Rissotto",
    role: "Abogada laboralista — CPACF",
    initials: "CR",
    color: "bg-indigo-600",
    quote:
      "Reduzco el tiempo de preparación de demandas un 70%. Lo que antes me llevaba 3 horas, ahora lo tengo en 20 minutos. Sigo siendo yo quien revisa, pero la base es impecable.",
    stars: 5,
  },
  {
    name: "Dr. Martín Alderete",
    role: "Estudio Alderete & Asociados — La Plata",
    initials: "MA",
    color: "bg-amber-600",
    quote:
      "Las citas de artículos son exactas. Por primera vez confío en una herramienta de IA para mis escritos civiles. Le recomiendo LegalIA a todos mis colegas del Colegio.",
    stars: 5,
  },
  {
    name: "Dra. Florencia Paz",
    role: "Abogada civilista — CASI",
    initials: "FP",
    color: "bg-teal-600",
    quote:
      "La interfaz es clara y el asistente entiende los matices del derecho argentino. No es ChatGPT con un prompt legal — es otra categoría.",
    stars: 5,
  },
];

export const PLANS: Plan[] = [
  {
    name: "Gratis",
    price: "$0",
    period: "/mes",
    description: "Para conocer la plataforma",
    features: [
      "3 escritos por mes",
      "20 consultas al asistente IA",
      "Exportar a Word",
      "Soporte por email",
    ],
    cta: "Empezar gratis",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Profesional",
    price: "$12.000",
    period: "/mes",
    description: "Para el abogado independiente",
    features: [
      "30 escritos por mes",
      "Consultas IA ilimitadas",
      "Calculadoras legales",
      "Historial de escritos",
      "Soporte prioritario",
    ],
    cta: "Elegir Profesional",
    href: "/register?plan=profesional",
    highlighted: true,
  },
  {
    name: "Estudio",
    price: "$25.000",
    period: "/mes",
    description: "Para estudios de hasta 5 personas",
    features: [
      "Escritos ilimitados",
      "Hasta 5 usuarios",
      "Mini CRM de casos",
      "Exportación masiva",
      "Soporte dedicado",
    ],
    cta: "Contactar ventas",
    href: "/register?plan=estudio",
    highlighted: false,
  },
];

export const TRUST_INDICATORS = [
  { text: "Datos encriptados" },
  { text: "Escrito en 30 segundos" },
  { text: "Artículos verificados" },
] as const;

export const STATS = [
  { value: "+2.400", label: "escritos generados" },
  { value: "98%",    label: "precisión en citas legales" },
  { value: "30 seg", label: "tiempo promedio por escrito" },
  { value: "5 fueros", label: "jurisdicciones cubiertas" },
] as const;

export const LEGAL_TAGS = [
  "LCT 20.744",
  "CCCN",
  "CPCCN",
  "CPLCABA",
  "Ley 24.557",
  "Fallos CSJN",
] as const;

export const STORY_STATS = [
  { label: "Precisión en citas",  value: "98%",  colorClass: "border-l-blue-500" },
  { label: "Fuentes cubiertas",   value: "12+",  colorClass: "border-l-amber-500" },
  { label: "Abogados activos",    value: "240+", colorClass: "border-l-emerald-500" },
  { label: "Escritos generados",  value: "2.4K", colorClass: "border-l-violet-500" },
] as const;
