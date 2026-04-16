# LegalIA — Asistente IA y Generador de Escritos para Abogados Argentinos

## Visión del Producto

SaaS web que profesionaliza el uso de IA para abogados argentinos. Dos productos core: (1) un generador de escritos judiciales que produce borradores listos para presentar, y (2) un asistente IA especializado en legislación argentina que cita artículos y jurisprudencia real. A diferencia de ChatGPT genérico, LegalIA conoce el derecho argentino, las jurisdicciones, los fueros, y el formato procesal correcto.

**Target:** +150,000 abogados matriculados en Argentina. Foco inicial: abogados laboralistas y civilistas independientes o estudios chicos (1-5 personas).

**Modelo de negocio:** Suscripción mensual $8,000 - $20,000 ARS/mes según plan. Costo de IA por escrito: ~$0.03 USD (despreciable).

---

## Stack Tecnológico

- **Frontend:** Next.js 15+ (App Router) + TypeScript + Tailwind CSS
- **Backend/DB:** Supabase (Auth, Database, Edge Functions, Storage, pgvector)
- **Hosting:** Vercel
- **IA:** Anthropic API (Haiku 4.5 para consultas rápidas, Sonnet 4.6 para escritos complejos)
- **Embeddings:** OpenAI text-embedding-3-small (para RAG de legislación)
- **Pagos:** Mercado Pago (suscripciones) + Stripe (para clientes internacionales futuro)
- **Email:** Resend
- **Monitoreo:** Sentry

---

## Arquitectura

### RAG (Retrieval Augmented Generation) para conocimiento legal

```
[Base de conocimiento legal]
        │
        ├── Código Civil y Comercial de la Nación
        ├── Ley de Contrato de Trabajo (LCT 20.744)
        ├── Ley de Riesgos del Trabajo (24.557)
        ├── Código Procesal Civil y Comercial (CPCCN)
        ├── Código Procesal Laboral (CABA y PBA)
        ├── Jurisprudencia clave (fallos CSJN, CNAT, SCBA)
        ├── Resoluciones ARCA/AFIP relevantes
        └── Convenios Colectivos de Trabajo principales
        │
        ▼
[Embeddings → pgvector en Supabase]
        │
        ▼
[Usuario hace consulta] → [Búsqueda semántica] → [Contexto relevante] → [LLM genera respuesta con citas]
```

### Flujo del Generador de Escritos

```
[Abogado selecciona tipo de escrito]
        │
        ▼
[Formulario dinámico según tipo]
  - Datos del caso
  - Partes (actor/demandado)
  - Jurisdicción y fuero
  - Hechos relevantes
  - Pretensión
        │
        ▼
[Template del escrito + datos + contexto legal vía RAG]
        │
        ▼
[LLM genera borrador]
        │
        ▼
[Editor en pantalla para ajustes]
        │
        ▼
[Exportar a DOCX / copiar al portapapeles]
```

---

## Arquitectura de Base de Datos (Supabase)

### Tablas principales

