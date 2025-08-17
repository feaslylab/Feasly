-- Fix security issue: Remove email exposure from profile functions
-- These functions currently expose email addresses to users who share projects/organizations

-- 1. Update get_safe_team_member_info to exclude email
CREATE OR REPLACE FUNCTION public.get_safe_team_member_info(target_user_id uuid)
 RETURNS TABLE(user_id uuid, display_name text, avatar_url text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    p.user_id,
    p.full_name as display_name,
    p.avatar_url,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = target_user_id
  AND (
    -- Allow if requesting user is the target user (own profile with email)
    target_user_id = auth.uid()
    OR
    -- Allow limited info if users share a project team (no email)
    EXISTS (
      SELECT 1 FROM project_team pt1
      JOIN project_team pt2 ON pt1.project_id = pt2.project_id
      WHERE pt1.user_id = auth.uid() AND pt2.user_id = target_user_id
    )
    OR
    -- Allow limited info if users share an organization (no email)
    EXISTS (
      SELECT 1 FROM organization_members om1
      JOIN organization_members om2 ON om1.organization_id = om2.organization_id
      WHERE om1.user_id = auth.uid() AND om2.user_id = target_user_id
    )
  );
$function$;

-- 2. Update get_organization_members_safe to exclude email for non-admins
CREATE OR REPLACE FUNCTION public.get_organization_members_safe(org_id uuid)
 RETURNS TABLE(user_id uuid, display_name text, avatar_url text, role text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    p.user_id,
    p.full_name as display_name,
    p.avatar_url,
    om.role,
    p.created_at
  FROM public.profiles p
  JOIN public.organization_members om ON p.user_id = om.user_id
  WHERE om.organization_id = org_id
  AND is_organization_member(org_id, auth.uid());
$function$;

-- 3. Update get_project_team_members to exclude email
CREATE OR REPLACE FUNCTION public.get_project_team_members(project_id_param uuid)
 RETURNS TABLE(user_id uuid, display_name text, avatar_url text, role text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    p.user_id,
    p.full_name as display_name,
    p.avatar_url,
    pt.role,
    p.created_at
  FROM public.profiles p
  JOIN public.project_team pt ON p.user_id = pt.user_id
  WHERE pt.project_id = project_id_param
  AND is_project_team_member(project_id_param, auth.uid());
$function$;

-- 4. Create a secure function for users to access only their own full profile including email
CREATE OR REPLACE FUNCTION public.get_own_profile()
 RETURNS TABLE(user_id uuid, email text, full_name text, avatar_url text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    p.user_id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.user_id = auth.uid();
$function$;

-- 5. Add additional RLS policy to ensure email column is never directly accessible via table queries
CREATE POLICY "Email addresses are private - users can only see their own"
ON public.profiles
FOR SELECT
USING (
  CASE 
    WHEN current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN true
    ELSE user_id = auth.uid()
  END
);