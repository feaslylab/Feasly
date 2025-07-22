-- Complete Sprint 12 database setup

-- 1. Add remaining columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS unit_system text DEFAULT 'sqm' CHECK (unit_system IN ('sqm', 'sqft', 'units')),
ADD COLUMN IF NOT EXISTS use_segmented_revenue boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_escalation boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS construction_escalation_percent numeric DEFAULT 4.0,
ADD COLUMN IF NOT EXISTS escalation_start_month integer DEFAULT 6,
ADD COLUMN IF NOT EXISTS escalation_duration_months integer DEFAULT 12,
ADD COLUMN IF NOT EXISTS gfa_residential numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS gfa_retail numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS gfa_office numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_price_residential numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_price_retail numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_price_office numeric DEFAULT 0;

-- 2. Create project_phases table if not exists
CREATE TABLE IF NOT EXISTS public.project_phases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  phase_name text NOT NULL,
  start_month integer NOT NULL DEFAULT 0,
  duration_months integer NOT NULL DEFAULT 1,
  cost_percentage numeric NOT NULL DEFAULT 0 CHECK (cost_percentage >= 0 AND cost_percentage <= 100),
  phase_order integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. Create project_input_templates table if not exists
CREATE TABLE IF NOT EXISTS public.project_input_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name text NOT NULL,
  created_by uuid,
  template_data jsonb NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 4. Enable RLS on new tables
ALTER TABLE public.project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_input_templates ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for project_phases
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_phases' AND policyname = 'Users can view phases for their projects') THEN
        CREATE POLICY "Users can view phases for their projects" 
        ON public.project_phases 
        FOR SELECT 
        USING (EXISTS (
          SELECT 1 FROM projects 
          WHERE projects.id = project_phases.project_id 
          AND projects.user_id = auth.uid()
        ));
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_phases' AND policyname = 'Users can create phases for their projects') THEN
        CREATE POLICY "Users can create phases for their projects" 
        ON public.project_phases 
        FOR INSERT 
        WITH CHECK (EXISTS (
          SELECT 1 FROM projects 
          WHERE projects.id = project_phases.project_id 
          AND projects.user_id = auth.uid()
        ));
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_phases' AND policyname = 'Users can update phases for their projects') THEN
        CREATE POLICY "Users can update phases for their projects" 
        ON public.project_phases 
        FOR UPDATE 
        USING (EXISTS (
          SELECT 1 FROM projects 
          WHERE projects.id = project_phases.project_id 
          AND projects.user_id = auth.uid()
        ));
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_phases' AND policyname = 'Users can delete phases for their projects') THEN
        CREATE POLICY "Users can delete phases for their projects" 
        ON public.project_phases 
        FOR DELETE 
        USING (EXISTS (
          SELECT 1 FROM projects 
          WHERE projects.id = project_phases.project_id 
          AND projects.user_id = auth.uid()
        ));
    END IF;
END $$;

-- 6. Create RLS policies for scenario_overrides
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scenario_overrides' AND policyname = 'Users can view overrides for their projects') THEN
        CREATE POLICY "Users can view overrides for their projects" 
        ON public.scenario_overrides 
        FOR SELECT 
        USING (EXISTS (
          SELECT 1 FROM projects 
          WHERE projects.id = scenario_overrides.project_id 
          AND projects.user_id = auth.uid()
        ));
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scenario_overrides' AND policyname = 'Users can create overrides for their projects') THEN
        CREATE POLICY "Users can create overrides for their projects" 
        ON public.scenario_overrides 
        FOR INSERT 
        WITH CHECK (EXISTS (
          SELECT 1 FROM projects 
          WHERE projects.id = scenario_overrides.project_id 
          AND projects.user_id = auth.uid()
        ));
    END IF;
END $$;

-- 7. Create RLS policies for project_input_templates  
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_input_templates' AND policyname = 'Users can view their own templates and public templates') THEN
        CREATE POLICY "Users can view their own templates and public templates" 
        ON public.project_input_templates 
        FOR SELECT 
        USING (created_by = auth.uid() OR is_public = true);
    END IF;
END $$;

-- 8. Create triggers for updated_at timestamps
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_phases_updated_at') THEN
        CREATE TRIGGER update_project_phases_updated_at
        BEFORE UPDATE ON public.project_phases
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;