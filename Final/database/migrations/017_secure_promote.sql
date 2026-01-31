-- Secure Promote User Function with Limit Check
CREATE OR REPLACE FUNCTION public.promote_user(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_requester_role TEXT;
  v_requester_inst UUID;
  v_target_inst UUID;
  v_max_admins INTEGER;
  v_current_admins INTEGER;
BEGIN
  -- 1. Check Permissions (Requester must be Super Admin or Admin)
  SELECT role, institution_id INTO v_requester_role, v_requester_inst 
  FROM public.profiles WHERE id = auth.uid();

  IF v_requester_role NOT IN ('super_admin', 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- 2. Get Target User Info
  SELECT institution_id INTO v_target_inst FROM public.profiles WHERE id = target_user_id;

  -- 3. Strict Isolation: Cannot promote user from different school
  IF v_requester_role != 'super_admin' AND v_requester_inst != v_target_inst THEN
    RETURN json_build_object('success', false, 'error', 'Organization mismatch');
  END IF;

  -- 4. CHECK PLAN LIMITS (The Fix)
  SELECT max_admins INTO v_max_admins FROM public.institutions WHERE id = v_target_inst;
  
  -- Count existing admins (excluding Super Admins generally, or including? Let's count 'admin' role)
  SELECT COUNT(*) INTO v_current_admins 
  FROM public.profiles 
  WHERE institution_id = v_target_inst AND role IN ('admin', 'super_admin');

  -- Allow if max_admins is NULL (unlimited) or count < max
  IF v_max_admins IS NOT NULL AND v_current_admins >= v_max_admins THEN
    RETURN json_build_object('success', false, 'error', 'Plan limit reached (' || v_max_admins || ' admins max). Upgrade required.');
  END IF;

  -- 5. Perform Promotion
  UPDATE public.profiles SET role = 'admin' WHERE id = target_user_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
