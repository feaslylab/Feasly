-- Create feasly_comments table for collaborative commenting
CREATE TABLE public.feasly_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  section_key text NOT NULL,
  comment text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Ensure each user can only have one comment per section per project
  UNIQUE(project_id, section_key, user_id)
);

-- Enable RLS
ALTER TABLE public.feasly_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comment access
CREATE POLICY "Users can view comments for projects they can access" 
ON public.feasly_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = feasly_comments.project_id 
    AND (projects.user_id = auth.uid() OR projects.is_public = true)
  )
);

CREATE POLICY "Users can insert comments for their accessible projects" 
ON public.feasly_comments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = feasly_comments.project_id 
    AND (projects.user_id = auth.uid() OR projects.is_public = true)
  )
);

CREATE POLICY "Users can update their own comments" 
ON public.feasly_comments 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.feasly_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_feasly_comments_updated_at
BEFORE UPDATE ON public.feasly_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for comments (simplified approach)
ALTER TABLE public.feasly_comments REPLICA IDENTITY FULL;