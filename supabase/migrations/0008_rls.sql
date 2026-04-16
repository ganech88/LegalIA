ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE escritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE casos ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrito_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own escritos" ON escritos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own escritos" ON escritos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own escritos" ON escritos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own escritos" ON escritos FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own consultas" ON consultas_ia FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own consultas" ON consultas_ia FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own consultas" ON consultas_ia FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own casos" ON casos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own casos" ON casos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own casos" ON casos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own casos" ON casos FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public read legal knowledge" ON legal_knowledge FOR SELECT USING (true);

CREATE POLICY "Public read active templates" ON escrito_templates FOR SELECT USING (activo = true);
