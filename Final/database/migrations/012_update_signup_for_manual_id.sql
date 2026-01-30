-- Migration to allow manual student_id during signup
-- Previously, it was always auto-generated. Now we check metadata first.

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, student_id, role, wallet_balance)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'),
    -- Use provided student_id OR fallback to auto-generated
    COALESCE(
       NEW.raw_user_meta_data->>'student_id', 
       'ST-' || LPAD(floor(random() * 100000)::text, 5, '0')
    ),
    'student',
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
