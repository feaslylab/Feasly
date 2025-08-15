-- Fix Security Definer functions that pose security risks
-- Most of these functions are legitimate (triggers, cleanup functions, helper functions)
-- But some may need review for security best practices

-- The main issue is usually with functions that return data and bypass RLS
-- Let's review and fix any that could be problematic

-- Update get_safe_team_member_info to be more explicit about security
-- This function is actually well-designed with proper access checks
-- But let's make sure it's absolutely secure

DROP FUNCTION IF EXISTS public.get_safe_team_member_info(uuid);

-- Create a safer version that doesn't rely on SECURITY DEFINER
-- Instead, we'll ensure RLS policies handle the security
CREATE OR REPLACE FUNCTION public.get_safe_team_member_info(target_user_id uuid)
RETURNS TABLE(user_id uuid, display_name text, avatar_url text, created_at timestamp with time zone)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
BEGIN
  -- This function now relies on RLS policies for security
  -- rather than SECURITY DEFINER
  
  RETURN QUERY
  SELECT 
    p.user_id,
    p.full_name as display_name,
    p.avatar_url,
    p.created_at
  FROM profiles p
  WHERE p.user_id = target_user_id
    AND (
      -- User can see their own profile
      auth.uid() = target_user_id
      OR
      -- Users can see basic info of team members (but never email)
      EXISTS (
        SELECT 1 FROM project_team pt1
        JOIN project_team pt2 ON pt1.project_id = pt2.project_id
        WHERE pt1.user_id = auth.uid()
          AND pt2.user_id = target_user_id
      )
      OR
      -- Organization members can see each other's basic info
      EXISTS (
        SELECT 1 FROM organization_members om1
        JOIN organization_members om2 ON om1.organization_id = om2.organization_id
        WHERE om1.user_id = auth.uid()
          AND om2.user_id = target_user_id
      )
    );
END;
$$;

-- Comment the remaining SECURITY DEFINER functions to explain why they're needed
COMMENT ON FUNCTION public.cleanup_expired_invitations() IS 'SECURITY DEFINER required: System cleanup function needs elevated privileges to delete expired invitations';
COMMENT ON FUNCTION public.cleanup_expired_reports() IS 'SECURITY DEFINER required: System cleanup function needs elevated privileges to delete expired reports';
COMMENT ON FUNCTION public.handle_new_user_profile() IS 'SECURITY DEFINER required: Auth trigger needs elevated privileges to create user profiles';
COMMENT ON FUNCTION public.handle_new_user_organization() IS 'SECURITY DEFINER required: Auth trigger needs elevated privileges to create default organizations';
COMMENT ON FUNCTION public.create_default_organization_for_user() IS 'SECURITY DEFINER required: Auth trigger needs elevated privileges to create organizations';
COMMENT ON FUNCTION public.is_organization_admin(uuid, uuid) IS 'SECURITY DEFINER required: Helper function for RLS policies needs consistent permissions';
COMMENT ON FUNCTION public.is_organization_member(uuid, uuid) IS 'SECURITY DEFINER required: Helper function for RLS policies needs consistent permissions';
COMMENT ON FUNCTION public.is_project_team_member(uuid, uuid) IS 'SECURITY DEFINER required: Helper function for RLS policies needs consistent permissions';
COMMENT ON FUNCTION public.log_organization_activity(uuid, uuid, text, text, text, jsonb) IS 'SECURITY DEFINER required: Audit logging function needs elevated privileges';
COMMENT ON FUNCTION public.require_auth() IS 'SECURITY DEFINER required: Authentication helper function';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'SECURITY DEFINER required: Trigger function for timestamp updates';
COMMENT ON FUNCTION public.update_project_drafts_updated_at() IS 'SECURITY DEFINER required: Trigger function for timestamp updates';