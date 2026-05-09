-- ============================================================
-- Recovery Phase Migration
-- Run in Supabase SQL Editor (supabase.com > your project > SQL Editor)
-- ============================================================


-- ============================================================
-- Step 1: Add notes column to checklist_completions
-- ============================================================

ALTER TABLE checklist_completions ADD COLUMN IF NOT EXISTS notes TEXT;


-- ============================================================
-- Step 2: Replace the active plan with the Recovery Plan
-- ============================================================

-- Deactivate the current plan (removes the unique-active-plan constraint)
UPDATE plans SET is_active = false WHERE is_active = true;

-- Insert the new Recovery Plan
INSERT INTO plans (name, is_active, plan_data) VALUES (
  'Recovery Plan',
  true,
  '{
    "monday": {
      "type": "recovery",
      "label": "Recovery Day",
      "items": [
        { "key": "protein_shake", "label": "Morning protein shake", "category": "habit"    },
        { "key": "bible_reading", "label": "Bible reading",         "category": "recovery" },
        { "key": "book_reading",  "label": "Book reading",          "category": "recovery" },
        { "key": "moment_of_joy", "label": "Find a moment of joy",  "category": "recovery", "hasNotes": true },
        { "key": "hydration",     "label": "Drink enough water",    "category": "recovery" },
        { "key": "miralax_am",    "label": "Miralax (morning)",     "category": "recovery" },
        { "key": "miralax_pm",    "label": "Miralax (evening)",     "category": "recovery" }
      ]
    },
    "tuesday": {
      "type": "recovery",
      "label": "Recovery Day",
      "items": [
        { "key": "protein_shake", "label": "Morning protein shake", "category": "habit"    },
        { "key": "bible_reading", "label": "Bible reading",         "category": "recovery" },
        { "key": "book_reading",  "label": "Book reading",          "category": "recovery" },
        { "key": "moment_of_joy", "label": "Find a moment of joy",  "category": "recovery", "hasNotes": true },
        { "key": "hydration",     "label": "Drink enough water",    "category": "recovery" },
        { "key": "miralax_am",    "label": "Miralax (morning)",     "category": "recovery" },
        { "key": "miralax_pm",    "label": "Miralax (evening)",     "category": "recovery" }
      ]
    },
    "wednesday": {
      "type": "recovery",
      "label": "Recovery Day",
      "items": [
        { "key": "protein_shake", "label": "Morning protein shake", "category": "habit"    },
        { "key": "bible_reading", "label": "Bible reading",         "category": "recovery" },
        { "key": "book_reading",  "label": "Book reading",          "category": "recovery" },
        { "key": "moment_of_joy", "label": "Find a moment of joy",  "category": "recovery", "hasNotes": true },
        { "key": "hydration",     "label": "Drink enough water",    "category": "recovery" },
        { "key": "miralax_am",    "label": "Miralax (morning)",     "category": "recovery" },
        { "key": "miralax_pm",    "label": "Miralax (evening)",     "category": "recovery" }
      ]
    },
    "thursday": {
      "type": "recovery",
      "label": "Recovery Day",
      "items": [
        { "key": "protein_shake", "label": "Morning protein shake", "category": "habit"    },
        { "key": "bible_reading", "label": "Bible reading",         "category": "recovery" },
        { "key": "book_reading",  "label": "Book reading",          "category": "recovery" },
        { "key": "moment_of_joy", "label": "Find a moment of joy",  "category": "recovery", "hasNotes": true },
        { "key": "hydration",     "label": "Drink enough water",    "category": "recovery" },
        { "key": "miralax_am",    "label": "Miralax (morning)",     "category": "recovery" },
        { "key": "miralax_pm",    "label": "Miralax (evening)",     "category": "recovery" }
      ]
    },
    "friday": {
      "type": "recovery",
      "label": "Recovery Day",
      "items": [
        { "key": "protein_shake", "label": "Morning protein shake", "category": "habit"    },
        { "key": "bible_reading", "label": "Bible reading",         "category": "recovery" },
        { "key": "book_reading",  "label": "Book reading",          "category": "recovery" },
        { "key": "moment_of_joy", "label": "Find a moment of joy",  "category": "recovery", "hasNotes": true },
        { "key": "hydration",     "label": "Drink enough water",    "category": "recovery" },
        { "key": "miralax_am",    "label": "Miralax (morning)",     "category": "recovery" },
        { "key": "miralax_pm",    "label": "Miralax (evening)",     "category": "recovery" }
      ]
    },
    "saturday": {
      "type": "recovery",
      "label": "Recovery Day",
      "items": [
        { "key": "protein_shake", "label": "Morning protein shake", "category": "habit"    },
        { "key": "bible_reading", "label": "Bible reading",         "category": "recovery" },
        { "key": "book_reading",  "label": "Book reading",          "category": "recovery" },
        { "key": "moment_of_joy", "label": "Find a moment of joy",  "category": "recovery", "hasNotes": true },
        { "key": "hydration",     "label": "Drink enough water",    "category": "recovery" },
        { "key": "miralax_am",    "label": "Miralax (morning)",     "category": "recovery" },
        { "key": "miralax_pm",    "label": "Miralax (evening)",     "category": "recovery" }
      ]
    },
    "sunday": {
      "type": "recovery",
      "label": "Recovery Day",
      "items": [
        { "key": "protein_shake", "label": "Morning protein shake", "category": "habit"    },
        { "key": "bible_reading", "label": "Bible reading",         "category": "recovery" },
        { "key": "book_reading",  "label": "Book reading",          "category": "recovery" },
        { "key": "moment_of_joy", "label": "Find a moment of joy",  "category": "recovery", "hasNotes": true },
        { "key": "hydration",     "label": "Drink enough water",    "category": "recovery" },
        { "key": "miralax_am",    "label": "Miralax (morning)",     "category": "recovery" },
        { "key": "miralax_pm",    "label": "Miralax (evening)",     "category": "recovery" }
      ]
    }
  }'
);
