-- 0022: Portal del cliente — link público por caso (token no adivinable).
-- El abogado habilita el portal por caso; el cliente ve el estado en lenguaje
-- claro sin necesidad de cuenta. La página pública lee con service role y
-- SOLO cuando portal_habilitado = true.

ALTER TABLE casos ADD COLUMN IF NOT EXISTS portal_token UUID;
ALTER TABLE casos ADD COLUMN IF NOT EXISTS portal_habilitado BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_casos_portal_token
  ON casos (portal_token) WHERE portal_token IS NOT NULL;
