-- Widget settings table
CREATE TABLE IF NOT EXISTS widget_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES supportai_users(id) ON DELETE CASCADE,
  company_name TEXT DEFAULT 'My Company',
  primary_color TEXT DEFAULT '#6366f1',
  message_text_color TEXT DEFAULT '#ffffff',
  logo_color TEXT DEFAULT '#ffffff',
  position TEXT DEFAULT 'bottom-right',
  allowed_domains TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Allow public read/write for service role
GRANT ALL ON widget_settings TO service_role;
GRANT ALL ON widget_settings TO authenticated;