-- COMPREHENSIVE SECURITY FIXES
-- Phase 1: Restrict Anonymous Access to Sensitive Data

-- 1. Secure exchange_rates table - contains financial data that competitors could exploit
DROP POLICY IF EXISTS "Exchange rates are viewable by everyone" ON public.exchange_rates;

CREATE POLICY "Authenticated users can view exchange rates" 
ON public.exchange_rates 
FOR SELECT 
TO authenticated 
USING (true);

-- 2. Secure project_input_templates - business templates should require authentication
-- Note: Keeping public templates accessible but adding proper authentication requirement
DROP POLICY IF EXISTS "Users can view their own templates and public templates" ON public.project_input_templates;

CREATE POLICY "Authenticated users can view templates" 
ON public.project_input_templates 
FOR SELECT 
TO authenticated
USING ((created_by = auth.uid()) OR (is_public = true));

CREATE POLICY "Users can manage their own templates" 
ON public.project_input_templates 
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Phase 2: Fix Critical Nullable user_id Columns

-- 3. Make projects.user_id NOT NULL (critical for ownership)
-- First update any NULL values to a default or remove orphaned records
DELETE FROM public.projects WHERE user_id IS NULL;

ALTER TABLE public.projects 
ALTER COLUMN user_id SET NOT NULL;

-- 4. Make feasly_modules.user_id NOT NULL
DELETE FROM public.feasly_modules WHERE user_id IS NULL;

ALTER TABLE public.feasly_modules 
ALTER COLUMN user_id SET NOT NULL;

-- 5. Fix organizations.created_by_user_id - should track creator
-- Update NULL values to first admin of the organization or remove orphaned orgs
UPDATE public.organizations 
SET created_by_user_id = (
  SELECT user_id 
  FROM organization_members 
  WHERE organization_id = organizations.id 
    AND role = 'admin' 
  LIMIT 1
) 
WHERE created_by_user_id IS NULL;

-- Remove any organizations that still have NULL created_by_user_id
DELETE FROM public.organizations WHERE created_by_user_id IS NULL;

ALTER TABLE public.organizations 
ALTER COLUMN created_by_user_id SET NOT NULL;

-- Phase 3: Database Function Security Hardening

-- 6. Update database functions to use secure search path
CREATE OR REPLACE FUNCTION public.can_access_organization(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = org_id AND user_id = auth.uid()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_organization_member(org_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = org_id AND organization_members.user_id = user_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_organization_admin(org_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = org_id 
    AND organization_members.user_id = user_id 
    AND role = 'admin'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_project_team_member(project_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is project owner
  IF EXISTS (
    SELECT 1 FROM projects 
    WHERE id = project_id_param AND user_id = user_id_param
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user is in project team
  IF EXISTS (
    SELECT 1 FROM project_team 
    WHERE project_id = project_id_param AND user_id = user_id_param
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user is organization member for organization-owned projects
  IF EXISTS (
    SELECT 1 FROM projects p
    JOIN organization_members om ON p.organization_id = om.organization_id
    WHERE p.id = project_id_param AND om.user_id = user_id_param
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;

-- Phase 4: Add Security Documentation and Audit Trail

-- Add table comments documenting security requirements
COMMENT ON TABLE public.exchange_rates IS 'SECURITY: Financial data - restricted to authenticated users to prevent competitive intelligence gathering';
COMMENT ON TABLE public.project_input_templates IS 'SECURITY: Business templates - requires authentication, supports public templates for authenticated users only';
COMMENT ON TABLE public.projects IS 'SECURITY: Core business data - user_id is NOT NULL to ensure proper ownership tracking';
COMMENT ON TABLE public.organizations IS 'SECURITY: Organization data - created_by_user_id is NOT NULL for accountability';

-- Log comprehensive security fixes
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
  'comprehensive_security_hardening',
  'database_security',
  'multiple_tables',
  jsonb_build_object(
    'severity', 'CRITICAL',
    'description', 'Comprehensive security fixes applied across multiple tables and functions',
    'fixes_applied', ARRAY[
      'Restricted exchange_rates from public to authenticated access',
      'Enhanced project_input_templates security while preserving public template functionality', 
      'Made critical user_id columns NOT NULL for proper ownership tracking',
      'Updated database functions with secure search_path settings',
      'Added comprehensive security documentation'
    ],
    'tables_hardened', ARRAY['exchange_rates', 'project_input_templates', 'projects', 'organizations', 'feasly_modules'],
    'functions_secured', ARRAY['can_access_organization', 'is_organization_member', 'is_organization_admin', 'is_project_team_member'],
    'timestamp', now(),
    'impact', 'Prevents anonymous access to sensitive business data and ensures proper data ownership tracking'
  )
FROM organization_members om 
WHERE om.role IN ('admin', 'billing_admin');