```sql
-- Extensión para embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Perfiles de abogados
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  matricula TEXT,
  colegio_abogados TEXT, -- CPACF, CASI, CALM, etc.
  especialidad TEXT[], -- ['laboral', 'civil', 'comercial', 'penal', 'familia']
  jurisdiccion_principal TEXT, -- 'CABA', 'PBA', 'nacional', etc.
  estudio_nombre TEXT,
  plan TEXT DEFAULT 'free', -- free, profesional, estudio
  escritos_generados_mes INT DEFAULT 0,
  consultas_ia_mes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Base de conocimiento legal (chunks para RAG)
CREATE TABLE legal_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL, -- 'ley', 'codigo', 'jurisprudencia', 'doctrina', 'cct'
  source_name TEXT NOT NULL, -- 'LCT 20.744', 'CCCN', 'Fallo Vizzoti c/ AMSA'
  article_number TEXT, -- '245', '232', etc.
  title TEXT,
  content TEXT NOT NULL,
  jurisdiction TEXT, -- 'nacional', 'CABA', 'PBA', etc.
  area_derecho TEXT[], -- ['laboral', 'civil']
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para búsqueda semántica
CREATE INDEX ON legal_knowledge USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Templates de escritos
CREATE TABLE escrito_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL, -- 'demanda_laboral', 'contestacion', 'recurso_apelacion', 'carta_documento', etc.
  subtipo TEXT, -- 'despido_sin_causa', 'despido_con_causa', 'accidente_trabajo', etc.
  nombre_display TEXT NOT NULL, -- 'Demanda por despido sin causa'
  fuero TEXT NOT NULL, -- 'laboral', 'civil', 'comercial', 'familia'
  jurisdiccion TEXT[], -- ['CABA', 'PBA', 'nacional']
  campos_requeridos JSONB NOT NULL, -- Schema del formulario dinámico
  template_prompt TEXT NOT NULL, -- System prompt para el LLM
  template_estructura TEXT NOT NULL, -- Estructura base del escrito
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Escritos generados por usuarios
CREATE TABLE escritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES escrito_templates(id),
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  datos_caso JSONB NOT NULL, -- Datos ingresados en el formulario
  contenido_generado TEXT NOT NULL, -- Output del LLM
  contenido_editado TEXT, -- Versión editada por el abogado
  jurisdiccion TEXT NOT NULL,
  fuero TEXT NOT NULL,
  tokens_input INT,
  tokens_output INT,
  modelo_usado TEXT, -- 'haiku-4.5', 'sonnet-4.6'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Historial de consultas al asistente IA
CREATE TABLE consultas_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pregunta TEXT NOT NULL,
  respuesta TEXT NOT NULL,
  fuentes_citadas JSONB, -- Array de {source_name, article, relevance_score}
  tokens_input INT,
  tokens_output INT,
  modelo_usado TEXT,
  feedback TEXT, -- 'util', 'no_util', null
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Casos/Expedientes del abogado (mini CRM)
CREATE TABLE casos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  caratula TEXT NOT NULL, -- 'García, Juan c/ ACME SA s/ despido'
  expediente TEXT, -- número de expediente
  fuero TEXT NOT NULL,
  jurisdiccion TEXT NOT NULL,
  juzgado TEXT,
  estado TEXT DEFAULT 'activo', -- activo, archivado, finalizado
  cliente_nombre TEXT,
  contraparte_nombre TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Row Level Security

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE escritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE casos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own data only" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Own escritos only" ON escritos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own consultas only" ON consultas_ia FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own casos only" ON casos FOR ALL USING (auth.uid() = user_id);

-- Knowledge base es pública para lectura
ALTER TABLE legal_knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON legal_knowledge FOR SELECT USING (true);

ALTER TABLE escrito_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read templates" ON escrito_templates FOR SELECT USING (activo = true);
```

### Función de búsqueda semántica

