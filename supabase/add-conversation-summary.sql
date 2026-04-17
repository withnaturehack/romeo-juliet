-- Run in Supabase Dashboard → SQL Editor
-- Adds a column to store the summarized voice conversation on the user's profile.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS conversation_summary text;
