-- Diagnostic script to check current database state
-- Run this BEFORE applying the migration to see what exists

-- Check if tables exist
SELECT 
    'user_addons' as table_name,
    EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_addons') as exists;

SELECT 
    'google_drive_uploads' as table_name,
    EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'google_drive_uploads') as exists;

-- Check columns in user_addons table (if it exists)
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_addons'
ORDER BY ordinal_position;

-- Check columns in google_drive_uploads table (if it exists)
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'google_drive_uploads'
ORDER BY ordinal_position;

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('user_addons', 'google_drive_uploads');

-- Check if view exists
SELECT 
    'connected_addons' as view_name,
    EXISTS (SELECT FROM information_schema.views WHERE table_name = 'connected_addons') as exists;

-- Check existing triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'user_addons';