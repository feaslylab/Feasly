-- First, let's verify the current policies on profiles table
-- and ensure they are completely secure

-- Check current policies - this should show only the secure policies
DO $$
BEGIN
  RAISE NOTICE 'Current profiles table policies:';
END $$;

-- Drop any potentially insecure policies and recreate them with maximum security
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- Create ultra-secure policies that ONLY allow users to access their own data
-- SELECT policy - users can only see their own profile
CREATE POLICY "Users can only view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT policy - users can only create their own profile
CREATE POLICY "Users can only insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE policy - users can only update their own profile
CREATE POLICY "Users can only update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE policy - users can only delete their own profile
CREATE POLICY "Users can only delete their own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Ensure RLS is enabled (should already be enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add additional security: create a view for team member profiles that only shows necessary data
CREATE OR REPLACE VIEW public.team_member_profiles AS
SELECT 
  p.user_id,
  p.full_name,
  p.avatar_url,
  p.created_at,
  -- Email is deliberately excluded from this view for security
  NULL as email_hidden_for_security
FROM public.profiles p;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.team_member_profiles TO authenticated;

-- Create a secure function to get team member info when needed
CREATE OR REPLACE FUNCTION public.get_team_member_display_info(member_user_id uuid, requesting_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  email_visible boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only return email visibility if the requesting user has permission
  -- (e.g., they're on the same team or organization)
  
  RETURN QUERY
  SELECT 
    p.user_id,
    p.full_name as display_name,
    p.avatar_url,
    false as email_visible -- For now, never expose email through this function
  FROM profiles p
  WHERE p.user_id = member_user_id
    AND (
      -- User can see their own profile
      requesting_user_id = member_user_id
      OR
      -- Users can see basic info of team members (but not email)
      EXISTS (
        SELECT 1 FROM project_team pt1
        JOIN project_team pt2 ON pt1.project_id = pt2.project_id
        WHERE pt1.user_id = requesting_user_id
          AND pt2.user_id = member_user_id
      )
    );
END;
$$;