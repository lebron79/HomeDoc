-- Add title column to ai_conversations table
ALTER TABLE ai_conversations
ADD COLUMN IF NOT EXISTS title TEXT;

-- Add comment
COMMENT ON COLUMN ai_conversations.title IS 'User-friendly title for the conversation, auto-generated from diagnosis or symptoms';
