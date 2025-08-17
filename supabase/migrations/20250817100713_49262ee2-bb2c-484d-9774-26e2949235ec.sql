-- CRITICAL SECURITY FIX: Restrict access to sensitive business intelligence data
-- The feasly_benchmarks table contains sensitive business metrics that should not be publicly accessible

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Benchmarks are viewable by everyone" ON public.feasly_benchmarks;

-- Create a secure policy that requires authentication
CREATE POLICY "Authenticated users can view benchmarks" 
ON public.feasly_benchmarks 
FOR SELECT 
TO authenticated 
USING (true);

-- Add a comment documenting the security fix
COMMENT ON TABLE public.feasly_benchmarks IS 'SECURITY: Business intelligence data - restricted to authenticated users only to prevent competitive data exposure';

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
  'feasly_benchmarks',
  jsonb_build_object(
    'severity', 'CRITICAL',
    'description', 'Restricted access to sensitive business intelligence data in feasly_benchmarks table',
    'vulnerability', 'Table was publicly readable exposing average ROI, IRR, and profit margins to competitors',
    'fix_applied', 'Changed access from public to authenticated users only',
    'timestamp', now(),
    'data_sensitivity', 'HIGH - Business Intelligence Metrics',
    'tables_affected', ARRAY['feasly_benchmarks']
  )
FROM organization_members om 
WHERE om.role IN ('admin', 'billing_admin');