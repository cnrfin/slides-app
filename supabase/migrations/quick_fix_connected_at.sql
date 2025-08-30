-- QUICK FIX: Just add the missing connected_at column
-- This is the minimal fix if you just want to resolve the immediate error

-- Add the missing column to user_addons table
ALTER TABLE user_addons 
ADD COLUMN IF NOT EXISTS connected_at TIMESTAMPTZ;

-- Verify it was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_addons' 
AND column_name = 'connected_at';

-- Test that the view now works
SELECT * FROM connected_addons LIMIT 1;