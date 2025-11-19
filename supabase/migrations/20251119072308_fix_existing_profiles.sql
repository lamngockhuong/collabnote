-- Fix: Create profiles for existing users
-- Run this in Supabase Studio SQL Editor

INSERT INTO public.profiles (id, username, avatar_url)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'username', email),
  raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
