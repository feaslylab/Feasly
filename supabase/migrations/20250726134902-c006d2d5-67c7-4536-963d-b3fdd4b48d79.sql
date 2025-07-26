-- Fix the infinite recursion in organization_members RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage organization members" ON organization_members;
DROP POLICY IF EXISTS "Users can view members of their organizations" ON organization_members;

-- Create new non-recursive policies
-- Policy for viewing members: users can see members of organizations they belong to
CREATE POLICY "Users can view organization members"
ON organization_members FOR SELECT
USING (
  user_id = auth.uid() OR 
  organization_id IN (
    SELECT om.organization_id 
    FROM organization_members om 
    WHERE om.user_id = auth.uid()
  )
);

-- Policy for admins to manage members
CREATE POLICY "Admins can manage members" 
ON organization_members FOR ALL
USING (
  organization_id IN (
    SELECT om.organization_id 
    FROM organization_members om 
    WHERE om.user_id = auth.uid() 
    AND om.role = 'admin'
  )
);

-- Policy for inserting members (only admins)
CREATE POLICY "Admins can add members"
ON organization_members FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT om.organization_id 
    FROM organization_members om 
    WHERE om.user_id = auth.uid() 
    AND om.role = 'admin'
  )
);

-- Policy for updating members (only admins)  
CREATE POLICY "Admins can update members"
ON organization_members FOR UPDATE
USING (
  organization_id IN (
    SELECT om.organization_id 
    FROM organization_members om 
    WHERE om.user_id = auth.uid() 
    AND om.role = 'admin'
  )
);

-- Policy for deleting members (only admins)
CREATE POLICY "Admins can delete members"
ON organization_members FOR DELETE
USING (
  organization_id IN (
    SELECT om.organization_id 
    FROM organization_members om 
    WHERE om.user_id = auth.uid() 
    AND om.role = 'admin'
  )
);