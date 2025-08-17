-- Fix security issues with RLS policies to restrict anonymous access
-- This migration addresses the security findings by ensuring policies only apply to authenticated users

-- 1. Fix the profiles table RLS policies to be more secure
-- Drop existing policies and recreate them with proper authentication checks
DROP POLICY IF EXISTS "Users view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can only update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only delete their own profile" ON public.profiles;

-- Create new, more secure policies that explicitly require authentication
CREATE POLICY "Authenticated users can view their own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own profile only" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own profile only" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own profile only" 
ON public.profiles 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 2. Fix organization_invitations table to be more secure
DROP POLICY IF EXISTS "Users can accept their own invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Users can view invitations for their organizations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Admins can manage invitations" ON public.organization_invitations;

-- Only allow authenticated users to view their own invitations or manage organization invitations
CREATE POLICY "Authenticated users can view their own invitations" 
ON public.organization_invitations 
FOR SELECT 
TO authenticated 
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR 
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'billing_admin')
  )
);

CREATE POLICY "Organization admins can manage invitations" 
ON public.organization_invitations 
FOR ALL 
TO authenticated 
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'billing_admin')
  )
);

-- 3. Fix other critical tables to only allow authenticated access
-- Fix alert_pref table
DROP POLICY IF EXISTS "Users can only access their own alert preferences" ON public.alert_pref;
CREATE POLICY "Authenticated users can manage their own alert preferences" 
ON public.alert_pref 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Fix email_queue table
DROP POLICY IF EXISTS "Users can only access their own emails" ON public.email_queue;
CREATE POLICY "Authenticated users can manage their own emails" 
ON public.email_queue 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Fix kpi_snapshot table
DROP POLICY IF EXISTS "kpi_snapshot_own_rows" ON public.kpi_snapshot;
CREATE POLICY "Authenticated users can manage their own KPI snapshots" 
ON public.kpi_snapshot 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- 4. Ensure organization_audit_logs is properly secured
DROP POLICY IF EXISTS "Only organization admins can view audit logs" ON public.organization_audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.organization_audit_logs;

CREATE POLICY "Organization admins can view audit logs" 
ON public.organization_audit_logs 
FOR SELECT 
TO authenticated 
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'billing_admin')
  )
);

CREATE POLICY "Authenticated users can insert audit logs" 
ON public.organization_audit_logs 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  (user_id IS NULL OR user_id = auth.uid())
);

-- 5. Create a function to check if a user can access organization data
CREATE OR REPLACE FUNCTION public.can_access_organization(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = org_id AND user_id = auth.uid()
  );
END;
$$;

-- 6. Fix organizations table policies
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;
DROP POLICY IF EXISTS "Users can update organizations they admin" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;

CREATE POLICY "Authenticated users can view their organizations" 
ON public.organizations 
FOR SELECT 
TO authenticated 
USING (can_access_organization(id));

CREATE POLICY "Organization admins can update organizations" 
ON public.organizations 
FOR UPDATE 
TO authenticated 
USING (is_organization_admin(id, auth.uid()));

CREATE POLICY "Authenticated users can create organizations" 
ON public.organizations 
FOR INSERT 
TO authenticated 
WITH CHECK (created_by_user_id = auth.uid());

-- 7. Add comment explaining the security improvements
COMMENT ON TABLE public.profiles IS 'User profiles table with enhanced RLS policies that restrict access to authenticated users only and prevent anonymous access to sensitive user data including email addresses.';

COMMENT ON TABLE public.organization_invitations IS 'Organization invitations table with enhanced security to prevent email harvesting by anonymous users.';

COMMENT ON TABLE public.organization_audit_logs IS 'Audit logs table with restricted access to organization administrators only to protect sensitive business intelligence.';

-- Create an audit entry for this security fix
INSERT INTO organization_audit_logs (
  organization_id, 
  user_id, 
  action, 
  resource_type, 
  details
) 
SELECT 
  om.organization_id,
  auth.uid(),
  'security_fix_applied',
  'database_policies',
  jsonb_build_object(
    'description', 'Applied security fixes to prevent anonymous access to sensitive user data',
    'tables_affected', ARRAY['profiles', 'organization_invitations', 'alert_pref', 'email_queue', 'kpi_snapshot', 'organization_audit_logs', 'organizations'],
    'timestamp', now()
  )
FROM organization_members om 
WHERE om.user_id = auth.uid() 
LIMIT 1;