-- Remove the conflicting policy that was just added
DROP POLICY IF EXISTS "Email addresses are private - users can only see their own" ON public.profiles;

-- The issue was that the new policy conflicted with existing ones
-- The existing RLS policies on profiles are actually already secure:
-- 1. "Authenticated users can view their own profile only" - USING (auth.uid() = user_id)
-- 2. "Authenticated users can update their own profile only" - USING (auth.uid() = user_id)
-- 3. "Authenticated users can delete their own profile only" - USING (auth.uid() = user_id)
-- 4. "Authenticated users can insert their own profile only" - WITH CHECK (auth.uid() = user_id)

-- The real security issue was with the SECURITY DEFINER functions that bypass RLS
-- Those have already been fixed in the previous migration to exclude email addresses

-- Add a comment for documentation
COMMENT ON TABLE public.profiles IS 'User profiles table with email addresses protected by RLS policies and secure functions';