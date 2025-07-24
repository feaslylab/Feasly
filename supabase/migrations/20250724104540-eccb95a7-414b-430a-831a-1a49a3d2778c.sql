-- Create organizations table
CREATE TABLE public.organizations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organization_members table
CREATE TABLE public.organization_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'member', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(organization_id, user_id)
);

-- Add organization_id to projects table
ALTER TABLE public.projects ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Enable RLS on new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organizations
CREATE POLICY "Users can view organizations they belong to" 
ON public.organizations 
FOR SELECT 
USING (
    id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update organizations they admin" 
ON public.organizations 
FOR UPDATE 
USING (
    id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Users can create organizations" 
ON public.organizations 
FOR INSERT 
WITH CHECK (created_by_user_id = auth.uid());

-- Create RLS policies for organization_members
CREATE POLICY "Users can view members of their organizations" 
ON public.organization_members 
FOR SELECT 
USING (
    organization_id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage organization members" 
ON public.organization_members 
FOR ALL 
USING (
    organization_id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Update projects RLS to support organization-based access
CREATE POLICY "Users can view projects in their organizations" 
ON public.projects 
FOR SELECT 
USING (
    -- Legacy access: projects without organization_id owned by user
    (organization_id IS NULL AND user_id = auth.uid()) 
    OR 
    -- Multi-tenant access: projects in organizations user belongs to
    (organization_id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid()
    ))
);

CREATE POLICY "Users can manage projects in their organizations" 
ON public.projects 
FOR UPDATE, DELETE 
USING (
    -- Legacy access: projects without organization_id owned by user
    (organization_id IS NULL AND user_id = auth.uid()) 
    OR 
    -- Multi-tenant access: projects in organizations user belongs to with appropriate role
    (organization_id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'member')
    ))
);

CREATE POLICY "Users can create projects in their organizations" 
ON public.projects 
FOR INSERT 
WITH CHECK (
    -- Legacy: can create without organization (will auto-assign to default)
    (organization_id IS NULL AND user_id = auth.uid())
    OR
    -- Multi-tenant: can create in organizations they belong to
    (organization_id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'member')
    ))
);

-- Data migration: Create default organizations for existing users
DO $$
DECLARE
    user_record RECORD;
    new_org_id UUID;
BEGIN
    -- For each existing user, create a default organization
    FOR user_record IN 
        SELECT DISTINCT user_id 
        FROM projects 
        WHERE user_id IS NOT NULL
    LOOP
        -- Create default organization
        INSERT INTO organizations (name, slug, created_by_user_id)
        VALUES (
            'Personal Organization',
            'personal-' || SUBSTRING(user_record.user_id::text, 1, 8),
            user_record.user_id
        )
        RETURNING id INTO new_org_id;
        
        -- Add user as admin of their default organization
        INSERT INTO organization_members (organization_id, user_id, role)
        VALUES (new_org_id, user_record.user_id, 'admin');
        
        -- Migrate user's projects to their default organization
        UPDATE projects 
        SET organization_id = new_org_id 
        WHERE user_id = user_record.user_id AND organization_id IS NULL;
    END LOOP;
END $$;

-- Create function to auto-create default org for new users
CREATE OR REPLACE FUNCTION public.create_default_organization_for_user()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
BEGIN
    -- Create default organization for new user
    INSERT INTO organizations (name, slug, created_by_user_id)
    VALUES (
        'Personal Organization',
        'personal-' || SUBSTRING(NEW.id::text, 1, 8),
        NEW.id
    )
    RETURNING id INTO new_org_id;
    
    -- Add user as admin of their default organization
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (new_org_id, NEW.id, 'admin');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create default org for new users
CREATE TRIGGER on_auth_user_created_create_org
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_default_organization_for_user();

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_members_updated_at
    BEFORE UPDATE ON public.organization_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();