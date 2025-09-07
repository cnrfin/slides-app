-- Migration to add avatar_url to profiles table if not exists
-- Run this in your Supabase SQL editor

-- Check if avatar_url column exists, if not, add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='profiles' 
        AND column_name='avatar_url'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Create a storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow users to upload their own avatars
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow users to update their own avatars
CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow public to view avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

-- Function to get avatar URL
CREATE OR REPLACE FUNCTION public.get_avatar_url(user_id uuid)
RETURNS text AS $$
BEGIN
    RETURN (SELECT avatar_url FROM profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update avatar URL
CREATE OR REPLACE FUNCTION public.update_avatar_url(user_id uuid, new_avatar_url text)
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET avatar_url = new_avatar_url,
        updated_at = now()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample usage:
-- To update a user's avatar URL after uploading to storage:
-- SELECT update_avatar_url(auth.uid(), 'https://your-project.supabase.co/storage/v1/object/public/avatars/user-id/avatar.jpg');
