-- Migration 009: Enable Realtime for System Settings
-- This allows the app to receive instant updates when settings change

BEGIN;

-- Add system_settings table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;

COMMIT;
