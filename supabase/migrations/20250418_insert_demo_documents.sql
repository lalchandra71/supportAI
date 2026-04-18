-- Insert demo documents for the embed example widget (user_id = NULL for demo mode)
-- Run this in Supabase SQL editor:
INSERT INTO documents (title, content)
SELECT 'Pricing Plans', 'Our pricing plans: Basic (free), Pro ($29/month), Enterprise (custom). Basic includes up to 10 documents. Pro includes unlimited documents and priority support. Contact sales@supportai.com for Enterprise.'
WHERE NOT EXISTS (SELECT 1 FROM documents WHERE title = 'Pricing Plans');

INSERT INTO documents (title, content)
SELECT 'Refund Policy', 'Customers can request a refund within 7 days of purchase. Go to Settings → Billing → Request Refund. Refunds are processed within 5 business days.'
WHERE NOT EXISTS (SELECT 1 FROM documents WHERE title = 'Refund Policy');

INSERT INTO documents (title, content)
SELECT 'Password Reset', 'To reset your password, click "Forgot Password" on the login page. You will receive a reset link via email. The link expires in 1 hour.'
WHERE NOT EXISTS (SELECT 1 FROM documents WHERE title = 'Password Reset');

INSERT INTO documents (title, content)
SELECT 'Contact Support', 'For support, email support@supportai.com. We typically respond within 24 hours. Enterprise customers get priority support.'
WHERE NOT EXISTS (SELECT 1 FROM documents WHERE title = 'Contact Support');