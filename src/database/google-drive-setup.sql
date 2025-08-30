-- Google Drive Integration Database Setup
-- Execute these SQL commands in Supabase SQL Editor

-- Table for user addon preferences
CREATE TABLE IF NOT EXISTS user_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  addon_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, addon_name)
);

-- Table for Google Drive OAuth tokens
CREATE TABLE IF NOT EXISTS google_drive_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  access_token TEXT,
  refresh_token TEXT,
  token_type TEXT,
  expiry_date BIGINT,
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_drive_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own addons" ON user_addons
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tokens" ON google_drive_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_addons_user_id ON user_addons(user_id);
CREATE INDEX IF NOT EXISTS idx_google_drive_tokens_user_id ON google_drive_tokens(user_id);
