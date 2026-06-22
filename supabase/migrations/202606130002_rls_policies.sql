-- RLS Policies for Development Environment
-- These policies allow full access for development. In production, these should be restricted.

-- World State Policies
CREATE POLICY "Enable all access for development on world_state"
  ON world_state FOR ALL
  USING (true)
  WITH CHECK (true);

-- Evidence Policies
CREATE POLICY "Enable all access for development on evidence"
  ON evidence FOR ALL
  USING (true)
  WITH CHECK (true);

-- Sensors Policies
CREATE POLICY "Enable all access for development on sensors"
  ON sensors FOR ALL
  USING (true)
  WITH CHECK (true);

-- Entities Policies
CREATE POLICY "Enable all access for development on entities"
  ON entities FOR ALL
  USING (true)
  WITH CHECK (true);

-- Relationships Policies
CREATE POLICY "Enable all access for development on relationships"
  ON relationships FOR ALL
  USING (true)
  WITH CHECK (true);
