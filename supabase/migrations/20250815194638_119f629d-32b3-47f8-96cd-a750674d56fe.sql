-- Fix security issue: Prevent anonymous access to user profile data
-- Current policies allow anonymous users to potentially access profile data
-- Need to explicitly check for authenticated users

-- Drop existing policies that may allow anonymous access
DROP POLICY IF EXISTS "Users can only view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only delete their own profile" ON public.profiles;

-- Create new policies that explicitly require authentication
CREATE POLICY "Authenticated users can view only their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert only their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update only their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete only their own profile" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Add comment to document the security reasoning
COMMENT ON TABLE public.profiles IS 'Security: Access restricted to authenticated users only. Users can only access their own profile data to prevent email harvesting and privacy violations.';