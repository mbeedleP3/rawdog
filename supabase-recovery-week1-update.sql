-- ============================================================
-- Recovery Plan — Week 1 update
-- Run in Supabase SQL Editor
-- Changes: rename to "Week 1", remove Miralax items,
--          add morning + evening walks, quantify hydration
-- ============================================================

UPDATE plans SET
  name = 'Recovery Plan — Week 1',
  plan_data = '{
    "monday": {
      "type": "recovery",
      "label": "Recovery Day",
      "items": [
        { "key": "protein_shake", "label": "Morning protein shake", "category": "habit"    },
        { "key": "walk_am",       "label": "Morning walk",          "category": "walk"     },
        { "key": "walk_pm",       "label": "Evening walk",          "category": "walk"     },
        { "key": "hydration",     "label": "Drink 64 oz of water",  "category": "recovery" },
        { "key": "bible_reading", "label": "Bible reading",         "category": "recovery" },
        { "key": "book_reading",  "label": "Book reading",          "category": "recovery" },
        { "key": "moment_of_joy", "label": "Find a moment of joy",  "category": "recovery", "hasNotes": true }
      ]
    },
    "tuesday": {
      "type": "recovery",
      "label": "Recovery Day",
      "items": [
        { "key": "protein_shake", "label": "Morning protein shake", "category": "habit"    },
        { "key": "walk_am",       "label": "Morning walk",          "category": "walk"     },
        { "key": "walk_pm",       "label": "Evening walk",          "category": "walk"     },
        { "key": "hydration",     "label": "Drink 64 oz of water",  "category": "recovery" },
        { "key": "bible_reading", "label": "Bible reading",         "category": "recovery" },
        { "key": "book_reading",  "label": "Book reading",          "category": "recovery" },
        { "key": "moment_of_joy", "label": "Find a moment of joy",  "category": "recovery", "hasNotes": true }
      ]
    },
    "wednesday": {
      "type": "recovery",
      "label": "Recovery Day",
      "items": [
        { "key": "protein_shake", "label": "Morning protein shake", "category": "habit"    },
        { "key": "walk_am",       "label": "Morning walk",          "category": "walk"     },
        { "key": "walk_pm",       "label": "Evening walk",          "category": "walk"     },
        { "key": "hydration",     "label": "Drink 64 oz of water",  "category": "recovery" },
        { "key": "bible_reading", "label": "Bible reading",         "category": "recovery" },
        { "key": "book_reading",  "label": "Book reading",          "category": "recovery" },
        { "key": "moment_of_joy", "label": "Find a moment of joy",  "category": "recovery", "hasNotes": true }
      ]
    },
    "thursday": {
      "type": "recovery",
      "label": "Recovery Day",
      "items": [
        { "key": "protein_shake", "label": "Morning protein shake", "category": "habit"    },
        { "key": "walk_am",       "label": "Morning walk",          "category": "walk"     },
        { "key": "walk_pm",       "label": "Evening walk",          "category": "walk"     },
        { "key": "hydration",     "label": "Drink 64 oz of water",  "category": "recovery" },
        { "key": "bible_reading", "label": "Bible reading",         "category": "recovery" },
        { "key": "book_reading",  "label": "Book reading",          "category": "recovery" },
        { "key": "moment_of_joy", "label": "Find a moment of joy",  "category": "recovery", "hasNotes": true }
      ]
    },
    "friday": {
      "type": "recovery",
      "label": "Recovery Day",
      "items": [
        { "key": "protein_shake", "label": "Morning protein shake", "category": "habit"    },
        { "key": "walk_am",       "label": "Morning walk",          "category": "walk"     },
        { "key": "walk_pm",       "label": "Evening walk",          "category": "walk"     },
        { "key": "hydration",     "label": "Drink 64 oz of water",  "category": "recovery" },
        { "key": "bible_reading", "label": "Bible reading",         "category": "recovery" },
        { "key": "book_reading",  "label": "Book reading",          "category": "recovery" },
        { "key": "moment_of_joy", "label": "Find a moment of joy",  "category": "recovery", "hasNotes": true }
      ]
    },
    "saturday": {
      "type": "recovery",
      "label": "Recovery Day",
      "items": [
        { "key": "protein_shake", "label": "Morning protein shake", "category": "habit"    },
        { "key": "walk_am",       "label": "Morning walk",          "category": "walk"     },
        { "key": "walk_pm",       "label": "Evening walk",          "category": "walk"     },
        { "key": "hydration",     "label": "Drink 64 oz of water",  "category": "recovery" },
        { "key": "bible_reading", "label": "Bible reading",         "category": "recovery" },
        { "key": "book_reading",  "label": "Book reading",          "category": "recovery" },
        { "key": "moment_of_joy", "label": "Find a moment of joy",  "category": "recovery", "hasNotes": true }
      ]
    },
    "sunday": {
      "type": "recovery",
      "label": "Recovery Day",
      "items": [
        { "key": "protein_shake", "label": "Morning protein shake", "category": "habit"    },
        { "key": "walk_am",       "label": "Morning walk",          "category": "walk"     },
        { "key": "walk_pm",       "label": "Evening walk",          "category": "walk"     },
        { "key": "hydration",     "label": "Drink 64 oz of water",  "category": "recovery" },
        { "key": "bible_reading", "label": "Bible reading",         "category": "recovery" },
        { "key": "book_reading",  "label": "Book reading",          "category": "recovery" },
        { "key": "moment_of_joy", "label": "Find a moment of joy",  "category": "recovery", "hasNotes": true }
      ]
    }
  }'
WHERE is_active = true;
