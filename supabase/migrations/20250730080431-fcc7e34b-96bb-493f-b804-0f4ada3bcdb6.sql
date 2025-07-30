-- Create organization_members table that is referenced by existing functions
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    permissions JSONB DEFAULT '{}',
    invited_at TIMESTAMP WITH TIME ZONE,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(organization_id, user_id)
);

-- Enable RLS on organization_members
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Create policies for organization_members
CREATE POLICY "Basic member select access" 
ON public.organization_members 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admin can insert members" 
ON public.organization_members 
FOR INSERT 
WITH CHECK (is_organization_admin(organization_id, auth.uid()));

CREATE POLICY "Admin can update members" 
ON public.organization_members 
FOR UPDATE 
USING (is_organization_admin(organization_id, auth.uid()));

CREATE POLICY "Admin can delete members" 
ON public.organization_members 
FOR DELETE 
USING (is_organization_admin(organization_id, auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_organization_members_updated_at
    BEFORE UPDATE ON public.organization_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger to create organization when user signs up
CREATE TRIGGER create_organization_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_default_organization_for_user();