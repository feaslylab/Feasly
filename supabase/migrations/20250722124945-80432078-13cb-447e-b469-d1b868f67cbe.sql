-- Create forecast_simulations table
CREATE TABLE public.forecast_simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  simulation_name TEXT NOT NULL DEFAULT 'Simulation',
  revenue_delta_percent NUMERIC DEFAULT 0,
  cost_delta_percent NUMERIC DEFAULT 0,
  delay_months INTEGER DEFAULT 0,
  base_irr NUMERIC,
  base_roi NUMERIC,
  base_payback_period INTEGER,
  forecasted_irr NUMERIC,
  forecasted_roi NUMERIC,
  forecasted_payback_period INTEGER,
  simulation_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feasly_alerts table
CREATE TABLE public.feasly_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.forecast_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feasly_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for forecast_simulations
CREATE POLICY "Users can view simulations for their projects"
ON public.forecast_simulations
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = forecast_simulations.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create simulations for their projects"
ON public.forecast_simulations
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = forecast_simulations.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update simulations for their projects"
ON public.forecast_simulations
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = forecast_simulations.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete simulations for their projects"
ON public.forecast_simulations
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = forecast_simulations.project_id 
  AND projects.user_id = auth.uid()
));

-- RLS policies for feasly_alerts
CREATE POLICY "Users can view alerts for their projects"
ON public.feasly_alerts
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = feasly_alerts.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create alerts for their projects"
ON public.feasly_alerts
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = feasly_alerts.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update alerts for their projects"
ON public.feasly_alerts
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = feasly_alerts.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete alerts for their projects"
ON public.feasly_alerts
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = feasly_alerts.project_id 
  AND projects.user_id = auth.uid()
));

-- Add triggers for updated_at
CREATE TRIGGER update_forecast_simulations_updated_at
BEFORE UPDATE ON public.forecast_simulations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feasly_alerts_updated_at
BEFORE UPDATE ON public.feasly_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();