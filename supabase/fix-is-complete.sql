-- Run this in Supabase Dashboard → SQL Editor
-- This script ensures the "is_complete" column exists on the "profiles" table
-- and refreshes the PostgREST schema cache to resolve the PGRST204 error.

-- 1. Ensure the column exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_complete boolean DEFAULT false;

-- 2. If you are seeing errors about "user_id" vs "id", ensure both exist
-- Most code in this app expects "user_id"
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- 3. (Optional) Backfill user_id if it's new but id exists
UPDATE profiles 
SET user_id = id 
WHERE user_id IS NULL AND id IS NOT NULL;

-- 4. Refresh PostgREST schema cache
-- This is critical for resolving "Could not find column in schema cache" errors
NOTIFY pgrst, 'reload schema';

-- Verify the columns now exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('is_complete', 'user_id', 'id');
