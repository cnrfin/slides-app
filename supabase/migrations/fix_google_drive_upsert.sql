-- Fix Google Drive Addon Upsert Issues
-- Run this in Supabase SQL Editor to fix the duplicate key constraint issues

-- First, let's check if there are any duplicate entries
SELECT user_id, addon_name, COUNT(*) 
FROM user_addons 
GROUP BY user_id, addon_name 
HAVING COUNT(*) > 1;

-- If there are duplicates, keep only the most recent one
WITH duplicates AS (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY user_id, addon_name ORDER BY updated_at DESC) as rn
    FROM user_addons
)
DELETE FROM user_addons 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- Ensure the unique constraint exists
ALTER TABLE user_addons 
DROP CONSTRAINT IF EXISTS user_addons_user_id_addon_name_key;

ALTER TABLE user_addons 
ADD CONSTRAINT user_addons_user_id_addon_name_key 
UNIQUE (user_id, addon_name);

-- Create a function to handle upserts properly
CREATE OR REPLACE FUNCTION upsert_user_addon(
    p_user_id UUID,
    p_addon_name TEXT,
    p_enabled BOOLEAN,
    p_connected_at TIMESTAMPTZ,
    p_settings JSONB
) RETURNS user_addons AS $$
DECLARE
    v_result user_addons;
BEGIN
    INSERT INTO user_addons (user_id, addon_name, enabled, connected_at, settings)
    VALUES (p_user_id, p_addon_name, p_enabled, p_connected_at, p_settings)
    ON CONFLICT (user_id, addon_name) 
    DO UPDATE SET
        enabled = EXCLUDED.enabled,
        connected_at = EXCLUDED.connected_at,
        settings = EXCLUDED.settings,
        updated_at = NOW()
    RETURNING * INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upsert_user_addon TO authenticated;

-- Test the function (replace with actual user_id from your auth.users table)
-- SELECT * FROM upsert_user_addon(
--     'YOUR_USER_ID'::UUID,
--     'google_drive',
--     true,
--     NOW(),
--     '{"auth_method": "gis_popup"}'::JSONB
-- );

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_addons'
ORDER BY ordinal_position;

-- Check constraints
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'user_addons'::regclass;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'Google Drive addon upsert issues fixed!';
    RAISE NOTICE 'The unique constraint on (user_id, addon_name) is now properly configured.';
    RAISE NOTICE 'You can also use the upsert_user_addon function for conflict-free inserts/updates.';
END $$;