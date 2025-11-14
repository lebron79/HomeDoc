-- Add avatar column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT 'avatar-1';

-- Add comment
COMMENT ON COLUMN user_profiles.avatar IS 'User selected avatar identifier (person avatar from DiceBear API)';
