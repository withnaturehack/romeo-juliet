-- Run this once in Supabase Dashboard → SQL Editor (or via Supabase CLI).
-- Adds all columns needed for onboarding Steps 1 & 2 (Personal Basics + Foundations).

-- Step 1: Personal Basics
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sexual_orientation text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pronouns text;

-- Step 2: Foundations
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS relationship_direction text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS children text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS faith_integration text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lifestyle_location text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_situation text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS political_alignment text;
