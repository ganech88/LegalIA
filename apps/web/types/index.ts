export type Plan = "free" | "profesional" | "estudio";
export type Fuero = "laboral" | "civil" | "comercial" | "penal" | "familia";
export type Jurisdiccion = "CABA" | "PBA" | "nacional";
export type Especialidad = "laboral" | "civil" | "comercial" | "penal" | "familia" | "administrativo" | "tributario";

export interface Profile {
  id: string;
  full_name: string;
  matricula: string | null;
  colegio_abogados: string | null;
  especialidad: Especialidad[];
  jurisdiccion_principal: Jurisdiccion | null;
  estudio_nombre: string | null;
  plan: Plan;
  escritos_generados_mes: number;
  consultas_ia_mes: number;
  usage_period_start: string;
  created_at: string;
  updated_at: string;
}

export interface EscritoTemplate {
  id: string;
  tipo: string;
  subtipo: string | null;
  nombre_display: string;
  fuero: Fuero;
  jurisdiccion: Jurisdiccion[];
  campos_requeridos: {
    fields: FormField[];
  };
  template_prompt: string;
  template_estructura: string;
  activo: boolean;
  created_at: string;
}

export interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "number" | "select" | "multiselect";
  required: boolean;
  options?: string[];
}

export interface Escrito {
  id: string;
  user_id: string;
  template_id: string;
  tipo: string;
  titulo: string;
  datos_caso: Record<string, unknown>;
  contenido_generado: string;
  contenido_editado: string | null;
  jurisdiccion: string;
  fuero: string;
  tokens_input: number | null;
  tokens_output: number | null;
  modelo_usado: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConsultaIA {
  id: string;
  user_id: string;
  pregunta: string;
  respuesta: string;
  fuentes_citadas: { source_name: string; article: string; relevance_score: number }[] | null;
  tokens_input: number | null;
  tokens_output: number | null;
  modelo_usado: string | null;
  feedback: "util" | "no_util" | null;
  created_at: string;
}

export const PLAN_LIMITS = {
  free: { escritos_mes: 3, consultas_mes: 20 },
  profesional: { escritos_mes: 30, consultas_mes: Infinity },
  estudio: { escritos_mes: Infinity, consultas_mes: Infinity },
} as const;

export const COLEGIOS_ABOGADOS = [
  "CPACF (CABA)",
  "CASI (San Isidro)",
  "CALM (La Matanza)",
  "CALZ (Lomas de Zamora)",
  "CAMP (Mar del Plata)",
  "CAMo (Morón)",
  "Otro",
] as const;

export const ESPECIALIDADES: { value: Especialidad; label: string }[] = [
  { value: "laboral", label: "Derecho Laboral" },
  { value: "civil", label: "Derecho Civil" },
  { value: "comercial", label: "Derecho Comercial" },
  { value: "penal", label: "Derecho Penal" },
  { value: "familia", label: "Derecho de Familia" },
  { value: "administrativo", label: "Derecho Administrativo" },
  { value: "tributario", label: "Derecho Tributario" },
];

export const JURISDICCIONES: { value: Jurisdiccion; label: string }[] = [
  { value: "CABA", label: "Ciudad Autónoma de Buenos Aires" },
  { value: "PBA", label: "Provincia de Buenos Aires" },
  { value: "nacional", label: "Justicia Nacional / Federal" },
];
