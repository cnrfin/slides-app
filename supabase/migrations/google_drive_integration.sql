-- Supabase Migration: Google Drive Integration Tables
-- Run this in your Supabase SQL editor

-- Create table for storing user addon states
CREATE TABLE IF NOT EXISTS user_addons (
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

-- Create table for tracking Google Drive uploads
CREATE TABLE IF NOT EXISTS google_drive_uploads (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_addons_user_id ON user_addons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addons_addon_name ON user_addons(addon_name);
CREATE INDEX IF NOT EXISTS idx_google_drive_uploads_user_id ON google_drive_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_google_drive_uploads_drive_file_id ON google_drive_uploads(drive_file_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_drive_uploads ENABLE ROW LEVEL SECURITY;

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

-- Create function to update updated_at timestamp
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

-- Optional: Create a view for easier querying of connected addons
CREATE OR REPLACE VIEW connected_addons AS
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

-- Add comments for documentation
COMMENT ON TABLE user_addons IS 'Stores user addon configurations and states';
COMMENT ON TABLE google_drive_uploads IS 'Tracks files uploaded to Google Drive by users';
COMMENT ON COLUMN user_addons.addon_name IS 'Unique identifier for the addon (e.g., google_drive)';
COMMENT ON COLUMN user_addons.settings IS 'JSON object for storing addon-specific settings';
COMMENT ON COLUMN google_drive_uploads.drive_file_id IS 'Google Drive file ID returned after upload';
COMMENT ON COLUMN google_drive_uploads.metadata IS 'Additional metadata about the upload';