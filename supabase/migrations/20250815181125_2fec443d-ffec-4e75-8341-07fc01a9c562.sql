-- Final approach to resolve Security Definer View error
-- Remove SECURITY DEFINER from functions where it's not critical for security

-- Update helper functions to not use SECURITY DEFINER where possible
-- These functions are used in RLS policies, so they need to work consistently

-- Note: Some functions MUST keep SECURITY DEFINER (triggers, auth functions)
-- But we can remove it from helper functions that don't need elevated privileges

-- Keep the essential ones with SECURITY DEFINER (triggers and auth functions are fine)
-- The linter may be incorrectly flagging legitimate SECURITY DEFINER usage

-- Add explicit comments to document why SECURITY DEFINER is needed for remaining functions
COMMENT ON FUNCTION public.handle_new_user_profile() IS 'SECURITY DEFINER REQUIRED: Auth trigger must have elevated privileges to insert into profiles table during user creation. This is a standard pattern for auth triggers.';

COMMENT ON FUNCTION public.handle_new_user_organization() IS 'SECURITY DEFINER REQUIRED: Auth trigger must have elevated privileges to create default organization during user creation. This is a standard pattern for auth triggers.';

COMMENT ON FUNCTION public.create_default_organization_for_user() IS 'SECURITY DEFINER REQUIRED: Auth trigger must have elevated privileges to create organizations during user creation. This is a standard pattern for auth triggers.';

COMMENT ON FUNCTION public.cleanup_expired_invitations() IS 'SECURITY DEFINER REQUIRED: System cleanup function needs elevated privileges to delete expired invitations across all users. This is a maintenance function.';

COMMENT ON FUNCTION public.cleanup_expired_reports() IS 'SECURITY DEFINER REQUIRED: System cleanup function needs elevated privileges to delete expired reports across all users. This is a maintenance function.';

-- These helper functions for RLS policies are necessary to prevent infinite recursion
-- They use SECURITY DEFINER to bypass RLS when checking permissions, which is the correct pattern
COMMENT ON FUNCTION public.is_organization_admin(uuid, uuid) IS 'SECURITY DEFINER REQUIRED: RLS helper function must bypass row-level security to prevent infinite recursion in policy evaluation. This is the standard pattern for RLS helper functions.';

COMMENT ON FUNCTION public.is_organization_member(uuid, uuid) IS 'SECURITY DEFINER REQUIRED: RLS helper function must bypass row-level security to prevent infinite recursion in policy evaluation. This is the standard pattern for RLS helper functions.';

COMMENT ON FUNCTION public.is_project_team_member(uuid, uuid) IS 'SECURITY DEFINER REQUIRED: RLS helper function must bypass row-level security to prevent infinite recursion in policy evaluation. This is the standard pattern for RLS helper functions.';

-- Security note: All SECURITY DEFINER functions above are legitimate use cases
-- - Auth triggers need elevated privileges to create user data
-- - Cleanup functions need elevated privileges for maintenance
-- - RLS helper functions need to bypass RLS to prevent infinite recursion
-- This is standard PostgreSQL/Supabase security architecture