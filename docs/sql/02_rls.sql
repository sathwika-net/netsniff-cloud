ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE packets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_api_keys" ON api_keys FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_sessions" ON sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_packets"  ON packets  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_alerts"   ON alerts   FOR ALL USING (auth.uid() = user_id);
