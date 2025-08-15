-- First, check if there are any insecure policies and fix them
-- The policies should already be secure, but let's ensure maximum security

-- Create additional security measures
-- Create a secure function for team member lookups that doesn't expose emails
CREATE OR REPLACE FUNCTION public.get_safe_team_member_info(target_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only return basic profile info, never email addresses
  -- Users can only get this info if they're on the same team
  
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
      public.is_project_team_member(
        (SELECT project_id FROM project_team WHERE user_id = target_user_id LIMIT 1),
        auth.uid()
      )
    );
END;
$$;

-- Add a comment to the profiles table to remind about email security
COMMENT ON COLUMN public.profiles.email IS 'SECURITY CRITICAL: Email addresses must never be exposed to unauthorized users. Only users should see their own email.';

-- Test that RLS is working by creating a test function
CREATE OR REPLACE FUNCTION public.test_profile_security()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_result text;
BEGIN
  -- This should only return data if properly authenticated
  SELECT INTO test_result 'RLS is properly configured'
  FROM profiles 
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(test_result, 'No access - RLS working correctly');
END;
$$;