-- Migration 004: Create System Settings Table (Consolidated)
-- Allows super admins to configure meal times and prices from the app
-- Includes permission fixes from deleted migrations 006-008

-- 1. Create Table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 3. GRANT Permissions (Critical for access)
GRANT ALL ON public.system_settings TO postgres;
GRANT ALL ON public.system_settings TO anon;           
GRANT ALL ON public.system_settings TO authenticated;  
GRANT ALL ON public.system_settings TO service_role;   
GRANT ALL ON public.system_settings TO public;         

-- 4. Create Policies
-- Allow EVERYONE to READ (Public settings)
CREATE POLICY "Allow All Read"
ON public.system_settings FOR SELECT
TO public
USING (true);

-- Allow AUTHENTICATED users to INSERT/UPDATE
-- We rely on App Logic to verify super_admin role for writes
CREATE POLICY "Allow Authenticated Write"
ON public.system_settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow Authenticated Insert"
ON public.system_settings FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Insert default settings
INSERT INTO public.system_settings (setting_key, setting_value) VALUES
(
    'meal_times',
    '{"breakfast": {"start": 7, "end": 11}, "lunch": {"start": 12, "end": 15}, "dinner": {"start": 19, "end": 22}}'::jsonb
),
(
    'meal_prices',
    '{"breakfast": 500, "lunch": 1000, "dinner": 800}'::jsonb
)
ON CONFLICT (setting_key) DO UPDATE 
SET setting_value = EXCLUDED.setting_value;

-- 6. Create index and triggers
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(setting_key);

CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE PROCEDURE public.update_updated_at_column();
