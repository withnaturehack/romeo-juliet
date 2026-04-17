-- Run in Supabase Dashboard → SQL Editor (after creating the bucket in Storage UI)
-- 1. In Storage, create a new bucket named: voice-responses (public or private, your choice)
-- 2. Then run this to allow authenticated users to upload their own voice responses:

DROP POLICY IF EXISTS "Allow authenticated uploads to voice-responses" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to voice-responses"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'voice-responses');

DROP POLICY IF EXISTS "Allow read own voice-responses" ON storage.objects;
CREATE POLICY "Allow read own voice-responses"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'voice-responses');
