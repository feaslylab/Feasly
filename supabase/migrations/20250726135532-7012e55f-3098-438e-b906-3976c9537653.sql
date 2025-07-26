-- Drop ALL existing policies on organization_members that are causing infinite recursion
DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;
DROP POLICY IF EXISTS "Admins can manage members" ON organization_members;
DROP POLICY IF EXISTS "Admins can add members" ON organization_members;
DROP POLICY IF EXISTS "Admins can update members" ON organization_members;
DROP POLICY IF EXISTS "Admins can delete members" ON organization_members;

-- Create a security definer function to safely check if user is an organization member
CREATE OR REPLACE FUNCTION public.is_organization_member(org_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = org_id AND organization_members.user_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a security definer function to safely check if user is an organization admin
CREATE OR REPLACE FUNCTION public.is_organization_admin(org_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = org_id 
    AND organization_members.user_id = user_id 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new simple policies that don't cause recursion
CREATE POLICY "Basic member select access" 
ON organization_members FOR SELECT 
USING (user_id = auth.uid());

-- Allow admins to manage members using security definer functions
CREATE POLICY "Admin can insert members" 
ON organization_members FOR INSERT 
WITH CHECK (public.is_organization_admin(organization_id, auth.uid()));

CREATE POLICY "Admin can update members" 
ON organization_members FOR UPDATE 
USING (public.is_organization_admin(organization_id, auth.uid()));

CREATE POLICY "Admin can delete members" 
ON organization_members FOR DELETE 
USING (public.is_organization_admin(organization_id, auth.uid()));

-- Create a trigger to create default organization for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_organization() 
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created_organization ON auth.users;
CREATE TRIGGER on_auth_user_created_organization
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_organization();