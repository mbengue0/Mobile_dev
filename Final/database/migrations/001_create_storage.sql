-- Enable Storage if not already enabled (usually enabled by default on new projects)

-- Create the storage bucket for menu images
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu_images', 'menu_images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Give public access to view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'menu_images' );

-- Policy: Allow authenticated users (Admins) to upload images
CREATE POLICY "Admin Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'menu_images' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow admins to update/delete
CREATE POLICY "Admin Update Access"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'menu_images' AND auth.role() = 'authenticated' );

CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
USING ( bucket_id = 'menu_images' AND auth.role() = 'authenticated' );
