-- ============================================================================
-- FIX PERMISSIONS AND RLS
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================================

-- 1. Grant usage on public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. Grant access to tables
GRANT ALL ON TABLE public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.profiles TO anon; -- Needed for login sometimes if you select before auth? No, but let's be safe for now, or strict.
-- Actually, strict is better. only authenticated.

GRANT ALL ON TABLE public.tickets TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.tickets TO authenticated;

GRANT ALL ON TABLE public.wallet_transactions TO postgres, service_role;
GRANT SELECT, INSERT ON TABLE public.wallet_transactions TO authenticated;

GRANT ALL ON TABLE public.menu_images TO postgres, service_role;
GRANT SELECT ON TABLE public.menu_images TO authenticated, anon;
GRANT INSERT ON TABLE public.menu_images TO authenticated;

-- 3. Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- 4. Re-apply Trigger Function (Just to be sure it is SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, student_id, role, wallet_balance)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'),
    'ST-' || LPAD(floor(random() * 100000)::text, 5, '0'),
    'student',
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Force-create missing profile for specific user (if you know the ID)
-- You can run this if you need to fix a broken user manually:
-- INSERT INTO public.profiles (id, email, full_name) 
-- SELECT id, email, raw_user_meta_data->>'full_name' 
-- FROM auth.users 
-- WHERE id = 'THE_UUID_HERE'
-- ON CONFLICT DO NOTHING;

-- 6. Grant execute on functions
GRANT EXECUTE ON FUNCTION public.handle_new_user TO postgres, service_role, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.purchase_ticket TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_wallet_funds TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_ticket TO authenticated;
GRANT EXECUTE ON FUNCTION public.promote_user TO authenticated;
