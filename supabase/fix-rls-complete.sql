-- ============================================================
-- Run this ENTIRE script in Supabase Dashboard → SQL Editor
-- Fixes "new row violates row-level security policy" for both
-- the profiles table AND the profile-images storage bucket.
-- ============================================================

-- ---------- 1. PROFILES TABLE (public.profiles) ----------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remove old policies if they exist (avoids "already exists" errors)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ---------- 2. STORAGE BUCKET (profile-images uploads) ----------
-- Allow authenticated users to INSERT into the profile-images bucket.
-- Our app uploads to paths like: {user_id}/main-123.jpg
DROP POLICY IF EXISTS "Allow authenticated uploads to profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload profile images" ON storage.objects;

CREATE POLICY "Allow authenticated uploads to profile-images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Allow public read profile-images" ON storage.objects;
CREATE POLICY "Allow public read profile-images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Allow authenticated update own profile images" ON storage.objects;
CREATE POLICY "Allow authenticated update own profile images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'profile-images')
  WITH CHECK (bucket_id = 'profile-images');
