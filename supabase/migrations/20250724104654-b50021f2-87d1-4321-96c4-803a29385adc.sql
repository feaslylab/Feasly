-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.create_default_organization_for_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';