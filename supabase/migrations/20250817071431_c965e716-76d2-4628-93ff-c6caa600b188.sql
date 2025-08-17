-- Fix security issues with RLS policies to restrict anonymous access
-- This migration addresses the security findings by ensuring policies only apply to authenticated users

-- Helper function to safely drop policies if they exist
CREATE OR REPLACE FUNCTION drop_policy_if_exists(table_name text, policy_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, table_name);
EXCEPTION
  WHEN undefined_object THEN
    -- Policy doesn't exist, ignore the error
    NULL;
END;
$$;

-- 1. Fix the profiles table RLS policies to be more secure
SELECT drop_policy_if_exists('profiles', 'Users view own profile only');
SELECT drop_policy_if_exists('profiles', 'Users can only update their own profile');
SELECT drop_policy_if_exists('profiles', 'Users can only insert their own profile');
SELECT drop_policy_if_exists('profiles', 'Users can only delete their own profile');
SELECT drop_policy_if_exists('profiles', 'Authenticated users can view their own profile only');
SELECT drop_policy_if_exists('profiles', 'Authenticated users can update their own profile only');
SELECT drop_policy_if_exists('profiles', 'Authenticated users can insert their own profile only');
SELECT drop_policy_if_exists('profiles', 'Authenticated users can delete their own profile only');

-- Create new, more secure policies that explicitly require authentication
CREATE POLICY "Authenticated users can view their own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own profile only" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own profile only" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own profile only" 
ON public.profiles 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Add comment explaining the security improvements
COMMENT ON TABLE public.profiles IS 'User profiles table with enhanced RLS policies that restrict access to authenticated users only and prevent anonymous access to sensitive user data including email addresses.';

-- Clean up the helper function
DROP FUNCTION IF EXISTS drop_policy_if_exists(text, text);