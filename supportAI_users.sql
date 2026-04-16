-- SupportAI Users Table (Simple Version)
-- Run this in Supabase SQL Editor
-- This works without Supabase Auth - just stores user records

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Optional: Enable RLS if using Supabase Auth later
-- For now, we keep it open for demo mode
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Insert a test user (optional)
-- INSERT INTO public.users (email, password_hash, full_name, plan)
-- VALUES ('test@example.com', 'hashed_password', 'Test User', 'free');