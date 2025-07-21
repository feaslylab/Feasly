-- Create table for storing feasly insights and notes
CREATE TABLE public.feasly_insights_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  scenario TEXT NOT NULL,
  generated_insights JSONB,
  user_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feasly_insights_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view insights for their own projects" 
ON public.feasly_insights_notes 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = feasly_insights_notes.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create insights for their own projects" 
ON public.feasly_insights_notes 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = feasly_insights_notes.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update insights for their own projects" 
ON public.feasly_insights_notes 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = feasly_insights_notes.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete insights for their own projects" 
ON public.feasly_insights_notes 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = feasly_insights_notes.project_id 
  AND projects.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_feasly_insights_notes_updated_at
BEFORE UPDATE ON public.feasly_insights_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();