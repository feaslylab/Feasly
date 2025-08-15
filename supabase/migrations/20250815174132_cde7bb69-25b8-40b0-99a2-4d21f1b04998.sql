-- Update database functions to include explicit search paths for security
CREATE OR REPLACE FUNCTION public.update_project_drafts_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  NEW.etag = gen_random_uuid()::text;
  RETURN NEW;
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

CREATE OR REPLACE FUNCTION public.cleanup_expired_reports()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM scenario_reports 
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user_organization()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    new_org_id UUID;
BEGIN
    -- Only create organization if user doesn't already have one
    IF NOT EXISTS (SELECT 1 FROM organization_members WHERE user_id = NEW.id) THEN
        -- Create default organization
        INSERT INTO organizations (name, slug, created_by_user_id)
        VALUES (
            'Personal Organization',
            'personal-' || SUBSTRING(NEW.id::text, 1, 8),
            NEW.id
        )
        RETURNING id INTO new_org_id;
        
        -- Add user as admin
        INSERT INTO organization_members (organization_id, user_id, role)
        VALUES (new_org_id, NEW.id, 'admin');
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.require_auth()
 RETURNS uuid
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(auth.uid(), (SELECT NULL WHERE FALSE)::uuid);
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_default_organization_for_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    new_org_id UUID;
BEGIN
    -- Create default organization for new user
    INSERT INTO public.organizations (name, slug, created_by_user_id)
    VALUES (
        'Personal Organization',
        'personal-' || SUBSTRING(NEW.id::text, 1, 8),
        NEW.id
    )
    RETURNING id INTO new_org_id;
    
    -- Add user as admin of their default organization
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (new_org_id, NEW.id, 'admin');
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_organization_activity(p_organization_id uuid, p_user_id uuid, p_action text, p_resource_type text, p_resource_id text DEFAULT NULL::text, p_details jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO organization_audit_logs (
        organization_id,
        user_id,
        action,
        resource_type,
        resource_id,
        details
    ) VALUES (
        p_organization_id,
        p_user_id,
        p_action,
        p_resource_type,
        p_resource_id,
        p_details
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_invitations()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM organization_invitations 
    WHERE expires_at < now() AND accepted_at IS NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;