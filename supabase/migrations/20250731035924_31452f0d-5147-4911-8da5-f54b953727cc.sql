-- Create scenarios table
CREATE TABLE public.scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  scenario_type TEXT NOT NULL DEFAULT 'base',
  input_data JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- Create policies for scenarios
CREATE POLICY "Users can view scenarios for their projects" 
ON public.scenarios 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = scenarios.project_id 
    AND (projects.user_id = auth.uid() OR projects.is_public = true)
  )
);

CREATE POLICY "Users can create scenarios for their projects" 
ON public.scenarios 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = scenarios.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own scenarios" 
ON public.scenarios 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = scenarios.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own scenarios" 
ON public.scenarios 
FOR DELETE 
USING (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = scenarios.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scenarios_updated_at
BEFORE UPDATE ON public.scenarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_scenarios_project_id ON public.scenarios(project_id);
CREATE INDEX idx_scenarios_user_id ON public.scenarios(user_id);