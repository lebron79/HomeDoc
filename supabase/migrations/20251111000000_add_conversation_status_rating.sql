-- Add patient_status and rating fields to ai_conversations table
-- patient_status: Optional field for future analytics (not currently used in UI)
-- rating: User's 1-5 star rating of the diagnosis (displayed in conversation history)
-- rating_comment: Optional text feedback from the user
ALTER TABLE ai_conversations 
ADD COLUMN IF NOT EXISTS patient_status TEXT CHECK (patient_status IN ('excellent', 'good', 'fair', 'poor', 'critical')),
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS rating_comment TEXT;

-- Add delete policy for users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ai_conversations' 
        AND policyname = 'Users can delete their own conversations'
    ) THEN
        CREATE POLICY "Users can delete their own conversations" ON ai_conversations
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;
