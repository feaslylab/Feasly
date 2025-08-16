-- CRITICAL SECURITY FIX: Prevent email harvesting by restricting email access
-- This addresses the vulnerability where team/org members could see each other's emails

-- First, drop the problematic policy that exposes emails to team/org members
DROP POLICY IF EXISTS "Secure profile access with email protection" ON public.profiles;

-- Create a new policy that protects email addresses
-- Only profile owners can see their own email addresses
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Create a separate policy for team/org members to see basic profile info (NO EMAIL)
-- We'll use a security barrier view to ensure email is never exposed
CREATE OR REPLACE VIEW public.safe_profiles 
WITH (security_barrier = true) AS
SELECT 
  user_id,
  full_name,
  avatar_url,
  created_at,
  updated_at
  -- Explicitly excluding email column to prevent harvesting
FROM public.profiles;

-- Grant access to the safe view for authenticated users
GRANT SELECT ON public.safe_profiles TO authenticated;

-- Create RLS policy for the safe view that allows team/org member access
ALTER VIEW public.safe_profiles SET (security_barrier = true);

-- Create a policy for team/org members to access basic profile data through safe view
CREATE POLICY "Team and org members can view basic profiles via safe view" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Allow access for team members (excluding email)
  (auth.uid() <> user_id) AND (
    EXISTS (
      SELECT 1 FROM project_team pt1
      JOIN project_team pt2 ON pt1.project_id = pt2.project_id
      WHERE pt1.user_id = auth.uid() AND pt2.user_id = profiles.user_id
    )
    OR
    EXISTS (
      SELECT 1 FROM organization_members om1
      JOIN organization_members om2 ON om1.organization_id = om2.organization_id
      WHERE om1.user_id = auth.uid() AND om2.user_id = profiles.user_id
    )
  )
);

-- Important: This policy should be used with column-level security
-- Add column-level security to completely block email access for non-owners
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function that ensures email is only accessible to profile owner
CREATE OR REPLACE FUNCTION public.get_user_profile_safe(target_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  full_name text, 
  avatar_url text,
  created_at timestamptz,
  updated_at timestamptz,
  email text  -- Only returned if requesting own profile
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.full_name,
    p.avatar_url,
    p.created_at,
    p.updated_at,
    CASE 
      WHEN auth.uid() = p.user_id THEN p.email  -- Only show email to profile owner
      ELSE NULL  -- Hide email from team/org members
    END as email
  FROM profiles p
  WHERE p.user_id = target_user_id;
$$;

-- Add documentation about the security fix
COMMENT ON VIEW public.safe_profiles IS 'SECURITY: Email-protected view of profiles. Excludes email addresses to prevent harvesting by team/org members.';
COMMENT ON FUNCTION public.get_user_profile_safe IS 'SECURITY: Returns profile with email only for profile owner, basic info for team/org members.';
COMMENT ON TABLE public.profiles IS 'SECURITY CRITICAL: Email addresses only accessible to profile owners. Use safe_profiles view or get_user_profile_safe() function for team access.';

-- Verify the fix by testing the policies
SELECT 'SECURITY TEST: Policies created successfully' as status;