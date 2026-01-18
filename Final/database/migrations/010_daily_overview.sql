-- Migration: 010_daily_overview
-- description: Allow 'daily_overview' in menu_images meal_type check constraint

-- 1. Drop the existing constraint (Supabase names these automatically, usually menu_images_meal_type_check)
-- We use "IF EXISTS" to avoid errors if the name differs, but we must target the correct specific name if possible.
-- By default, Supabase/Postgres names it {table}_{column}_check.

ALTER TABLE public.menu_images
DROP CONSTRAINT IF EXISTS menu_images_meal_type_check;

-- 2. Add the new constraint including 'daily_overview'
ALTER TABLE public.menu_images
ADD CONSTRAINT menu_images_meal_type_check 
CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'daily_overview'));

-- 3. Add a comment for clarity
COMMENT ON COLUMN public.menu_images.meal_type IS 'Type of meal: breakfast, lunch, dinner, or daily_overview (full day poster)';
