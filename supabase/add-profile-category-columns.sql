-- Run in Supabase Dashboard → SQL Editor (or via Supabase CLI)
-- Adds JSONB category columns to profiles for flexible question/answer storage.
-- Enables changing onboarding questions without schema migrations.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS basic_information jsonb DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_and_future_plans jsonb DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_and_life_stage jsonb DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education_and_intellectual_life jsonb DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS relationship_direction_and_readiness jsonb DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS family_and_children jsonb DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lifestyle jsonb DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS values_faith_and_culture jsonb DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS political_and_social_outlook jsonb DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS physical_and_attraction jsonb DEFAULT '{}';
