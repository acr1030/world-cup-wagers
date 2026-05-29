-- World Cup Wagers schema
-- Run this in your Supabase SQL editor or via `supabase db push`

CREATE TABLE IF NOT EXISTS matches (
  id           TEXT PRIMARY KEY,
  stage        TEXT NOT NULL,
  group_letter TEXT,
  matchday     INTEGER,
  round        INTEGER,
  home         TEXT NOT NULL DEFAULT '',
  away         TEXT NOT NULL DEFAULT '',
  kickoff      TEXT NOT NULL DEFAULT '',
  line         TEXT NOT NULL DEFAULT '',
  pick         TEXT NOT NULL DEFAULT 'over',
  home_score   TEXT NOT NULL DEFAULT '',
  away_score   TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'
);

-- Allow anon users full access (single-user personal app)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_matches" ON matches FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_settings" ON settings FOR ALL TO anon USING (true) WITH CHECK (true);
