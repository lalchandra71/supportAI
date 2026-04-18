-- Add resolved column to conversations if not exists
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS resolved BOOLEAN DEFAULT false;