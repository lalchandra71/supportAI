-- Fix documents table foreign key to point to supportai_users instead of auth.users

-- First drop the existing foreign key constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_user_id_fkey;

-- Add new foreign key constraint referencing supportai_users(id)
ALTER TABLE documents
  ADD CONSTRAINT documents_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES supportai_users(id) ON DELETE CASCADE;
