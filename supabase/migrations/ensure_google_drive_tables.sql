-- Migration: Ensure Google Drive Integration Tables Exist
-- This migration ensures all required tables and columns exist for Google Drive integration

-- ============================================
-- STEP 1: Ensure user_addons table exists with all columns
-- ============================================

DO $$ 
BEGIN
    -- Create user_addons table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_addons') THEN
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
        
        RAISE NOTICE 'Created user_addons table';
    ELSE
        -- Add any missing columns to existing table
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'user_addons' AND column_name = 'connected_at') THEN
            ALTER TABLE user_addons ADD COLUMN connected_at TIMESTAMPTZ;
            RAISE NOTICE 'Added connected_at column to user_addons';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'user_addons' AND column_name = 'settings') THEN
            ALTER TABLE user_addons ADD COLUMN settings JSONB DEFAULT '{}';
            RAISE NOTICE 'Added settings column to user_addons';
        END IF;
    END IF;

    -- Create google_drive_uploads table if it doesn't exist
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
        
        RAISE NOTICE 'Created google_drive_uploads table';
    END IF;
END $$;

-- ============================================
-- STEP 2: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_addons_user_id ON user_addons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addons_addon_name ON user_addons(addon_name);
CREATE INDEX IF NOT EXISTS idx_user_addons_user_addon ON user_addons(user_id, addon_name);
CREATE INDEX IF NOT EXISTS idx_google_drive_uploads_user_id ON google_drive_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_google_drive_uploads_drive_file_id ON google_drive_uploads(drive_file_id);

-- ============================================
-- STEP 3: Enable Row Level Security
-- ============================================

ALTER TABLE user_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_drive_uploads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Create RLS policies (drop existing first to avoid conflicts)
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
-- STEP 5: Create update trigger for updated_at
-- ============================================

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_addons_updated_at ON user_addons;

-- Create trigger for updating updated_at
CREATE TRIGGER update_user_addons_updated_at
    BEFORE UPDATE ON user_addons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 6: Add documentation comments
-- ============================================

COMMENT ON TABLE user_addons IS 'Stores user addon configurations and states';
COMMENT ON TABLE google_drive_uploads IS 'Tracks files uploaded to Google Drive by users';
COMMENT ON COLUMN user_addons.addon_name IS 'Unique identifier for the addon (e.g., google_drive)';
COMMENT ON COLUMN user_addons.settings IS 'JSON object for storing addon-specific settings';
COMMENT ON COLUMN user_addons.connected_at IS 'Timestamp when the addon was connected/authenticated';
COMMENT ON COLUMN google_drive_uploads.drive_file_id IS 'Google Drive file ID returned after upload';
COMMENT ON COLUMN google_drive_uploads.metadata IS 'Additional metadata about the upload';

-- ============================================
-- STEP 7: Success message
-- ============================================

DO $$ 
BEGIN
    RAISE NOTICE '✅ Google Drive integration tables are ready!';
    RAISE NOTICE 'Tables available: user_addons, google_drive_uploads';
    RAISE NOTICE 'RLS policies are active';
    RAISE NOTICE 'Indexes are created for optimal performance';
END $$;
