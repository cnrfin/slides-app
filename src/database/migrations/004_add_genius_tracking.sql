-- Migration: Add genius generation tracking
-- Date: 2025-01-09
-- Description: Track genius mode usage and add subscription plan to profiles

-- Add genius generations tracking to usage_tracking table
ALTER TABLE usage_tracking 
ADD COLUMN IF NOT EXISTS genius_generations INTEGER DEFAULT 0;

-- Add subscription plan to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free';

-- Add constraints
ALTER TABLE profiles 
ADD CONSTRAINT valid_subscription_plan 
CHECK (subscription_plan IN ('free', 'pro', 'max'));

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_usage_tracking_month 
ON usage_tracking(user_id, month_year);

-- Add index for subscription plan queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan 
ON profiles(subscription_plan);

-- Add comments for documentation
COMMENT ON COLUMN usage_tracking.genius_generations IS 'Number of genius mode generations used in the month';
COMMENT ON COLUMN profiles.subscription_plan IS 'User subscription plan: free, pro, or max';

-- Update existing profiles to have default plan
UPDATE profiles 
SET subscription_plan = 'free' 
WHERE subscription_plan IS NULL;
