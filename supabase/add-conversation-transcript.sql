-- Run in Supabase Dashboard → SQL Editor
-- Adds a column to store the raw voice conversation transcript as JSON.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS conversation_transcript jsonb DEFAULT '[]';
