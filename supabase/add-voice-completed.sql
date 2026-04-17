-- Run in Supabase Dashboard → SQL Editor
-- Adds a flag so we know the user completed the 5-question voice exchange.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS voice_conversation_completed boolean DEFAULT false;
