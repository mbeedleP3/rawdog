-- ============================================================
-- Add category column to food_log
-- Run in Supabase SQL Editor
-- Existing rows default to 'food' so nothing breaks
-- ============================================================

ALTER TABLE food_log ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'food';
