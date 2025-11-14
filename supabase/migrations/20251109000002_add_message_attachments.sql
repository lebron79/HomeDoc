-- Add file attachment columns to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT,
ADD COLUMN IF NOT EXISTS attachment_size INTEGER;

-- Add comments
COMMENT ON COLUMN messages.attachment_url IS 'URL to file stored in Supabase Storage';
COMMENT ON COLUMN messages.attachment_name IS 'Original filename';
COMMENT ON COLUMN messages.attachment_type IS 'MIME type of the file';
COMMENT ON COLUMN messages.attachment_size IS 'File size in bytes';

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for message attachments
CREATE POLICY "Anyone authenticated can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'message-attachments' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Anyone authenticated can view attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'message-attachments' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'message-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
