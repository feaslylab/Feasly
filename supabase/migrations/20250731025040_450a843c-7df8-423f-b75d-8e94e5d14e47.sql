-- Create comment table for real-time collaboration
CREATE TABLE public.comment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  scenario_id uuid,
  user_id uuid NOT NULL,
  target text,            -- e.g. 'construction_item:123'
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.comment ENABLE ROW LEVEL SECURITY;

-- Create policies for comment access
CREATE POLICY "Users can view comments for their projects" 
ON public.comment 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = comment.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can insert comments for their projects" 
ON public.comment 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = comment.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own comments" 
ON public.comment 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.comment 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable realtime for comments
ALTER TABLE public.comment REPLICA IDENTITY FULL;

-- Create trigger for updated_at
CREATE TRIGGER update_comment_updated_at
  BEFORE UPDATE ON public.comment
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();