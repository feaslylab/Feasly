-- CRITICAL SECURITY FIX: Remove dangerous anonymous access to profiles table
-- This is a critical security vulnerability where anonymous users have full access to user profiles

-- Remove ALL privileges from anonymous role on profiles table
REVOKE ALL PRIVILEGES ON public.profiles FROM anon;

-- Ensure only authenticated users can access the table (but RLS will still apply)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- Verify the table still has RLS enabled (should already be enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Force RLS policies to be checked even for table owner (extra security)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Add additional security check policy to ensure no anonymous access
-- This is a fail-safe in case someone tries to grant anon access again
CREATE POLICY "Block anonymous access to profiles" 
ON public.profiles 
FOR ALL 
TO anon 
USING (false);

-- Add a comment documenting the security fix
COMMENT ON TABLE public.profiles IS 'SECURITY: User profiles table - anonymous access REVOKED, only authenticated users can access their own profiles via RLS policies';

-- Log this critical security fix in audit logs for all organization admins
INSERT INTO public.organization_audit_logs (
  organization_id,
  user_id,
  action,
  resource_type,
  resource_id,
  details
)
SELECT 
  om.organization_id,
  om.user_id,
  'critical_security_fix_applied',
  'database_table',
  'profiles',
  jsonb_build_object(
    'severity', 'CRITICAL',
    'description', 'Removed dangerous anonymous access to profiles table containing user email addresses',
    'vulnerability', 'Anonymous users had full read/write access to all user profiles and email addresses',
    'fix_applied', 'Revoked all anonymous privileges, enforced RLS policies only',
    'timestamp', now(),
    'tables_affected', ARRAY['profiles']
  )
FROM organization_members om 
WHERE om.role IN ('admin', 'billing_admin');