-- Fitness Tracker — Supabase Database Setup
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)

-- ─── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS checklist_completions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  date        DATE        NOT NULL,
  item_key    TEXT        NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (date, item_key)
);

CREATE TABLE IF NOT EXISTS food_log (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  date        DATE        NOT NULL,
  entry_text  TEXT        NOT NULL,
  logged_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Row Level Security ────────────────────────────────────────────────────────
-- Single-user app with no auth — allow all operations for the anon role.
-- The anon key is in your env vars and never exposed publicly.

ALTER TABLE checklist_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all" ON checklist_completions
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_all" ON food_log
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ─── Indexes (optional, improves query speed) ─────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_completions_date ON checklist_completions (date);
CREATE INDEX IF NOT EXISTS idx_food_log_date    ON food_log (date);
