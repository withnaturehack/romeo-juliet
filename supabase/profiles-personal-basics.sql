-- Run in Supabase Dashboard → SQL Editor
-- Adds columns for onboarding Step 1 (Personal Basics).

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sexual_orientation text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pronouns text;
