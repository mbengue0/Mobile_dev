-- Migration 005: Update validate_ticket to use dynamic meal times
-- This replaces the hardcoded time windows with values from system_settings

CREATE OR REPLACE FUNCTION validate_ticket(
  p_qr_code_data TEXT,
  p_admin_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_ticket RECORD;
  v_admin_role TEXT;
  v_current_hour INTEGER;
  v_is_valid_time BOOLEAN := false;
  v_meal_times JSONB;
  v_start_hour INTEGER;
  v_end_hour INTEGER;
BEGIN
  -- Verify admin privileges
  SELECT role INTO v_admin_role 
  FROM profiles 
  WHERE id = p_admin_id;
  
  IF v_admin_role IS NULL OR v_admin_role NOT IN ('admin', 'super_admin') THEN 
    RETURN json_build_object('success', false, 'error', 'Unauthorized'); 
  END IF;
  
  -- Get ticket details
  SELECT * INTO v_ticket 
  FROM tickets 
  WHERE qr_code_data = p_qr_code_data
  FOR UPDATE;
  
  IF v_ticket IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Ticket not found');
  END IF;
  
  IF v_ticket.status != 'active' THEN
    RETURN json_build_object('success', false, 'error', 'Ticket already used or expired');
  END IF;
  
  -- Get meal times from system settings
  SELECT setting_value INTO v_meal_times
  FROM system_settings
  WHERE setting_key = 'meal_times';
  
  -- If settings not found, use defaults
  IF v_meal_times IS NULL THEN
    v_meal_times := '{"breakfast": {"start": 7, "end": 11}, "lunch": {"start": 12, "end": 15}, "dinner": {"start": 19, "end": 22}}'::jsonb;
  END IF;
  
  -- Get current hour (UTC)
  v_current_hour := EXTRACT(HOUR FROM now() AT TIME ZONE 'UTC');
  
  -- Extract start and end times for the specific meal type
  v_start_hour := (v_meal_times -> v_ticket.meal_type ->> 'start')::INTEGER;
  v_end_hour := (v_meal_times -> v_ticket.meal_type ->> 'end')::INTEGER;
  
  -- Validate time window
  v_is_valid_time := v_current_hour >= v_start_hour AND v_current_hour < v_end_hour;
  
  IF NOT v_is_valid_time THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Invalid time for ' || v_ticket.meal_type,
      'meal_type', v_ticket.meal_type
    );
  END IF;
  
  -- Mark as used
  UPDATE tickets 
  SET status = 'used', used_at = now(), used_by = p_admin_id
  WHERE id = v_ticket.id;
  
  RETURN json_build_object(
    'success', true, 
    'ticket_number', v_ticket.ticket_number,
    'meal_type', v_ticket.meal_type,
    'student_id', v_ticket.student_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
