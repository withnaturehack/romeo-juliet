-- Run in Supabase Dashboard → SQL Editor
-- Adds columns for onboarding Step 2 (Foundations).

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS relationship_direction text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS children text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS faith_integration text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lifestyle_location text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_situation text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS political_alignment text;
