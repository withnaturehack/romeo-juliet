-- Run in Supabase Dashboard → SQL Editor
-- Adds a column to store the ElevenLabs conversation ID for audio retrieval.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS elevenlabs_conversation_id text;
