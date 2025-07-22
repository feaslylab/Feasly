-- Sprint 13: Escrow & Zakat Modules Database Setup

-- 1. Add escrow and zakat fields to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS escrow_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS escrow_percent numeric DEFAULT 20.0 CHECK (escrow_percent >= 0 AND escrow_percent <= 100),
ADD COLUMN IF NOT EXISTS release_trigger_type text DEFAULT 'construction_percent' CHECK (release_trigger_type IN ('construction_percent', 'month_based', 'milestone_based')),
ADD COLUMN IF NOT EXISTS release_rule_details text,
ADD COLUMN IF NOT EXISTS release_threshold numeric DEFAULT 75.0,
ADD COLUMN IF NOT EXISTS zakat_applicable boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS zakat_rate_percent numeric DEFAULT 2.5 CHECK (zakat_rate_percent >= 0 AND zakat_rate_percent <= 100),
ADD COLUMN IF NOT EXISTS zakat_calculation_method text DEFAULT 'net_profit' CHECK (zakat_calculation_method IN ('net_profit', 'gross_revenue', 'asset_value')),
ADD COLUMN IF NOT EXISTS zakat_exclude_losses boolean DEFAULT true;

-- 2. Create project_compliance table for detailed compliance tracking
CREATE TABLE IF NOT EXISTS public.project_compliance (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  compliance_type text NOT NULL CHECK (compliance_type IN ('escrow', 'zakat', 'vat', 'other')),
  is_enabled boolean NOT NULL DEFAULT false,
  configuration jsonb NOT NULL DEFAULT '{}',
  calculated_amounts jsonb DEFAULT '{}',
  last_calculated_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(project_id, compliance_type)
);

-- 3. Create escrow_releases table for tracking escrow release events
CREATE TABLE IF NOT EXISTS public.escrow_releases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  release_date date NOT NULL,
  release_amount numeric NOT NULL,
  release_percentage numeric NOT NULL,
  trigger_type text NOT NULL,
  trigger_details text,
  construction_progress_percent numeric,
  milestone_achieved text,
  is_projected boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 4. Create zakat_calculations table for detailed Zakat tracking
CREATE TABLE IF NOT EXISTS public.zakat_calculations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  calculation_period text NOT NULL, -- 'monthly', 'quarterly', 'annual'
  period_start date NOT NULL,
  period_end date NOT NULL,
  taxable_base numeric NOT NULL,
  zakat_rate numeric NOT NULL,
  zakat_amount numeric NOT NULL,
  calculation_method text NOT NULL,
  adjustments jsonb DEFAULT '{}',
  is_final boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.project_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zakat_calculations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_compliance
CREATE POLICY "Users can view compliance for their projects" 
ON public.project_compliance 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = project_compliance.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can manage compliance for their projects" 
ON public.project_compliance 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = project_compliance.project_id 
  AND projects.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = project_compliance.project_id 
  AND projects.user_id = auth.uid()
));

-- Create RLS policies for escrow_releases
CREATE POLICY "Users can view escrow releases for their projects" 
ON public.escrow_releases 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = escrow_releases.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can manage escrow releases for their projects" 
ON public.escrow_releases 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = escrow_releases.project_id 
  AND projects.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = escrow_releases.project_id 
  AND projects.user_id = auth.uid()
));

-- Create RLS policies for zakat_calculations
CREATE POLICY "Users can view zakat calculations for their projects" 
ON public.zakat_calculations 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = zakat_calculations.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can manage zakat calculations for their projects" 
ON public.zakat_calculations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = zakat_calculations.project_id 
  AND projects.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = zakat_calculations.project_id 
  AND projects.user_id = auth.uid()
));

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_project_compliance_updated_at
BEFORE UPDATE ON public.project_compliance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_escrow_releases_updated_at
BEFORE UPDATE ON public.escrow_releases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_zakat_calculations_updated_at
BEFORE UPDATE ON public.zakat_calculations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();