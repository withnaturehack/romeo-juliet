-- Run in Supabase Dashboard → SQL Editor
-- Creates or fixes the profiles table so it has the columns the app expects.

-- Create table if it doesn't exist (for new projects)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  social_link text,
  main_photo_url text,
  photo2_url text,
  photo3_url text,
  is_complete boolean DEFAULT false
);

-- If the table already existed with different columns, add the missing ones
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_link text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS main_photo_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo2_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo3_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_complete boolean DEFAULT false;
