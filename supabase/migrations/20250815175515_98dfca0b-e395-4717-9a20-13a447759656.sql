-- Remove public project feature entirely for security simplification

-- First drop any policies that depend on is_public column
DROP POLICY IF EXISTS "Public can read public projects" ON public.projects;

-- Now drop the is_public column from projects table
ALTER TABLE public.projects DROP COLUMN IF EXISTS is_public;

-- Drop the public contractor summary function since we no longer need public access
DROP FUNCTION IF EXISTS public.get_public_contractor_summary(uuid);

-- Add comment to projects table to clarify security model
COMMENT ON TABLE public.projects IS 'All projects are private and only accessible to project owners and team members. No public project access is supported for security reasons.';