-- Add password reset token fields to supportai_users

ALTER TABLE supportai_users
  ADD COLUMN reset_token TEXT,
  ADD COLUMN reset_token_expires_at TIMESTAMPTZ;

-- Index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_supportai_users_reset_token ON supportai_users(reset_token) WHERE reset_token IS NOT NULL;
