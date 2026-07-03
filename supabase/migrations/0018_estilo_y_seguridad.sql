-- 0018: Estilo de redacción del abogado (se inyecta en los prompts de generación).
-- APLICADA en remoto el 2026-07-01 (como "0018a_estilo_redaccion" vía MCP).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS estilo_redaccion TEXT;
