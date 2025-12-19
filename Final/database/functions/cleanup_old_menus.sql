-- Function to clean up old menu images (older than 7 days)
-- This deletes both database records AND storage files

CREATE OR REPLACE FUNCTION cleanup_old_menu_images()
RETURNS TABLE(deleted_count INT, deleted_files TEXT[]) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    old_images RECORD;
    file_name TEXT;
    deleted_files_array TEXT[] := '{}';
    count INT := 0;
BEGIN
    -- Get all menu images older than 7 days
    FOR old_images IN 
        SELECT id, image_url, meal_type, menu_date
        FROM public.menu_images
        WHERE menu_date < CURRENT_DATE - INTERVAL '7 days'
    LOOP
        -- Extract filename from URL
        -- URL format: https://...supabase.co/storage/v1/object/public/menu_images/FILENAME.jpg
        file_name := substring(old_images.image_url from '/menu_images/(.+)$');
        
        -- Delete from storage
        PERFORM storage.delete_object('menu_images', file_name);
        
        -- Add to deleted files array
        deleted_files_array := array_append(deleted_files_array, file_name);
        count := count + 1;
    END LOOP;
    
    -- Delete from database
    DELETE FROM public.menu_images
    WHERE menu_date < CURRENT_DATE - INTERVAL '7 days';
    
    -- Return results
    RETURN QUERY SELECT count, deleted_files_array;
END;
$$;

-- Grant execute permission to authenticated users (admins can call this)
GRANT EXECUTE ON FUNCTION cleanup_old_menu_images() TO authenticated;

-- To run manually, execute:
-- SELECT * FROM cleanup_old_menu_images();

-- To set up automatic daily cleanup, you can:
-- Option 1: Use Supabase Dashboard > Database > Cron Jobs (if available)
--           Schedule: 0 2 * * * (runs at 2 AM daily)
--           SQL: SELECT cleanup_old_menu_images();
--
-- Option 2: Call this from your app on admin login or via Edge Function
