-- ============================================================================
-- BASELINE SCHEMA (Version 2) - MULTI-TENANT SAAS
-- Generated: 2026-01-30
-- Features: Core, Multi-Tenancy, Settings, Notifications, NabooPay, Daily Menu
-- ============================================================================
-- NOTE: This file replaces all previous migrations (001-015).
-- It is the single source of truth for creating the database from scratch.
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. INSTITUTIONS (SaaS Foundation)
-- ============================================================================
CREATE TABLE public.institutions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL, -- e.g. "DAUST-2025"
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read institution metadata" 
ON public.institutions FOR SELECT USING (true);

-- Seed Default Institution
INSERT INTO public.institutions (name, invite_code)
VALUES ('DAUST', 'DAUST-2025')
ON CONFLICT (invite_code) DO NOTHING;

-- ============================================================================
-- 2. PROFILES & USERS
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  institution_id UUID REFERENCES public.institutions(id) NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  student_id TEXT, -- e.g. ST-2024
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin', 'super_admin')),
  wallet_balance INTEGER DEFAULT 0,
  
  -- Notification Support
  push_token TEXT,
  notifications_enabled BOOLEAN DEFAULT true,
  last_notification_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Indexing
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_student_id ON public.profiles(student_id);
CREATE INDEX idx_profiles_institution_id ON public.profiles(institution_id);

-- ============================================================================
-- 3. TICKETS
-- ============================================================================
CREATE TABLE public.tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  institution_id UUID REFERENCES public.institutions(id) NOT NULL,
  ticket_number TEXT UNIQUE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  meal_date DATE NOT NULL,
  price INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  qr_code_data TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  used_at TIMESTAMP WITH TIME ZONE,
  used_by UUID REFERENCES public.profiles(id)
);

CREATE INDEX idx_tickets_student_id ON public.tickets(student_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_institution_id ON public.tickets(institution_id);

-- ============================================================================
-- 4. WALLET TRANSACTIONS
-- ============================================================================
CREATE TABLE public.wallet_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  institution_id UUID REFERENCES public.institutions(id) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'purchase')),
  description TEXT,
  balance_after INTEGER NOT NULL,
  processed_by UUID REFERENCES public.profiles(id),
  
  -- Payment Provider Support (NabooPay)
  external_reference TEXT UNIQUE,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  provider TEXT DEFAULT 'cashier' CHECK (provider IN ('cashier', 'naboopay')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_ext_ref ON public.wallet_transactions(external_reference);
CREATE INDEX idx_wallet_transactions_institution_id ON public.wallet_transactions(institution_id);

-- ============================================================================
-- 5. MENU IMAGES
-- ============================================================================
CREATE TABLE public.menu_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  institution_id UUID REFERENCES public.institutions(id) NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'daily_overview')),
  menu_date DATE NOT NULL,
  image_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(institution_id, meal_type, menu_date) -- Enforce unique menu per school per day
);

