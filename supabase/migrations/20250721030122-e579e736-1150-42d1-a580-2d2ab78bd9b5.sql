-- Create table to track active modules per user/org
CREATE TABLE public.feasly_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  module_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  enabled_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feasly_modules ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can see their modules" ON feasly_modules
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their modules" ON feasly_modules
FOR ALL USING (auth.uid() = user_id);