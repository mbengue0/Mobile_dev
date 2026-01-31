-- Add max_admins to institutions
ALTER TABLE public.institutions 
ADD COLUMN max_admins INTEGER DEFAULT 2 NOT NULL;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload';
