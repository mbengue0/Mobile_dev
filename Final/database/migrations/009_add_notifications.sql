-- Migration 009: Add Push Notification Support
-- Adds push token storage and notification logging capabilities

-- 1. Add notification columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS push_token TEXT,
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_notification_at TIMESTAMP WITH TIME ZONE;

-- 2. Create notification_logs table
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL, -- 'ticket_purchase', 'wallet_topup', 'system_alert', etc.
    data JSONB, -- Additional metadata
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Enable RLS on notification_logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for notification_logs

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notification_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications"
ON public.notification_logs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- System can insert notifications for any user
CREATE POLICY "System can insert notifications"
ON public.notification_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
ON public.notification_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id 
ON public.notification_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at 
ON public.notification_logs(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_logs_type 
ON public.notification_logs(type);

CREATE INDEX IF NOT EXISTS idx_profiles_push_token 
ON public.profiles(push_token) 
WHERE push_token IS NOT NULL;

-- 6. Create function to log notifications
CREATE OR REPLACE FUNCTION public.log_notification(
    p_user_id UUID,
    p_title TEXT,
    p_body TEXT,
    p_type TEXT,
    p_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO public.notification_logs (user_id, title, body, type, data)
    VALUES (p_user_id, p_title, p_body, p_type, p_data)
    RETURNING id INTO v_notification_id;
    
    -- Update last_notification_at on user profile
    UPDATE public.profiles
    SET last_notification_at = NOW()
    WHERE id = p_user_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant execute permission on function
GRANT EXECUTE ON FUNCTION public.log_notification TO authenticated;
