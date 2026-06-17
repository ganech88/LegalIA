-- Multi-usuario: estudios (organizations) y miembros, para el plan Estudio.

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'estudio',
  max_miembros INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- null hasta que la persona acepta
  invited_email TEXT,                                     -- email invitado (en minúsculas)
  role TEXT NOT NULL DEFAULT 'member',                    -- owner | member
  status TEXT NOT NULL DEFAULT 'invited',                 -- invited | active
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, invited_email)
);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members (user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_email ON organization_members (invited_email);

-- Helpers SECURITY DEFINER (evitan recursión de RLS al consultar membresías).
CREATE OR REPLACE FUNCTION current_user_org_ids()
RETURNS SETOF UUID LANGUAGE sql SECURITY DEFINER SET search_path = '' STABLE AS $$
  SELECT organization_id FROM public.organization_members
  WHERE user_id = auth.uid() AND status = 'active';
$$;

CREATE OR REPLACE FUNCTION is_org_owner(p_org UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = '' STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.organizations WHERE id = p_org AND owner_id = auth.uid());
$$;

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Organizations: el dueño y los miembros activos la ven; solo el dueño la gestiona.
CREATE POLICY "org read" ON organizations FOR SELECT
  USING (owner_id = auth.uid() OR id IN (SELECT current_user_org_ids()));
CREATE POLICY "org owner manage" ON organizations FOR ALL
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Members: cada uno ve sus filas; el dueño ve y gestiona las de su organización;
-- el invitado ve la fila que coincide con su email.
CREATE POLICY "members read" ON organization_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_org_owner(organization_id)
    OR invited_email = lower(auth.jwt() ->> 'email')
  );
CREATE POLICY "members owner manage" ON organization_members FOR ALL
  USING (is_org_owner(organization_id)) WITH CHECK (is_org_owner(organization_id));
-- Un invitado puede actualizar su propia fila al aceptar (status/user_id).
CREATE POLICY "members self update" ON organization_members FOR UPDATE
  USING (invited_email = lower(auth.jwt() ->> 'email') OR user_id = auth.uid());

-- Casos compartidos a nivel de estudio: columna + lectura para miembros de la org.
ALTER TABLE casos ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
CREATE POLICY "org members read shared casos" ON casos FOR SELECT
  USING (organization_id IS NOT NULL AND organization_id IN (SELECT current_user_org_ids()));
