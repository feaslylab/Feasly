-- Find and fix any remaining SECURITY DEFINER issues
-- Let's check for functions that might be causing the security definer warnings

-- Query to find functions with SECURITY DEFINER
SELECT 
  p.proname as function_name,
  p.prosecdef as is_security_definer,
  n.nspname as schema_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.prosecdef = true;

-- The issue might be with some of our existing functions
-- Let's specifically check the get_safe_team_member_info function
-- and see if we need to make it less privileged

-- Actually, let's modify the get_safe_team_member_info function to be more restrictive
-- The SECURITY DEFINER might be necessary for this function, but we need to ensure it's safe

-- Instead of using SECURITY DEFINER, let's create a version that relies purely on RLS
DROP FUNCTION IF EXISTS public.get_safe_team_member_info(uuid);

-- Create a safer version without SECURITY DEFINER
-- This function will now rely on the caller's permissions and RLS policies
CREATE OR REPLACE FUNCTION public.get_safe_team_member_info(target_user_id uuid)
RETURNS TABLE(user_id uuid, display_name text, avatar_url text, created_at timestamp with time zone)
LANGUAGE sql
STABLE
-- REMOVED: SECURITY DEFINER - now uses caller's permissions
SET search_path TO 'public'
AS $function$
  -- This function now relies on RLS policies instead of bypassing them
  -- It will only return data that the calling user is authorized to see
  SELECT 
    p.user_id,
    p.full_name as display_name,
    p.avatar_url,
    p.created_at
  FROM profiles p
  WHERE p.user_id = target_user_id;
  -- RLS policies on profiles table will automatically enforce access control
$function$;

-- Update the function comment to reflect the security change
COMMENT ON FUNCTION public.get_safe_team_member_info IS 'SECURITY: Returns safe profile data. Relies on RLS policies for access control instead of SECURITY DEFINER bypass.';

-- Let's also check if there are any other problematic functions we need to address
-- by listing all SECURITY DEFINER functions in our schema