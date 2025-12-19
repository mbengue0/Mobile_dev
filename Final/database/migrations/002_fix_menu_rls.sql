-- Add UPDATE policy for menu_images so admins can overwrite today's menu
CREATE POLICY "Admins can update menu images"
ON public.menu_images FOR UPDATE
USING (public.is_admin_or_super_admin());

-- Ensure the INSERT policy covers the upsert conflict path if needed (Postgres RLS can be tricky with upserts)
-- The existing INSERT policy is likely fine for new rows.

-- Grant permissions explicitly just in case
GRANT ALL ON public.menu_images TO authenticated;
GRANT SELECT ON public.menu_images TO anon;
