-- CLEANUP SCRIPT - Use this if you want to completely remove and recreate everything
-- ⚠️ WARNING: This will DELETE ALL DATA in these tables!
-- Only use if you want to start fresh

-- Drop view first (depends on tables)
DROP VIEW IF EXISTS connected_addons CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS update_user_addons_updated_at ON user_addons;

-- Drop tables (CASCADE will drop all dependent objects)
DROP TABLE IF EXISTS google_drive_uploads CASCADE;
DROP TABLE IF EXISTS user_addons CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Confirmation message
DO $$ 
BEGIN
    RAISE NOTICE 'Cleanup completed. All Google Drive addon related tables and objects have been removed.';
    RAISE NOTICE 'You can now run the complete migration to set everything up fresh.';
END $$;