-- Add RLS policies to allow users to access their own organization memberships
-- This is needed for portfolio creation to work properly

-- Allow users to view their own organization memberships
CREATE POLICY "organization_members_view_own" 
ON public.organization_members 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Allow users to view organizations they are members of
CREATE POLICY "organizations_view_for_members" 
ON public.organizations 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND id IN (
  SELECT organization_id FROM organization_members 
  WHERE user_id = auth.uid()
));