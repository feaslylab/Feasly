-- Sprint P2: Add risk variations tracking table
CREATE TABLE IF NOT EXISTS public.risk_variations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  scenario_id UUID NOT NULL,
  cost_variation_percent NUMERIC NOT NULL DEFAULT 0,
  sale_price_variation_percent NUMERIC NOT NULL DEFAULT 0,
  interest_rate_variation_bps INTEGER NOT NULL DEFAULT 0,
  result_deltas JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, scenario_id, cost_variation_percent, sale_price_variation_percent, interest_rate_variation_bps)
);

-- Enable Row Level Security
ALTER TABLE public.risk_variations ENABLE ROW LEVEL SECURITY;

-- Create policies for risk_variations
CREATE POLICY "Users can view risk variations for their projects" 
ON public.risk_variations 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = risk_variations.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can insert risk variations for their projects" 
ON public.risk_variations 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = risk_variations.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update risk variations for their projects" 
ON public.risk_variations 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = risk_variations.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete risk variations for their projects" 
ON public.risk_variations 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = risk_variations.project_id 
  AND projects.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_risk_variations_updated_at
BEFORE UPDATE ON public.risk_variations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();