```sql
CREATE OR REPLACE FUNCTION search_legal_knowledge(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_area TEXT DEFAULT NULL,
  filter_jurisdiccion TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  source_type TEXT,
  source_name TEXT,
  article_number TEXT,
  title TEXT,
  content TEXT,
  jurisdiction TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    lk.id,
    lk.source_type,
    lk.source_name,
    lk.article_number,
    lk.title,
    lk.content,
    lk.jurisdiction,
    1 - (lk.embedding <=> query_embedding) AS similarity
  FROM legal_knowledge lk
  WHERE 1 - (lk.embedding <=> query_embedding) > match_threshold
    AND (filter_area IS NULL OR filter_area = ANY(lk.area_derecho))
    AND (filter_jurisdiccion IS NULL OR lk.jurisdiction = filter_jurisdiccion OR lk.jurisdiction = 'nacional')
  ORDER BY lk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## Funcionalidades por Fase

### MVP (Fase 1 — 6-8 semanas)

1. **Auth y onboarding**
   - Registro con email
   - Wizard: especialidad, jurisdicción principal, matrícula
   - Tour rápido de funcionalidades

2. **Generador de escritos — 5 tipos iniciales**
   - Demanda laboral por despido sin causa (CABA y PBA)
   - Carta documento por intimación de pago
   - Carta documento por despido indirecto
   - Contestación de demanda laboral
   - Recurso de apelación genérico
   - Cada uno con formulario específico y template optimizado

3. **Editor de escritos**
   - Vista del borrador generado con formato legal
   - Edición inline
   - Exportar a DOCX (formato tribunales)
   - Copiar al portapapeles
   - Historial de escritos generados

4. **Asistente IA básico (sin RAG completo)**
   - Chat con Haiku 4.5 con system prompt legal argentino
   - Conocimiento base de LCT, CCCN, CPCCN
   - Respuestas citando artículos (desde el system prompt, no RAG aún)
   - Límite: 20 consultas/mes en plan free

### Fase 2 (semanas 9-14)

5. **RAG completo**
   - Ingestión de leyes completas con embeddings
   - Búsqueda semántica en pgvector
   - Respuestas con citas verificables de artículos y fallos
   - Indicador de confianza en cada respuesta

6. **Más tipos de escritos**
   - Demanda por accidente de trabajo
   - Demanda civil por daños y perjuicios
   - Recurso extraordinario
   - Mediación: solicitud y acta
   - Escritos de familia: alimentos, régimen de visitas

7. **Calculadoras integradas**
   - Indemnización por despido (art. 245 LCT)
   - Indemnización por ART (Ley 24.557)
   - Intereses (tasa activa BNA, tasa CNAT)
   - Actualización por IPC / RIPTE / CER

8. **Monetización**
   - Free: 3 escritos/mes + 20 consultas IA/mes
   - Profesional ($12,000/mes): 30 escritos + consultas ilimitadas + calculadoras
   - Estudio ($25,000/mes): ilimitado + 5 usuarios + casos/CRM + exportación masiva

### Fase 3 (post-lanzamiento)

9. **Mini CRM de casos**
   - Gestión de expedientes básica
   - Vincular escritos generados a casos
   - Timeline del caso
   - Recordatorios de vencimientos procesales

10. **Jurisprudencia actualizada**
    - Scraping periódico de fallos de CSJN, CNAT, SCBA
    - Actualización automática de la base RAG
    - Newsletter semanal con fallos relevantes

11. **Personalización**
    - El sistema aprende el estilo de redacción del abogado
    - Templates personalizados por usuario
    - Firma y datos del estudio en todos los escritos

---

## Estructura del Proyecto

```
apps/
└── web/                    # Next.js App Router
    ├── app/
    │   ├── (auth)/         # Login, Register, Onboarding
    │   ├── (dashboard)/    # Layout autenticado
    │   │   ├── escritos/   # Generador + historial
    │   │   ├── asistente/  # Chat IA
    │   │   ├── casos/      # Mini CRM
    │   │   ├── calculadoras/ # Herramientas de cálculo
    │   │   └── config/     # Configuración y planes
    │   ├── api/
    │   │   ├── generate-escrito/  # POST: genera escrito con LLM
    │   │   ├── chat/              # POST: consulta al asistente
    │   │   ├── search-legal/      # POST: búsqueda semántica
    │   │   └── webhooks/          # Mercado Pago webhooks
    │   └── layout.tsx
    ├── components/
    │   ├── ui/             # Componentes base
    │   ├── escritos/       # Formularios dinámicos, editor, preview
    │   ├── chat/           # Interfaz de chat, mensajes, fuentes
    │   ├── calculadoras/   # UI de calculadoras
    │   └── casos/          # Gestión de casos
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts
    │   │   ├── server.ts
    │   │   └── middleware.ts
    │   ├── ai/
    │   │   ├── anthropic.ts      # Cliente Anthropic
    │   │   ├── embeddings.ts     # Generación de embeddings
    │   │   ├── prompts/          # System prompts por tipo de escrito
    │   │   │   ├── demanda-laboral.ts
    │   │   │   ├── carta-documento.ts
    │   │   │   ├── contestacion.ts
    │   │   │   └── base-legal.ts  # System prompt base para asistente
    │   │   └── rag.ts            # Lógica de RAG
    │   ├── legal/
    │   │   ├── calculadoras.ts   # Lógica de cálculos legales
    │   │   ├── indemnizacion.ts  # Cálculo art. 245 y relacionados
    │   │   ├── intereses.ts      # Tasas de interés
    │   │   └── indices.ts        # IPC, RIPTE, CER
    │   └── utils/
    │       ├── formatters.ts     # Moneda ARS, CUIT, fechas
    │       └── docx-export.ts    # Generación de DOCX
    └── types/
        └── index.ts

packages/
├── db/                     # Drizzle ORM schemas (o SQL migrations)
└── shared/                 # Types compartidos

supabase/
├── migrations/
├── functions/
│   ├── generate-embedding/   # Genera embedding para nuevo contenido legal
│   ├── check-usage-limits/   # Verifica límites del plan
│   └── update-indices/       # Actualiza IPC/RIPTE/CER periódicamente
└── config.toml

scripts/
├── ingest-laws/            # Script para ingestar leyes y generar embeddings
├── ingest-jurisprudencia/  # Script para ingestar fallos
└── seed-templates/         # Seed de templates de escritos
```

---

## System Prompts (ejemplos)

### Asistente IA — Base

```
Sos un asistente legal especializado en derecho argentino. Tu rol es ayudar a abogados matriculados con consultas sobre legislación, jurisprudencia y doctrina argentina.

Reglas estrictas:
- Siempre citá el artículo exacto de la ley cuando respondas
- Si no estás seguro de un dato, decilo explícitamente
- Nunca inventes jurisprudencia ni fallos
- Distinguí entre jurisdicción nacional, CABA, y provincia de Buenos Aires
- Usá lenguaje técnico-jurídico argentino
- Si la consulta es sobre un tema que cambió recientemente, avisá que el abogado debe verificar la vigencia

