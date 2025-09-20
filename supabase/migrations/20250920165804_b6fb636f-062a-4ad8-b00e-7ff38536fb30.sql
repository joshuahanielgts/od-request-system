-- Fix email confirmation for existing users
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;