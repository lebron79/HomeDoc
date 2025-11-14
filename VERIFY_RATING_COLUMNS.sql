-- ============================================
-- VERIFY RATING COLUMNS EXIST
-- Run this in Supabase SQL Editor to check if the rating columns exist
-- ============================================

-- Check if rating columns exist in ai_conversations table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'ai_conversations'
AND column_name IN ('rating', 'rating_comment', 'patient_status')
ORDER BY column_name;

-- If the above query returns 0 rows, you need to add the columns
-- Run this to add them:

-- ALTER TABLE ai_conversations 
-- ADD COLUMN IF NOT EXISTS patient_status TEXT CHECK (patient_status IN ('excellent', 'good', 'fair', 'poor', 'critical')),
-- ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
-- ADD COLUMN IF NOT EXISTS rating_comment TEXT;

-- Sample query to see existing conversations with ratings
SELECT 
    id,
    title,
    rating,
    rating_comment,
    patient_status,
    created_at
FROM ai_conversations
ORDER BY created_at DESC
LIMIT 5;
