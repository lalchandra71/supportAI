-- Add folder_id column to documents table (TEXT to support both string IDs and UUIDs)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;

-- Create folders table if it doesn't exist
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  user_id UUID REFERENCES supportai_users(id) ON DELETE CASCADE
);

-- Insert default folders for existing users
INSERT INTO folders (id, name, color, user_id) 
SELECT gen_random_uuid(), 'General', '#6366f1', id FROM supportai_users
ON CONFLICT DO NOTHING;

INSERT INTO folders (id, name, color, user_id) 
SELECT gen_random_uuid(), 'FAQs', '#22c55e', id FROM supportai_users
ON CONFLICT DO NOTHING;

INSERT INTO folders (id, name, color, user_id) 
SELECT gen_random_uuid(), 'Policies', '#f59e0b', id FROM supportai_users
ON CONFLICT DO NOTHING;

-- Add foreign key constraint (optional, only if folder_id column already exists without FK)
-- ALTER TABLE documents
--   ADD CONSTRAINT documents_folder_id_fkey
--   FOREIGN KEY (folder_id)
--   REFERENCES folders(id)
--   ON DELETE SET NULL;

-- Insert default folders for existing users (run manually if needed)
-- INSERT INTO folders (id, name, color, user_id)
-- SELECT 'general', 'General', '#6366f1', id FROM supportai_users
-- ON CONFLICT (id) DO NOTHING;