-- ============================================================================
-- DAUST CAFETERIA SYSTEM - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- This schema implements a production-grade cafeteria ticketing system with:
-- - Atomic financial transactions
-- - Role-based access control (RLS)
-- - Self-healing user profile creation
-- - Time-based meal validation
-- - Offline-first support via proper indexing
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CORE TABLES
-- ============================================================================

-- Profiles Table: User information and wallet
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  student_id TEXT UNIQUE, -- Auto-generated ST-XXXX
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin', 'super_admin')),
  wallet_balance INTEGER DEFAULT 0, -- Amount in FCFA (CFA Francs)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tickets Table: Meal tickets with QR codes
CREATE TABLE public.tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  meal_date DATE NOT NULL,
  price INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  qr_code_data TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  used_at TIMESTAMP WITH TIME ZONE,
  used_by UUID REFERENCES public.profiles(id) -- Admin who scanned the ticket
);

-- Wallet Transactions Table: Complete audit trail
CREATE TABLE public.wallet_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- Positive for deposits, negative for purchases
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'purchase')),
  description TEXT,
  balance_after INTEGER NOT NULL,
  processed_by UUID REFERENCES public.profiles(id), -- Admin who processed (for deposits)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Menu Images Table: Daily menu storage
CREATE TABLE public.menu_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  menu_date DATE NOT NULL,
  image_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(meal_type, menu_date)
);