-- ============================================================================
-- 6. SYSTEM SETTINGS
-- ============================================================================
CREATE TABLE public.system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Default Settings
INSERT INTO public.system_settings (setting_key, setting_value) VALUES
('meal_times', '{"breakfast": {"start": 7, "end": 11}, "lunch": {"start": 12, "end": 15}, "dinner": {"start": 19, "end": 22}}'::jsonb),
('meal_prices', '{"breakfast": 500, "lunch": 1000, "dinner": 800}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- 7. NOTIFICATIONS
-- ============================================================================
CREATE TABLE public.notification_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL, 
    data JSONB, 
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Function: Securely get current user's institution (Prevents Recursion)
CREATE OR REPLACE FUNCTION public.get_my_institution_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT institution_id FROM public.profiles WHERE id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function: Check Admin Roles
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

-- Function: Log Notification
CREATE OR REPLACE FUNCTION public.log_notification(
    p_user_id UUID, p_title TEXT, p_body TEXT, p_type TEXT, p_data JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO public.notification_logs (user_id, title, body, type, data)
    VALUES (p_user_id, p_title, p_body, p_type, p_data)
    RETURNING id INTO v_notification_id;
    
    UPDATE public.profiles SET last_notification_at = NOW() WHERE id = p_user_id;
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. BUSINESS LOGIC (ATOMIC FUNCTIONS)
-- ============================================================================

-- A. Handle New User (Smart Assignment Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  v_institution_id UUID;
  v_invite_code TEXT;
  v_full_name TEXT;
BEGIN
  v_invite_code := NEW.raw_user_meta_data->>'invite_code';
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student');

  IF v_invite_code IS NULL OR v_invite_code = '' THEN
    RAISE EXCEPTION 'Registration Failed: School Code is required.';
  END IF;

  SELECT id INTO v_institution_id FROM public.institutions WHERE invite_code = v_invite_code;

  IF v_institution_id IS NULL THEN
    RAISE EXCEPTION 'Invalid School Code (%)', v_invite_code;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, student_id, role, wallet_balance, institution_id)
  VALUES (
    NEW.id, NEW.email, v_full_name,
    'ST-' || LPAD(floor(random() * 100000)::text, 5, '0'),
    'student', 0, v_institution_id
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. Purchase Ticket (Multi-Tenant)
CREATE OR REPLACE FUNCTION purchase_ticket(
  p_student_id UUID, p_meal_type TEXT, p_meal_date DATE, p_price INTEGER
) RETURNS JSON AS $$
DECLARE
  v_balance INTEGER;
  v_inst_id UUID;
  v_new_bal INTEGER;
  v_ticket_id UUID;
  v_ticket_num TEXT;
  v_qr TEXT;
BEGIN
  -- Multi-Tenant Check: Get Institution
  SELECT institution_id, wallet_balance INTO v_inst_id, v_balance 
  FROM profiles WHERE id = p_student_id FOR UPDATE;
  
  IF v_balance IS NULL THEN RETURN json_build_object('success', false, 'error', 'User not found'); END IF;
  IF v_balance < p_price THEN RETURN json_build_object('success', false, 'error', 'Insufficient funds'); END IF;
  
  v_new_bal := v_balance - p_price;
  UPDATE profiles SET wallet_balance = v_new_bal WHERE id = p_student_id;
  
  v_ticket_num := 'TKT-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(floor(random() * 10000)::text, 4, '0');
  v_qr := uuid_generate_v4()::text;
  
  INSERT INTO tickets (institution_id, ticket_number, student_id, meal_type, meal_date, price, qr_code_data, status)
  VALUES (v_inst_id, v_ticket_num, p_student_id, p_meal_type, p_meal_date, p_price, v_qr, 'active')
  RETURNING id INTO v_ticket_id;

  INSERT INTO wallet_transactions (institution_id, user_id, amount, transaction_type, description, balance_after, status, provider)
  VALUES (v_inst_id, p_student_id, -p_price, 'purchase', 'Bought ' || p_meal_type, v_new_bal, 'completed', 'cashier');

  RETURN json_build_object('success', true, 'ticket_id', v_ticket_id, 'new_balance', v_new_bal);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- C. Add Funds (Details: Cashier needs check)
CREATE OR REPLACE FUNCTION add_wallet_funds(
  p_student_id UUID, p_amount INTEGER, p_admin_id UUID
) RETURNS JSON AS $$
DECLARE
  v_new_bal INTEGER;
  v_admin_role TEXT;
  v_student_inst UUID;
  v_admin_inst UUID;
BEGIN
  -- Verify Admin & Institution Match
  SELECT role, institution_id INTO v_admin_role, v_admin_inst FROM profiles WHERE id = p_admin_id;
  SELECT institution_id INTO v_student_inst FROM profiles WHERE id = p_student_id;

  IF v_admin_role NOT IN ('admin', 'super_admin') THEN RETURN json_build_object('success', false, 'error', 'Unauthorized'); END IF;
  
  -- Strict Isolation: Admin cannot fund User from another school
  IF v_admin_role != 'super_admin' AND v_student_inst != v_admin_inst THEN
    RETURN json_build_object('success', false, 'error', 'Organization mismatch'); 
  END IF;

  UPDATE profiles SET wallet_balance = wallet_balance + p_amount WHERE id = p_student_id RETURNING wallet_balance INTO v_new_bal;
  
  INSERT INTO wallet_transactions (institution_id, user_id, amount, transaction_type, description, balance_after, processed_by, status, provider)
  VALUES (v_student_inst, p_student_id, p_amount, 'deposit', 'Wallet top-up', v_new_bal, p_admin_id, 'completed', 'cashier');
  
  RETURN json_build_object('success', true, 'new_balance', v_new_bal);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- D. Confirm Naboo (Webhook)
CREATE OR REPLACE FUNCTION confirm_naboo_payment(p_order_id TEXT) RETURNS JSONB AS $$
DECLARE
  v_rec RECORD;
BEGIN
  SELECT * INTO v_rec FROM wallet_transactions WHERE external_reference = p_order_id;
  
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'message', 'Not found'); END IF;
  IF v_rec.status = 'completed' THEN RETURN jsonb_build_object('success', true, 'message', 'Already completed'); END IF;
  
  UPDATE wallet_transactions SET status = 'completed', description = 'Online Top-Up (Confirmed)' WHERE external_reference = p_order_id;
  UPDATE profiles SET wallet_balance = wallet_balance + v_rec.amount WHERE id = v_rec.user_id;
  
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. ROW LEVEL SECURITY (Final Polish)
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "View Own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins View School" ON profiles FOR SELECT USING (
  institution_id = public.get_my_institution_id() AND public.is_admin_or_super_admin()
);

-- Tickets
CREATE POLICY "View Own Tickets" ON tickets FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Admins View School Tickets" ON tickets FOR SELECT USING (
  institution_id = public.get_my_institution_id() AND public.is_admin_or_super_admin()
);

-- Transaction
CREATE POLICY "View Own Tx" ON wallet_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins View School Tx" ON wallet_transactions FOR SELECT USING (
  institution_id = public.get_my_institution_id() AND public.is_admin_or_super_admin()
);

-- Triggers
CREATE TRIGGER on_auth_user_created BEFORE INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- END OF BASELINE
-- ============================================================================