Contexto legal relevante (del RAG):
{contexto_rag}

Consulta del abogado: {pregunta}
```

### Generador — Demanda laboral por despido sin causa

```
Generá un escrito de demanda laboral por despido sin causa para ser presentado ante {jurisdiccion}.

Formato del escrito:
1. Encabezado (Objeto, datos del juzgado)
2. Personería (datos del actor y letrado)
3. Hechos
4. Derecho (citar arts. 232, 233, 245, 246 LCT y aplicables)
5. Liquidación (detallar cada rubro)
6. Prueba (documental, testimonial, pericial, informativa)
7. Reserva caso federal
8. Petitorio

Datos del caso:
- Actor: {actor_nombre}, DNI {actor_dni}, domicilio {actor_domicilio}
- Demandado: {demandado_nombre}, CUIT {demandado_cuit}
- Fecha de ingreso: {fecha_ingreso}
- Fecha de despido: {fecha_despido}
- Mejor remuneración: {mejor_remuneracion}
- Categoría/CCT: {categoria}
- Hechos relevantes: {hechos}

Generá el escrito completo, formal, listo para presentar. Usá el estilo procesal argentino.
```

---

## Reglas de Desarrollo

### Generales
- **Idioma del código:** inglés
- **Idioma de UI:** español argentino formal (usted para escritos, vos para UI)
- **Commits:** conventional commits en inglés
- **Testing:** Vitest + Playwright para E2E
- **No console.log en producción**
- **Archivos:** 200-400 líneas máximo
- **Server Components por defecto** (Next.js App Router)

### IA y LLM
- **Modelo por defecto:** Haiku 4.5 para consultas rápidas del asistente
- **Modelo para escritos:** Sonnet 4.6 (mejor calidad de redacción)
- **Streaming:** siempre que sea posible para UX responsiva
- **Temperatura:** 0.3 para escritos (consistencia), 0.5 para asistente (creatividad moderada)
- **Max tokens output:** 4096 para escritos, 2048 para consultas
- **Prompt caching:** activado para system prompts (ahorro del 90%)
- **Logging:** guardar tokens usados por request para tracking de costos

### Seguridad
- RLS en todas las tablas
- API routes protegidas con Supabase Auth middleware
- Rate limiting: 10 requests/minuto para generación de escritos
- No almacenar API keys de usuario
- Datos de casos encriptados en reposo (Supabase lo hace por defecto)

### Legal / Compliance
- Disclaimer visible: "LegalIA es una herramienta de asistencia. El abogado es responsable de revisar todo contenido generado antes de su presentación."
- No ofrecer asesoramiento legal a no-abogados
- Cumplir Ley 25.326 de Protección de Datos Personales
- Términos y condiciones específicos para uso profesional

---

## Variables de Entorno (.env.example)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxx

# OpenAI (solo para embeddings)
OPENAI_API_KEY=sk-xxx

# Mercado Pago
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-xxx
MP_ACCESS_TOKEN=APP_USR-xxx

# Resend
RESEND_API_KEY=re_xxx

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## Costos Estimados

| Servicio | Costo/mes |
|----------|-----------|
| Vercel Pro | $20 USD |
| Supabase Pro | $25 USD |
| Anthropic API (1,000 escritos) | ~$25-40 USD |
| OpenAI Embeddings (ingestión + queries) | ~$5 USD |
| Resend | $0-20 USD |
| Dominio .com.ar | ~$5 USD/año |
| **Total** | **~$80-115 USD/mes** |

**Break even:** ~10-12 suscriptores en plan Profesional.

---

## Competencia y Diferencial

| Producto | Qué hace | Precio | Gap |
|----------|----------|--------|-----|
| MetaJurídico | Gestión expedientes, calculadoras | Desde $9,999/mes | No tiene IA generativa ni escritos |
| LemonTech/CaseTracking | Gestión legal enterprise | $$$ | Muy caro, orientado a grandes estudios |
| IUSNET | Gestión de casos online | Freemium | Sin IA, interfaz básica |
| ChatGPT genérico | Chat general | $20 USD/mes | No conoce derecho AR, alucina artículos |

**Nuestro diferencial:**
1. Genera escritos con formato procesal argentino correcto, por jurisdicción
2. Cita artículos reales de leyes argentinas (RAG verificado)
3. Calculadoras integradas con tasas actualizadas (CNAT, BNA, RIPTE)
4. Precio accesible para abogado independiente
5. Todo en español argentino, pensado para el flujo de trabajo local
