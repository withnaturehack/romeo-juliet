-- Run in Supabase Dashboard → SQL Editor
-- Defines one active match per user and a messages table.

-- Match status type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status') THEN
    CREATE TYPE match_status AS ENUM ('active', 'unmatched', 'expired');
  END IF;
END$$;

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_name text NOT NULL,
  partner_avatar_url text,
  partner_location text,
  reason text,
  status match_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  unmatched_at timestamptz,
  unmatch_reason text
);

CREATE INDEX IF NOT EXISTS matches_user_status_idx
  ON matches (user_id, status);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id bigserial PRIMARY KEY,
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('user', 'partner', 'system')),
  type text NOT NULL CHECK (type IN ('text', 'audio')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_match_created_idx
  ON messages (match_id, created_at);

-- Enable RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can access only their own matches & messages
DROP POLICY IF EXISTS "users-select-own-matches" ON matches;
DROP POLICY IF EXISTS "users-insert-own-matches" ON matches;
DROP POLICY IF EXISTS "users-update-own-matches" ON matches;

CREATE POLICY "users-select-own-matches"
  ON matches FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users-insert-own-matches"
  ON matches FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users-update-own-matches"
  ON matches FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users-select-own-messages" ON messages;
DROP POLICY IF EXISTS "users-insert-own-messages" ON messages;

CREATE POLICY "users-select-own-messages"
  ON messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM matches m
    WHERE m.id = match_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "users-insert-own-messages"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM matches m
    WHERE m.id = match_id AND m.user_id = auth.uid()
  ));

