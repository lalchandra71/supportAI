-- Fix conversations table foreign key to point to supportai_users instead of auth.users

-- First drop the existing foreign key constraint (may not exist if table was created without FK)
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_user_id_fkey;

-- Add new foreign key constraint referencing supportai_users(id)
ALTER TABLE conversations
  ADD CONSTRAINT conversations_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES supportai_users(id) ON DELETE CASCADE;