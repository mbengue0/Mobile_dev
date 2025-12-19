-- ============================================================================
-- PROMOTE USER TO SUPER ADMIN
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================================

-- Replace 'YOUR_EMAIL@EXAMPLE.COM' with the email of the user you just created
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'YOUR_EMAIL@EXAMPLE.COM';

-- Verify the change
SELECT * FROM public.profiles WHERE role = 'super_admin';
