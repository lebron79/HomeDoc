-- ============================================
-- FIX RATING UPDATE POLICY
-- This adds the missing UPDATE policy for ai_conversations
-- ============================================

-- Check existing policies on ai_conversations
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'ai_conversations'
ORDER BY cmd;

-- Add UPDATE policy if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ai_conversations' 
        AND policyname = 'Users can update their own conversations'
    ) THEN
        CREATE POLICY "Users can update their own conversations" 
        ON ai_conversations
        FOR UPDATE 
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
        
        RAISE NOTICE 'UPDATE policy created successfully';
    ELSE
        RAISE NOTICE 'UPDATE policy already exists';
    END IF;
END $$;

-- Verify the policy was created
SELECT 
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'ai_conversations'
AND cmd = 'UPDATE';

-- Test: Try to update a conversation (replace the ID with one of yours)
-- UPDATE ai_conversations 
-- SET rating = 4, rating_comment = 'Test from SQL' 
-- WHERE id = 'YOUR_CONVERSATION_ID_HERE';

SELECT '✅ UPDATE policy has been added!' as status;