-- ============================================================================
-- 2. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_tickets_student_id ON public.tickets(student_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_meal_date ON public.tickets(meal_date);
CREATE INDEX idx_tickets_qr_code ON public.tickets(qr_code_data);
CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_student_id ON public.profiles(student_id);

-- ============================================================================
-- 3. TRIGGERS - AUTO-CONFIRMATION & PROFILE CREATION
-- ============================================================================

-- Trigger 1: Auto-confirm email (bypass email verification)
CREATE OR REPLACE FUNCTION public.auto_confirm_user() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_confirm 
BEFORE INSERT ON auth.users
FOR EACH ROW 
EXECUTE PROCEDURE public.auto_confirm_user();

-- Trigger 2: Auto-create profile (self-healing mechanism)
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
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate key errors
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_profile 
AFTER INSERT ON auth.users
FOR EACH ROW 
EXECUTE PROCEDURE public.handle_new_user();

-- Trigger 3: Update timestamp on profile changes
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at 
BEFORE UPDATE ON public.profiles
FOR EACH ROW 
EXECUTE PROCEDURE public.update_updated_at_column();

-- ============================================================================
-- 4. ATOMIC FUNCTIONS - FINANCIAL SECURITY
-- ============================================================================

-- Function 1: Purchase Ticket (Atomic Transaction)
CREATE OR REPLACE FUNCTION purchase_ticket(
  p_student_id UUID, 
  p_meal_type TEXT, 
  p_meal_date DATE, 
  p_price INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_balance INTEGER;
  v_ticket_id UUID;
  v_ticket_number TEXT;
  v_qr_code TEXT;
BEGIN
  -- Lock the profile row to prevent race conditions
  SELECT wallet_balance INTO v_balance 
  FROM profiles 
  WHERE id = p_student_id 
  FOR UPDATE;
  
  -- Check sufficient funds
  IF v_balance IS NULL THEN 
    RETURN json_build_object('success', false, 'error', 'User not found'); 
  END IF;
  
  IF v_balance < p_price THEN 
    RETURN json_build_object('success', false, 'error', 'Insufficient funds'); 
  END IF;
  
  -- Deduct from wallet
  UPDATE profiles 
  SET wallet_balance = wallet_balance - p_price 
  WHERE id = p_student_id;
  
  -- Generate unique identifiers
  v_ticket_number := 'TKT-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(floor(random() * 10000)::text, 4, '0');
  v_qr_code := uuid_generate_v4()::text;
  
  -- Create ticket
  INSERT INTO tickets (ticket_number, student_id, meal_type, meal_date, price, qr_code_data, status)
  VALUES (v_ticket_number, p_student_id, p_meal_type, p_meal_date, p_price, v_qr_code, 'active')
  RETURNING id INTO v_ticket_id;

  -- Record transaction
  INSERT INTO wallet_transactions (user_id, amount, transaction_type, description, balance_after)
  VALUES (p_student_id, -p_price, 'purchase', 'Bought ' || p_meal_type || ' ticket', v_balance - p_price);

  RETURN json_build_object(
    'success', true, 
    'ticket_id', v_ticket_id,
    'ticket_number', v_ticket_number,
    'qr_code_data', v_qr_code,
    'new_balance', v_balance - p_price
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Add Wallet Funds (Admin Only)
CREATE OR REPLACE FUNCTION add_wallet_funds(
  p_student_id UUID, 
  p_amount INTEGER, 
  p_admin_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_new_balance INTEGER;
  v_admin_role TEXT;
BEGIN
  -- Verify admin privileges
  SELECT role INTO v_admin_role 
  FROM profiles 
  WHERE id = p_admin_id;
  
  IF v_admin_role IS NULL OR v_admin_role NOT IN ('admin', 'super_admin') THEN 
    RETURN json_build_object('success', false, 'error', 'Unauthorized'); 
  END IF;
  
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid amount');
  END IF;

  -- Add funds
  UPDATE profiles 
  SET wallet_balance = wallet_balance + p_amount 
  WHERE id = p_student_id 
  RETURNING wallet_balance INTO v_new_balance;
  
  IF v_new_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Student not found');
  END IF;
  
  -- Record transaction
  INSERT INTO wallet_transactions (user_id, amount, transaction_type, description, balance_after, processed_by)
  VALUES (p_student_id, p_amount, 'deposit', 'Wallet top-up by admin', v_new_balance, p_admin_id);
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Validate and Use Ticket (Scanner)
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
  
  -- Time validation (UTC-based, adjust as needed)
  v_current_hour := EXTRACT(HOUR FROM now() AT TIME ZONE 'UTC');
  
  CASE v_ticket.meal_type
    WHEN 'breakfast' THEN
      v_is_valid_time := v_current_hour >= 7 AND v_current_hour < 11;
    WHEN 'lunch' THEN
      v_is_valid_time := v_current_hour >= 12 AND v_current_hour < 15;
    WHEN 'dinner' THEN
      v_is_valid_time := v_current_hour >= 19 AND v_current_hour < 22;
  END CASE;
  
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

-- Function 3.5: Bulk Purchase Tickets (Atomic Cart Checkout)
CREATE OR REPLACE FUNCTION purchase_tickets_bulk(
  p_student_id UUID,
  p_items JSONB -- Array of {type, quantity, price, date}
)
RETURNS JSON AS $$
DECLARE
  v_balance INTEGER;
  v_total_cost INTEGER := 0;
  v_item JSONB;
  v_qty INTEGER;
  v_price INTEGER;
  v_type TEXT;
  v_date DATE;
  v_desc_parts TEXT[] := ARRAY[]::TEXT[];
  v_final_desc TEXT;
  v_ticket_number TEXT;
  v_qr_code TEXT;
  v_i INTEGER;
BEGIN
  -- 1. Calculate Total Cost & Build Description
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := (v_item->>'quantity')::INTEGER;
    v_price := (v_item->>'price')::INTEGER;
    v_type := v_item->>'type';
    
    IF v_qty > 0 THEN
      v_total_cost := v_total_cost + (v_price * v_qty);
      v_desc_parts := array_append(v_desc_parts, v_qty || ' ' || v_type);
    END IF;
  END LOOP;

  IF v_total_cost = 0 THEN
    RETURN json_build_object('success', false, 'error', 'Cart is empty');
  END IF;

  v_final_desc := 'Purchase: ' || array_to_string(v_desc_parts, ', ');

  -- 2. Lock & Check Balance
  SELECT wallet_balance INTO v_balance 
  FROM profiles 
  WHERE id = p_student_id 
  FOR UPDATE;
  
  IF v_balance IS NULL THEN 
    RETURN json_build_object('success', false, 'error', 'User not found'); 
  END IF;
  
  IF v_balance < v_total_cost THEN 
    RETURN json_build_object('success', false, 'error', 'Insufficient funds'); 
  END IF;

  -- 3. Deduct Balance
  UPDATE profiles 
  SET wallet_balance = wallet_balance - v_total_cost 
  WHERE id = p_student_id;

  -- 4. Insert Tickets
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := (v_item->>'quantity')::INTEGER;
    v_price := (v_item->>'price')::INTEGER;
    v_type := v_item->>'type';
    v_date := (v_item->>'date')::DATE;
    
    FOR v_i IN 1..v_qty LOOP
      v_ticket_number := 'TKT-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(floor(random() * 10000)::text, 4, '0');
      v_qr_code := uuid_generate_v4()::text;
      
      INSERT INTO tickets (ticket_number, student_id, meal_type, meal_date, price, qr_code_data, status)
      VALUES (v_ticket_number, p_student_id, v_type, v_date, v_price, v_qr_code, 'active');
    END LOOP;
  END LOOP;

  -- 5. Record Transaction
  INSERT INTO wallet_transactions (user_id, amount, transaction_type, description, balance_after)
  VALUES (p_student_id, -v_total_cost, 'purchase', v_final_desc, v_balance - v_total_cost);

  RETURN json_build_object(
    'success', true, 
    'new_balance', v_balance - v_total_cost,
    'message', 'Successfully purchased tickets'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 4: Promote User to Admin (Super Admin Only)
CREATE OR REPLACE FUNCTION promote_user(target_user_id UUID)
RETURNS JSON AS $$
BEGIN
  -- Security Check
  IF NOT public.is_super_admin() THEN 
    RETURN json_build_object('success', false, 'error', 'Unauthorized'); 
  END IF;

  UPDATE profiles SET role = 'admin' WHERE id = target_user_id;
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_images ENABLE ROW LEVEL SECURITY;

-- Helper Functions for RLS (Prevent Infinite Recursion)
CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.is_admin_or_super_admin());

CREATE POLICY "Super admins can update roles" 
ON public.profiles FOR UPDATE 
USING (public.is_super_admin());

-- Tickets Policies
CREATE POLICY "Users can view own tickets" 
ON public.tickets FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Admins can view all tickets" 
ON public.tickets FOR SELECT 
USING (public.is_admin_or_super_admin());

CREATE POLICY "Users can insert own tickets via function" 
ON public.tickets FOR INSERT 
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can update tickets" 
ON public.tickets FOR UPDATE 
USING (public.is_admin_or_super_admin());

-- Wallet Transactions Policies
CREATE POLICY "Users can view own transactions" 
ON public.wallet_transactions FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions" 
ON public.wallet_transactions FOR SELECT 
USING (public.is_admin_or_super_admin());

CREATE POLICY "System can insert transactions" 
ON public.wallet_transactions FOR INSERT 
WITH CHECK (true); -- Controlled by SECURITY DEFINER functions

-- Menu Images Policies
CREATE POLICY "Everyone can view menu images" 
ON public.menu_images FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert menu images" 
ON public.menu_images FOR INSERT 
WITH CHECK (public.is_admin_or_super_admin());

-- ============================================================================
-- 6. REALTIME SUBSCRIPTIONS (Optional)
-- ============================================================================

-- Enable realtime for tickets (so students see ticket updates instantly)
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- To apply this schema:
-- 1. Copy this entire file
-- 2. Go to Supabase Dashboard > SQL Editor
-- 3. Paste and run
-- 4. Verify all tables, functions, and policies are created
-- ============================================================================
