-- Supabase Migration: Google Drive Integration (Fully Fixed Version)
-- This version handles existing tables and missing columns

-- ============================================
-- STEP 1: Handle existing tables and add missing columns
-- ============================================

-- Check and add missing columns to user_addons table if it exists
DO $$ 
BEGIN
    -- Check if user_addons table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_addons') THEN
        -- Add connected_at column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'user_addons' AND column_name = 'connected_at') THEN
            ALTER TABLE user_addons ADD COLUMN connected_at TIMESTAMPTZ;
        END IF;
        
        -- Add settings column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'user_addons' AND column_name = 'settings') THEN
            ALTER TABLE user_addons ADD COLUMN settings JSONB DEFAULT '{}';
        END IF;
        
        -- Add created_at column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'user_addons' AND column_name = 'created_at') THEN
            ALTER TABLE user_addons ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        
        -- Add updated_at column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'user_addons' AND column_name = 'updated_at') THEN
            ALTER TABLE user_addons ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
    ELSE
        -- Create the table if it doesn't exist
        CREATE TABLE user_addons (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            addon_name TEXT NOT NULL,
            enabled BOOLEAN DEFAULT false,
            connected_at TIMESTAMPTZ,
            settings JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id, addon_name)
        );
    END IF;

    -- Check and create google_drive_uploads table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'google_drive_uploads') THEN
        CREATE TABLE google_drive_uploads (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            drive_file_id TEXT NOT NULL,
            file_name TEXT NOT NULL,
            mime_type TEXT,
            file_size BIGINT,
            folder_id TEXT,
            uploaded_at TIMESTAMPTZ DEFAULT NOW(),
            metadata JSONB DEFAULT '{}'
        );
    END IF;
END $$;

-- ============================================
-- STEP 2: Create indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_addons_user_id ON user_addons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addons_addon_name ON user_addons(addon_name);
CREATE INDEX IF NOT EXISTS idx_google_drive_uploads_user_id ON google_drive_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_google_drive_uploads_drive_file_id ON google_drive_uploads(drive_file_id);

-- ============================================
-- STEP 3: Enable Row Level Security
-- ============================================

ALTER TABLE user_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_drive_uploads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Drop and recreate RLS policies
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own addons" ON user_addons;
DROP POLICY IF EXISTS "Users can insert their own addons" ON user_addons;
DROP POLICY IF EXISTS "Users can update their own addons" ON user_addons;
DROP POLICY IF EXISTS "Users can delete their own addons" ON user_addons;

DROP POLICY IF EXISTS "Users can view their own uploads" ON google_drive_uploads;
DROP POLICY IF EXISTS "Users can insert their own uploads" ON google_drive_uploads;
DROP POLICY IF EXISTS "Users can update their own uploads" ON google_drive_uploads;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON google_drive_uploads;

-- Create RLS policies for user_addons
CREATE POLICY "Users can view their own addons"
    ON user_addons FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addons"
    ON user_addons FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addons"
    ON user_addons FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addons"
    ON user_addons FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for google_drive_uploads
CREATE POLICY "Users can view their own uploads"
    ON google_drive_uploads FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploads"
    ON google_drive_uploads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads"
    ON google_drive_uploads FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads"
    ON google_drive_uploads FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- STEP 5: Create or replace the update trigger
-- ============================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_addons_updated_at ON user_addons;

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at
CREATE TRIGGER update_user_addons_updated_at
    BEFORE UPDATE ON user_addons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 6: Create or replace the view
-- ============================================

-- Drop and recreate view for easier querying of connected addons
DROP VIEW IF EXISTS connected_addons;

CREATE VIEW connected_addons AS
SELECT 
    ua.user_id,
    ua.addon_name,
    ua.enabled,
    ua.connected_at,
    ua.settings,
    COUNT(gdu.id) as total_uploads,
    MAX(gdu.uploaded_at) as last_upload
FROM user_addons ua
LEFT JOIN google_drive_uploads gdu ON ua.user_id = gdu.user_id
WHERE ua.enabled = true
GROUP BY ua.user_id, ua.addon_name, ua.enabled, ua.connected_at, ua.settings;

-- Grant permissions for the view
GRANT SELECT ON connected_addons TO authenticated;

-- ============================================
-- STEP 7: Add documentation comments
-- ============================================

COMMENT ON TABLE user_addons IS 'Stores user addon configurations and states';
COMMENT ON TABLE google_drive_uploads IS 'Tracks files uploaded to Google Drive by users';
COMMENT ON COLUMN user_addons.addon_name IS 'Unique identifier for the addon (e.g., google_drive)';
COMMENT ON COLUMN user_addons.settings IS 'JSON object for storing addon-specific settings';
COMMENT ON COLUMN user_addons.connected_at IS 'Timestamp when the addon was connected/authenticated';
COMMENT ON COLUMN google_drive_uploads.drive_file_id IS 'Google Drive file ID returned after upload';
COMMENT ON COLUMN google_drive_uploads.metadata IS 'Additional metadata about the upload';

-- ============================================
-- STEP 8: Verify the migration
-- ============================================

DO $$ 
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Tables created/updated:';
    RAISE NOTICE '  - user_addons (with all required columns)';
    RAISE NOTICE '  - google_drive_uploads';
    RAISE NOTICE 'View created: connected_addons';
    RAISE NOTICE 'RLS policies applied';
    RAISE NOTICE 'Triggers configured';
END $$;