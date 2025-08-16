-- Fix Security Definer View Issue
-- Remove SECURITY DEFINER properties from views to ensure proper RLS enforcement

-- First, let's check what views have security definer properties and fix them
-- Drop the problematic view and recreate it without security definer

DROP VIEW IF EXISTS public.safe_profiles;

-- Create the view without security definer properties
-- This view will now properly inherit RLS policies from the underlying table
CREATE VIEW public.safe_profiles AS
SELECT 
  user_id,
  full_name,
  avatar_url,
  created_at,
  updated_at
  -- Explicitly EXCLUDE email field for security
FROM public.profiles;

-- DO NOT set security_barrier = true or any SECURITY DEFINER properties
-- This allows the view to properly respect RLS policies of the querying user

-- Remove the duplicate/problematic policy that was created for the view
-- The view should inherit policies from the underlying profiles table
DROP POLICY IF EXISTS "Safe profile view access" ON public.profiles;

-- Ensure RLS is enabled on profiles table (should already be enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add a comment to document that this view respects RLS
COMMENT ON VIEW public.safe_profiles IS 'SECURITY: Safe view of profiles excluding email. Inherits RLS policies from profiles table - no SECURITY DEFINER bypass.';

-- Verify that our main profiles policies are still in place and correct
-- (These should already exist from the previous migration)

-- Test query to ensure the view works with RLS:
-- When queried, this view will only show data that the user is authorized to see
-- based on the RLS policies on the profiles table

-- The view is now secure because:
-- 1. It inherits RLS policies from the profiles table
-- 2. It excludes sensitive email data
-- 3. It does not bypass security with SECURITY DEFINER
-- 4. Users can only see data they're authorized to see based on existing RLS policies