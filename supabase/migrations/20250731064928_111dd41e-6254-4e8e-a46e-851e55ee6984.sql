-- Create scenario_reports table for PDF report caching
CREATE TABLE public.scenario_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  scenario_id UUID NOT NULL, 
  report_url TEXT,
  file_size BIGINT,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  status TEXT NOT NULL DEFAULT 'generating',
  created_by UUID NOT NULL
);

-- Enable RLS
ALTER TABLE public.scenario_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view reports for their projects" 
ON public.scenario_reports 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = scenario_reports.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create reports for their projects" 
ON public.scenario_reports 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = scenario_reports.project_id 
  AND projects.user_id = auth.uid()
) AND created_by = auth.uid());

CREATE POLICY "Users can update reports for their projects" 
ON public.scenario_reports 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = scenario_reports.project_id 
  AND projects.user_id = auth.uid()
));

-- Add indexes for performance
CREATE INDEX idx_scenario_reports_project_id ON public.scenario_reports(project_id);
CREATE INDEX idx_scenario_reports_scenario_id ON public.scenario_reports(scenario_id);
CREATE INDEX idx_scenario_reports_expires_at ON public.scenario_reports(expires_at);

-- Create cleanup function for expired reports
CREATE OR REPLACE FUNCTION public.cleanup_expired_reports()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM scenario_reports 
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;