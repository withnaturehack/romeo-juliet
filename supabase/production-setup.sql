-- =============================================================
-- Romeo & Juliet — Complete Production Database Setup
-- Run this entire file in Supabase Dashboard → SQL Editor
-- Safe to re-run: uses IF NOT EXISTS and idempotent ALTER TABLE
-- =============================================================

-- ─── 1. PROFILES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  text,
  social_link   text,
  main_photo_url text,
  photo2_url    text,
  photo3_url    text,
  is_complete   boolean NOT NULL DEFAULT false,
  conversation_transcript jsonb DEFAULT '[]',
  conversation_summary    text,
  voice_conversation_completed boolean DEFAULT false,
  elevenlabs_conversation_id   text,
  onboarding_step integer DEFAULT 0,
  basic_information              jsonb DEFAULT '{}',
  location_and_future_plans      jsonb DEFAULT '{}',
  work_and_life_stage            jsonb DEFAULT '{}',
  education_and_intellectual_life jsonb DEFAULT '{}',
  relationship_direction_and_readiness jsonb DEFAULT '{}',
  family_and_children            jsonb DEFAULT '{}',
  lifestyle                      jsonb DEFAULT '{}',
  values_faith_and_culture       jsonb DEFAULT '{}',
  political_and_social_outlook   jsonb DEFAULT '{}',
  physical_and_attraction        jsonb DEFAULT '{}',
  updated_at    timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Add any missing columns idempotently
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_link text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS main_photo_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo2_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo3_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_complete boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS conversation_transcript jsonb DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS conversation_summary text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS voice_conversation_completed boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS elevenlabs_conversation_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0;
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
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_matched" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Users can read profiles of people they are actively matched with
CREATE POLICY "profiles_select_matched" ON profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.user_id = auth.uid()
        AND m.matched_user_id = profiles.user_id
        AND m.status IN ('introduced','accepted_by_user','accepted_by_match','active')
    )
  );

CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ─── 2. MEMBERSHIP ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membership (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status              text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'rejected', 'applied')),
  referral_code_used  text,
  application_data    jsonb,
  applied_at          timestamptz,
  approved_at         timestamptz,
  updated_at          timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE membership ADD COLUMN IF NOT EXISTS referral_code_used text;
ALTER TABLE membership ADD COLUMN IF NOT EXISTS application_data jsonb;
ALTER TABLE membership ADD COLUMN IF NOT EXISTS applied_at timestamptz;
ALTER TABLE membership ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE membership ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE membership ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE membership ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "membership_select_own" ON membership;
DROP POLICY IF EXISTS "membership_insert_own" ON membership;
DROP POLICY IF EXISTS "membership_update_own" ON membership;
CREATE POLICY "membership_select_own" ON membership FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "membership_insert_own" ON membership FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "membership_update_own" ON membership FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS membership_updated_at ON membership;
CREATE TRIGGER membership_updated_at BEFORE UPDATE ON membership FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ─── 3. MATCHES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matches (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status                  text NOT NULL DEFAULT 'introduced'
                            CHECK (status IN (
                              'pending_review','introduced','accepted_by_user',
                              'accepted_by_match','active','declined','expired'
                            )),
  user_decision           text CHECK (user_decision IN ('accepted','declined')),
  matched_user_decision   text CHECK (matched_user_decision IN ('accepted','declined')),
  match_reason            text,
  compatibility_summary   text,
  match_score             integer,
  strengths               text[],
  tensions                text[],
  introduced_at           timestamptz,
  updated_at              timestamptz NOT NULL DEFAULT now(),
  created_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE matches ADD COLUMN IF NOT EXISTS user_decision text CHECK (user_decision IN ('accepted','declined'));
ALTER TABLE matches ADD COLUMN IF NOT EXISTS matched_user_decision text CHECK (matched_user_decision IN ('accepted','declined'));
ALTER TABLE matches ADD COLUMN IF NOT EXISTS compatibility_summary text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_score integer;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS strengths text[];
ALTER TABLE matches ADD COLUMN IF NOT EXISTS tensions text[];
ALTER TABLE matches ADD COLUMN IF NOT EXISTS introduced_at timestamptz;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE matches ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS matches_user_idx ON matches (user_id, status);
CREATE INDEX IF NOT EXISTS matches_partner_idx ON matches (matched_user_id, status);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "matches_select_own" ON matches;
DROP POLICY IF EXISTS "matches_insert_service" ON matches;
DROP POLICY IF EXISTS "matches_update_own" ON matches;
CREATE POLICY "matches_select_own" ON matches FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "matches_update_own" ON matches FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS matches_updated_at ON matches;
CREATE TRIGGER matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ─── 4. MESSAGES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     text NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 4000),
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at timestamptz;

CREATE INDEX IF NOT EXISTS messages_match_created_idx ON messages (match_id, created_at);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON messages (sender_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "messages_select_own" ON messages;
DROP POLICY IF EXISTS "messages_insert_own" ON messages;
DROP POLICY IF EXISTS "messages_update_own" ON messages;

CREATE POLICY "messages_select_own" ON messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND m.user_id = auth.uid() AND m.status = 'active'
    )
  );

CREATE POLICY "messages_insert_own" ON messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND m.user_id = auth.uid() AND m.status = 'active'
    )
  );

CREATE POLICY "messages_update_own" ON messages FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND m.user_id = auth.uid()
    )
  );


-- ─── 5. NOTIFICATIONS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text NOT NULL
                CHECK (type IN (
                  'new_match','match_accepted','match_declined',
                  'new_message','membership_approved','system'
                )),
  title       text NOT NULL,
  body        text NOT NULL,
  link        text,
  read        boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications (user_id, read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);


-- ─── 6. STORAGE BUCKETS ──────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "profile_images_upload"  ON storage.objects;
DROP POLICY IF EXISTS "profile_images_read"    ON storage.objects;
DROP POLICY IF EXISTS "profile_images_update"  ON storage.objects;
DROP POLICY IF EXISTS "profile_images_delete"  ON storage.objects;

CREATE POLICY "profile_images_upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "profile_images_read" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'profile-images');

CREATE POLICY "profile_images_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "profile_images_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);


-- ─── 7. REFRESH SCHEMA CACHE ─────────────────────────────────
NOTIFY pgrst, 'reload schema';

-- ─── DONE ─────────────────────────────────────────────────────
-- Verify:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles','membership','matches','messages','notifications')
ORDER BY table_name;
