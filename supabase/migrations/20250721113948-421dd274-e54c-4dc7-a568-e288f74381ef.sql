-- Create project_contractors table for contractor/vendor tracking
CREATE TABLE public.project_contractors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  name TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('design', 'foundation', 'structure', 'mep', 'facade', 'fit_out', 'landscaping', 'other')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'on_hold', 'cancelled')),
  risk_rating TEXT NOT NULL DEFAULT 'medium' CHECK (risk_rating IN ('low', 'medium', 'high')),
  contact_person TEXT,
  contact_email TEXT,
  start_date DATE,
  expected_completion DATE,
  actual_completion DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.project_contractors ENABLE ROW LEVEL SECURITY;

-- Create policies for contractor access
CREATE POLICY "Users can view contractors for their projects" 
ON public.project_contractors 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = project_contractors.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create contractors for their projects" 
ON public.project_contractors 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = project_contractors.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update contractors for their projects" 
ON public.project_contractors 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = project_contractors.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete contractors for their projects" 
ON public.project_contractors 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = project_contractors.project_id 
  AND projects.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contractors_updated_at
BEFORE UPDATE ON public.project_contractors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();