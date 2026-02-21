-- ============================================================
-- plans table
-- Run this in the Supabase SQL Editor (supabase.com > your project > SQL Editor)
-- ============================================================

CREATE TABLE IF NOT EXISTS plans (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  is_active  boolean     NOT NULL DEFAULT false,
  plan_data  jsonb       NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Only one plan should be active at a time.
-- Enforce via unique partial index:
CREATE UNIQUE INDEX IF NOT EXISTS plans_one_active ON plans (is_active) WHERE is_active = true;

-- RLS: anon can read (app needs it), but nobody can write via the client.
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read" ON plans
  FOR SELECT TO anon USING (true);

-- Index for the common query
CREATE INDEX IF NOT EXISTS plans_active_idx ON plans (is_active) WHERE is_active = true;


-- ============================================================
-- Insert Week One plan
-- ============================================================

INSERT INTO plans (name, is_active, plan_data) VALUES (
  'Week One Plan',
  true,
  '{
    "monday": {
      "type": "workout",
      "label": "Workout Day",
      "items": [
        { "key": "protein_shake",     "label": "Morning protein shake",         "category": "habit"   },
        { "key": "wall_pushups",      "label": "Wall push-ups — 3 × 10",        "category": "workout" },
        { "key": "bodyweight_squats", "label": "Bodyweight squats — 3 × 15",    "category": "workout" },
        { "key": "band_rows",         "label": "Resistance band rows — 3 × 12", "category": "workout" },
        { "key": "dead_bug",          "label": "Dead bug — 3 × 8 per side",     "category": "workout" }
      ]
    },
    "tuesday": {
      "type": "walk",
      "label": "Walk Day",
      "items": [
        { "key": "protein_shake", "label": "Morning protein shake",        "category": "habit" },
        { "key": "walk",          "label": "Go for a walk (any distance)", "category": "walk"  }
      ]
    },
    "wednesday": {
      "type": "workout",
      "label": "Workout Day",
      "items": [
        { "key": "protein_shake",     "label": "Morning protein shake",         "category": "habit"   },
        { "key": "wall_pushups",      "label": "Wall push-ups — 3 × 10",        "category": "workout" },
        { "key": "bodyweight_squats", "label": "Bodyweight squats — 3 × 15",    "category": "workout" },
        { "key": "band_rows",         "label": "Resistance band rows — 3 × 12", "category": "workout" },
        { "key": "dead_bug",          "label": "Dead bug — 3 × 8 per side",     "category": "workout" }
      ]
    },
    "thursday": {
      "type": "walk",
      "label": "Walk Day",
      "items": [
        { "key": "protein_shake", "label": "Morning protein shake",        "category": "habit" },
        { "key": "walk",          "label": "Go for a walk (any distance)", "category": "walk"  }
      ]
    },
    "friday": {
      "type": "workout",
      "label": "Workout Day",
      "items": [
        { "key": "protein_shake",     "label": "Morning protein shake",         "category": "habit"   },
        { "key": "wall_pushups",      "label": "Wall push-ups — 3 × 10",        "category": "workout" },
        { "key": "bodyweight_squats", "label": "Bodyweight squats — 3 × 15",    "category": "workout" },
        { "key": "band_rows",         "label": "Resistance band rows — 3 × 12", "category": "workout" },
        { "key": "dead_bug",          "label": "Dead bug — 3 × 8 per side",     "category": "workout" }
      ]
    },
    "saturday": {
      "type": "rest",
      "label": "Rest Day",
      "items": [
        { "key": "protein_shake", "label": "Morning protein shake", "category": "habit" }
      ]
    },
    "sunday": {
      "type": "rest",
      "label": "Rest Day",
      "items": [
        { "key": "protein_shake", "label": "Morning protein shake", "category": "habit" }
      ]
    }
  }'
);


-- ============================================================
-- HOW TO UPDATE THE PLAN
-- ============================================================
-- Option A — Supabase Table Editor (easiest):
--   1. Go to supabase.com > your project > Table Editor > plans
--   2. Click the row to expand it
--   3. Edit the plan_data JSON column directly
--   4. Click Save
--
-- Option B — SQL Editor (for bigger changes like a new week):
--   1. Deactivate the current plan:
--        UPDATE plans SET is_active = false WHERE is_active = true;
--   2. Insert the new plan:
--        INSERT INTO plans (name, is_active, plan_data) VALUES ('Week Two Plan', true, '{ ... }');
--
-- plan_data structure:
--   Each day key (monday–sunday) must have:
--     "type":  "workout" | "walk" | "rest"
--     "label": display name (e.g. "Workout Day")
--     "items": array of { "key": string, "label": string, "category": "habit"|"workout"|"walk" }
--
--   Item "key" values must be unique within a day and are used to track completions.
--   If you change a key, existing completion records for that key become orphaned (harmless but
--   they won't show as checked). Reusing the same key across days is fine.
-- ============================================================
