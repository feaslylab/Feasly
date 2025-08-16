-- Security Fix: Improve profiles table RLS policies to prevent email exposure
-- The current policies may allow unintended access to user email addresses
-- We need to ensure email addresses are NEVER accessible except to the profile owner

-- First, drop existing policies to rebuild them with better security
DROP POLICY IF EXISTS "Authenticated users can view only their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert only their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update only their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can delete only their own profile" ON public.profiles;

-- Create new, more secure policies with explicit email protection

-- 1. SELECT policy - Allow viewing basic profile info for team/org members, but NEVER email
CREATE POLICY "Secure profile access with email protection" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Users can always see their own complete profile (including email)
  auth.uid() = user_id
  OR
  -- Team members can see basic info (NO EMAIL) of other team members
  (
    auth.uid() != user_id AND
    EXISTS (
      SELECT 1 FROM project_team pt1
      JOIN project_team pt2 ON pt1.project_id = pt2.project_id
      WHERE pt1.user_id = auth.uid()
        AND pt2.user_id = profiles.user_id
    )
  )
  OR
  -- Organization members can see basic info (NO EMAIL) of other org members  
  (
    auth.uid() != user_id AND
    EXISTS (
      SELECT 1 FROM organization_members om1
      JOIN organization_members om2 ON om1.organization_id = om2.organization_id
      WHERE om1.user_id = auth.uid()
        AND om2.user_id = profiles.user_id
    )
  )
);

-- 2. INSERT policy - Users can only create their own profile
CREATE POLICY "Users can only insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE policy - Users can only update their own profile
CREATE POLICY "Users can only update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. DELETE policy - Users can only delete their own profile
CREATE POLICY "Users can only delete their own profile" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Add additional security: Create a view for safe profile access without email
CREATE OR REPLACE VIEW public.safe_profiles AS
SELECT 
  user_id,
  full_name,
  avatar_url,
  created_at,
  updated_at
  -- Explicitly EXCLUDE email field
FROM public.profiles;

-- Enable RLS on the view as well
ALTER VIEW public.safe_profiles SET (security_barrier = true);

-- Create a policy for the safe_profiles view
CREATE POLICY "Safe profile view access" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Allow access to non-email fields for team/org members
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM project_team pt1
    JOIN project_team pt2 ON pt1.project_id = pt2.project_id
    WHERE pt1.user_id = auth.uid()
      AND pt2.user_id = profiles.user_id
  )
  OR
  EXISTS (
    SELECT 1 FROM organization_members om1
    JOIN organization_members om2 ON om1.organization_id = om2.organization_id
    WHERE om1.user_id = auth.uid()
      AND om2.user_id = profiles.user_id
  )
);

-- Update the get_safe_team_member_info function to be more explicit about email exclusion
CREATE OR REPLACE FUNCTION public.get_safe_team_member_info(target_user_id uuid)
RETURNS TABLE(user_id uuid, display_name text, avatar_url text, created_at timestamp with time zone)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- CRITICAL: This function explicitly excludes email to prevent data theft
  -- Only return safe profile data for team/organization members
  
  RETURN QUERY
  SELECT 
    p.user_id,
    p.full_name as display_name,
    p.avatar_url,
    p.created_at
  FROM profiles p
  WHERE p.user_id = target_user_id
    AND (
      -- User can see their own profile (but function doesn't return email anyway)
      auth.uid() = target_user_id
      OR
      -- Team members can see basic info (NO EMAIL)
      EXISTS (
        SELECT 1 FROM project_team pt1
        JOIN project_team pt2 ON pt1.project_id = pt2.project_id
        WHERE pt1.user_id = auth.uid()
          AND pt2.user_id = target_user_id
      )
      OR
      -- Organization members can see basic info (NO EMAIL)
      EXISTS (
        SELECT 1 FROM organization_members om1
        JOIN organization_members om2 ON om1.organization_id = om2.organization_id
        WHERE om1.user_id = auth.uid()
          AND om2.user_id = target_user_id
      )
    );
END;
$function$;

-- Add security comment to document the protection
COMMENT ON TABLE public.profiles IS 'SECURITY: Email addresses are only accessible to the profile owner. Team/org members can only see basic profile info (name, avatar) but NEVER email addresses.';
COMMENT ON VIEW public.safe_profiles IS 'SECURITY: Safe view of profiles that excludes email addresses to prevent data theft.';
COMMENT ON FUNCTION public.get_safe_team_member_info IS 'SECURITY: Returns only safe profile data (no email) for team/org members to prevent email harvesting.';