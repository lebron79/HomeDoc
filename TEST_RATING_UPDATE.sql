-- ============================================
-- TEST RATING SYSTEM
-- Run this step by step in Supabase SQL Editor
-- ============================================

-- STEP 1: Check if rating columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'ai_conversations'
AND column_name IN ('rating', 'rating_comment', 'patient_status');

-- Expected: Should see 3 rows with the columns
-- If you see 0 rows, the migration was not applied!

-- ============================================

-- STEP 2: Check current conversations
SELECT 
    id,
    LEFT(title, 50) as title_preview,
    rating,
    rating_comment,
    created_at
FROM ai_conversations
ORDER BY created_at DESC
LIMIT 5;

-- Expected: All ratings should be NULL (if not rated yet)

-- ============================================

-- STEP 3: Manually add a test rating to the most recent conversation
-- REPLACE 'CONVERSATION_ID_HERE' with an actual ID from above query

UPDATE ai_conversations
SET 
  rating = 5,
  rating_comment = 'Manual test rating from SQL'
WHERE id = (SELECT id FROM ai_conversations ORDER BY created_at DESC LIMIT 1);

-- Check if it worked
SELECT 
    id,
    LEFT(title, 50) as title_preview,
    rating,
    rating_comment,
    created_at
FROM ai_conversations
WHERE rating IS NOT NULL
ORDER BY created_at DESC;

-- Expected: Should see the conversation with rating = 5

-- ============================================

-- STEP 4: Check UPDATE policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'ai_conversations';

-- Expected: Should see policies including UPDATE

-- ============================================

-- STEP 5: If UPDATE policy is missing, add it
CREATE POLICY "Users can update their own conversations" 
ON ai_conversations
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Note: This might fail if the policy already exists (that's OK)
