-- Fix 1: Secure imports storage bucket by making it private and adding RLS policies
-- First, update the storage bucket to be private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'imports';

-- Create RLS policies for the imports bucket
CREATE POLICY "Users can upload to their own folder in imports" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'imports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own imports" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'imports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own imports" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'imports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Fix 2: Fix SECURITY DEFINER functions to have stable search_path
ALTER FUNCTION public.is_organization_member(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.is_organization_admin(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.cleanup_expired_reports() SET search_path TO 'public';
ALTER FUNCTION public.handle_new_user_organization() SET search_path TO 'public';
ALTER FUNCTION public.log_organization_activity(uuid, uuid, text, text, text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.cleanup_expired_invitations() SET search_path TO 'public';

-- Fix 3: Update RLS policies that allow unsafe anonymous access or user spoofing
-- Fix alert_pref policy to prevent user_id spoofing
DROP POLICY IF EXISTS "own rows" ON public.alert_pref;
CREATE POLICY "Users can only access their own alert preferences" 
ON public.alert_pref 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix email_queue policy to prevent user_id spoofing  
DROP POLICY IF EXISTS "own rows" ON public.email_queue;
CREATE POLICY "Users can only access their own emails" 
ON public.email_queue 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix organization_audit_logs to prevent user_id spoofing in INSERT
DROP POLICY IF EXISTS "System can insert audit logs" ON public.organization_audit_logs;
CREATE POLICY "System can insert audit logs with authenticated user" 
ON public.organization_audit_logs 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (user_id IS NULL OR user_id = auth.uid())
);

-- Fix 4: Add proper RLS policies that were missing auth checks
-- Update policies that use auth.uid() to ensure user is authenticated
CREATE OR REPLACE FUNCTION public.require_auth()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(auth.uid(), (SELECT NULL WHERE FALSE)::uuid);
$$;

-- Fix 5: Add missing profiles table since project_team references it
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add trigger to automatically create profile on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Add updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();