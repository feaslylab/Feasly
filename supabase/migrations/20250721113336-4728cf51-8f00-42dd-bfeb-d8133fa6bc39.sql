-- Create project_milestones table for milestone tracking
CREATE TABLE public.project_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  label TEXT NOT NULL,
  target_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

-- Create policies for milestone access
CREATE POLICY "Users can view milestones for their projects" 
ON public.project_milestones 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = project_milestones.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create milestones for their projects" 
ON public.project_milestones 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = project_milestones.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update milestones for their projects" 
ON public.project_milestones 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = project_milestones.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete milestones for their projects" 
ON public.project_milestones 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = project_milestones.project_id 
  AND projects.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_milestones_updated_at
BEFORE UPDATE ON public.project_milestones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();