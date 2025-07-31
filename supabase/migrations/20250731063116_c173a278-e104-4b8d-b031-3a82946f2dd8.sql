-- Create scenario_results table for caching calculation results
CREATE TABLE IF NOT EXISTS public.scenario_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  scenario_id UUID NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, scenario_id)
);

-- Enable Row Level Security
ALTER TABLE public.scenario_results ENABLE ROW LEVEL SECURITY;

-- Create policies for scenario_results
CREATE POLICY "Users can view scenario results for their projects" 
ON public.scenario_results 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = scenario_results.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can insert scenario results for their projects" 
ON public.scenario_results 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = scenario_results.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update scenario results for their projects" 
ON public.scenario_results 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = scenario_results.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete scenario results for their projects" 
ON public.scenario_results 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = scenario_results.project_id 
  AND projects.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scenario_results_updated_at
BEFORE UPDATE ON public.scenario_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();