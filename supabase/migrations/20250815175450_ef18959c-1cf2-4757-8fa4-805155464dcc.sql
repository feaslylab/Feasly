-- Remove public project feature entirely for security simplification

-- Drop the is_public column from projects table
ALTER TABLE public.projects DROP COLUMN IF EXISTS is_public;

-- Update any RLS policies that might reference is_public (though our current policies don't seem to use it)
-- The existing policies are already secure as they check project ownership/team membership

-- Drop the public contractor summary function since we no longer need public access
DROP FUNCTION IF EXISTS public.get_public_contractor_summary(uuid);

-- Add comment to projects table to clarify security model
COMMENT ON TABLE public.projects IS 'All projects are private and only accessible to project owners and team members. No public project access is supported for security reasons.';