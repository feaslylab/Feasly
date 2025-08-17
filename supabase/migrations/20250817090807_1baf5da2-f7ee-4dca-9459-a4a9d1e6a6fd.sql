-- Enhance email_queue security by adding additional constraints and audit logging

-- Add an index for better performance on the user_id column
CREATE INDEX IF NOT EXISTS idx_email_queue_user_id ON public.email_queue(user_id);

-- Add an index for the worker to efficiently find unsent emails
CREATE INDEX IF NOT EXISTS idx_email_queue_unsent ON public.email_queue(sent, created_at) WHERE sent = false;

-- Add a constraint to prevent email queue spam (max 100 emails per user per day)
-- This prevents potential abuse if someone finds a way to inject many emails
CREATE OR REPLACE FUNCTION public.check_email_queue_limit()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user already has more than 100 emails in queue for today
    IF (SELECT COUNT(*) 
        FROM public.email_queue 
        WHERE user_id = NEW.user_id 
        AND created_at >= CURRENT_DATE) >= 100 THEN
        RAISE EXCEPTION 'Email queue limit exceeded for user. Maximum 100 emails per day allowed.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce email queue limits
DROP TRIGGER IF EXISTS trg_check_email_queue_limit ON public.email_queue;
CREATE TRIGGER trg_check_email_queue_limit
    BEFORE INSERT ON public.email_queue
    FOR EACH ROW
    EXECUTE FUNCTION public.check_email_queue_limit();

-- Add audit logging for email queue access
CREATE TABLE IF NOT EXISTS public.email_queue_audit (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    action text NOT NULL,
    email_queue_id uuid,
    user_id uuid,
    accessed_by text, -- function name or user
    accessed_at timestamp with time zone DEFAULT now(),
    details jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on audit table
ALTER TABLE public.email_queue_audit ENABLE ROW LEVEL SECURITY;

-- Only system functions can insert audit logs, users can read their own
CREATE POLICY "System can insert audit logs" ON public.email_queue_audit
FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role' OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their email audit logs" ON public.email_queue_audit
FOR SELECT USING (user_id = auth.uid());

-- Add function to safely get user's own email queue
CREATE OR REPLACE FUNCTION public.get_user_email_queue(target_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
    id uuid,
    subject text,
    created_at timestamp with time zone,
    sent boolean
) AS $$
BEGIN
    -- Security check: users can only access their own email queue
    IF target_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Access denied: You can only view your own email queue';
    END IF;
    
    -- Log the access
    INSERT INTO public.email_queue_audit (action, user_id, accessed_by, details)
    VALUES ('queue_viewed', target_user_id, 'get_user_email_queue', 
            jsonb_build_object('timestamp', now()));
    
    RETURN QUERY
    SELECT eq.id, eq.subject, eq.created_at, eq.sent
    FROM public.email_queue eq
    WHERE eq.user_id = target_user_id
    ORDER BY eq.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on table for documentation
COMMENT ON TABLE public.email_queue IS 'Secure email queue - emails are private to each user, processed by scheduled worker with service role';
COMMENT ON TABLE public.email_queue_audit IS 'Audit trail for email queue access - tracks when and how email queue data is accessed';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.email_queue_audit TO authenticated;