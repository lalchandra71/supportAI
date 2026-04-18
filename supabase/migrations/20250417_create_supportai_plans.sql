-- Create supportai_plans table to store plan details

CREATE TABLE IF NOT EXISTS supportai_plans (
  name TEXT PRIMARY KEY,
  price NUMERIC NOT NULL,
  interval TEXT NOT NULL DEFAULT 'month',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_enterprise BOOLEAN DEFAULT FALSE,
  description TEXT,
  features TEXT[]
);

-- Insert the three plans
INSERT INTO supportai_plans (name, price, interval, display_order, is_enterprise, description, features) VALUES
  (
    'basic',
    10,
    'month',
    1,
    FALSE,
    'Perfect for small teams getting started',
    ARRAY[
      '100 messages/month',
      '10 documents',
      'Basic widget',
      'Community support'
    ]
  ),
  (
    'pro',
    50,
    'month',
    2,
    FALSE,
    'Best for growing businesses',
    ARRAY[
      '5,000 messages/month',
      '50 documents',
      'Custom branding',
      'Analytics dashboard',
      'Priority support'
    ]
  ),
  (
    'enterprise',
    NULL,
    'custom',
    3,
    TRUE,
    'Custom solutions for large organizations',
    ARRAY[
      'Unlimited messages',
      'Unlimited documents',
      'Analytics dashboard',
      'SSO / SAML',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee'
    ]
  )
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  interval = EXCLUDED.interval,
  display_order = EXCLUDED.display_order,
  is_enterprise = EXCLUDED.is_enterprise,
  description = EXCLUDED.description,
  features = EXCLUDED.features;

-- Allow 'basic', 'pro', 'enterprise' in supportai_users.plan column
-- First drop existing check constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'supportai_users_plan_check'
    AND conrelid = 'supportai_users'::regclass
  ) THEN
    ALTER TABLE supportai_users DROP CONSTRAINT supportai_users_plan_check;
  END IF;
END $$;

ALTER TABLE supportai_users
  ADD CONSTRAINT supportai_users_plan_check
  CHECK (plan IN ('free', 'basic', 'pro', 'enterprise'));
