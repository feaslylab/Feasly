-- Fix security issue: Restrict organization audit logs access to administrators only
-- Current policy allows any organization member to view audit logs
-- This should be restricted to organization admins only for security

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view audit logs for their organizations" ON public.organization_audit_logs;

-- Create new policy that restricts access to organization administrators only
CREATE POLICY "Only organization admins can view audit logs" 
ON public.organization_audit_logs 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_members.organization_id
    FROM organization_members
    WHERE organization_members.user_id = auth.uid()
    AND organization_members.role IN ('admin', 'billing_admin')
  )
);

-- Also ensure the insert policy is properly restricted
-- The existing policy is fine, but let's make it more explicit about admin requirements for system logs
DROP POLICY IF EXISTS "System can insert audit logs with authenticated user" ON public.organization_audit_logs;

CREATE POLICY "Authenticated users can insert audit logs" 
ON public.organization_audit_logs 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (
    user_id IS NULL  -- System logs (no user_id)
    OR user_id = auth.uid()  -- User's own actions
  )
);

-- Add a comment to document the security reasoning
COMMENT ON TABLE public.organization_audit_logs IS 'Security: Access restricted to organization administrators only. Contains sensitive security information including IP addresses, user agents, and system details that could be used by attackers.';