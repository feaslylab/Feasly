-- Enterprise Schema Refactor: Asset-Centric Architecture
-- Phase 1: Preserve existing data and create new structure

-- 1. First, rename current projects table to preserve existing data
ALTER TABLE public.projects RENAME TO development_projects_backup;

-- 2. Create new lightweight projects table (development initiative containers)
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL, -- Links to user or organization
  start_date DATE,
  end_date DATE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Update assets table to be the primary modeling unit
-- Add fields that were previously in projects
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id),
ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'AED',
ADD COLUMN IF NOT EXISTS unit_system TEXT DEFAULT 'sqm',
ADD COLUMN IF NOT EXISTS gfa_residential NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS gfa_retail NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS gfa_office NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_price_residential NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_price_retail NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_price_office NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS use_segmented_revenue BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_escalation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS construction_escalation_percent NUMERIC DEFAULT 4.0,
ADD COLUMN IF NOT EXISTS escalation_start_month INTEGER DEFAULT 6,
ADD COLUMN IF NOT EXISTS escalation_duration_months INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS zakat_applicable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS zakat_rate_percent NUMERIC,
ADD COLUMN IF NOT EXISTS zakat_exclude_losses BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS zakat_calculation_method TEXT DEFAULT 'net_profit',
ADD COLUMN IF NOT EXISTS escrow_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS escrow_percent NUMERIC DEFAULT 20.0,
ADD COLUMN IF NOT EXISTS release_threshold NUMERIC DEFAULT 75.0,
ADD COLUMN IF NOT EXISTS release_trigger_type TEXT DEFAULT 'construction_percent',
ADD COLUMN IF NOT EXISTS release_rule_details TEXT,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- Ensure created_at and updated_at exist
ALTER TABLE public.assets 
ALTER COLUMN created_at SET DEFAULT now(),
ALTER COLUMN updated_at SET DEFAULT now();

-- 4. Add asset_id to scenarios table and prepare for migration
ALTER TABLE public.scenarios 
ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES public.assets(id),
ADD COLUMN IF NOT EXISTS is_base BOOLEAN DEFAULT false;

-- 5. Data migration: Create projects and assets from existing development_projects_backup
INSERT INTO public.projects (
  id, name, description, owner_id, start_date, end_date, tags, created_at, updated_at
)
SELECT 
  gen_random_uuid() as id,
  name,
  description,
  COALESCE(organization_id, user_id) as owner_id, -- Use org if available, otherwise user
  start_date,
  end_date,
  tags,
  created_at,
  updated_at
FROM public.development_projects_backup;

-- 6. Create assets from the backup projects data
-- First, get the mapping of old project id to new project id
WITH project_mapping AS (
  SELECT 
    dpb.id as old_project_id,
    p.id as new_project_id,
    dpb.*
  FROM public.development_projects_backup dpb
  JOIN public.projects p ON p.name = dpb.name 
    AND p.created_at = dpb.created_at
)
INSERT INTO public.assets (
  id, project_id, name, type, gfa_sqm, construction_cost_aed, annual_operating_cost_aed,
  annual_revenue_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months,
  stabilization_period_months, currency_code, unit_system, gfa_residential, gfa_retail,
  gfa_office, sale_price_residential, sale_price_retail, sale_price_office,
  use_segmented_revenue, enable_escalation, construction_escalation_percent,
  escalation_start_month, escalation_duration_months, zakat_applicable, zakat_rate_percent,
  zakat_exclude_losses, zakat_calculation_method, escrow_enabled, escrow_percent,
  release_threshold, release_trigger_type, release_rule_details, start_date, end_date,
  status, is_demo, is_pinned, created_at, updated_at
)
SELECT 
  gen_random_uuid() as id,
  pm.new_project_id,
  pm.name || ' - Main Asset' as name, -- Give it a descriptive name
  'mixed_use' as type, -- Default type
  COALESCE(pm.gfa_residential + pm.gfa_retail + pm.gfa_office, 0) as gfa_sqm,
  0 as construction_cost_aed, -- Will be populated from existing data later
  0 as annual_operating_cost_aed,
  0 as annual_revenue_aed,
  80 as occupancy_rate_percent, -- Default
  8 as cap_rate_percent, -- Default
  pm.escalation_duration_months,
  6 as stabilization_period_months, -- Default
  pm.currency_code,
  pm.unit_system,
  pm.gfa_residential,
  pm.gfa_retail,
  pm.gfa_office,
  pm.sale_price_residential,
  pm.sale_price_retail,
  pm.sale_price_office,
  pm.use_segmented_revenue,
  pm.enable_escalation,
  pm.construction_escalation_percent,
  pm.escalation_start_month,
  pm.escalation_duration_months,
  pm.zakat_applicable,
  pm.zakat_rate_percent,
  pm.zakat_exclude_losses,
  pm.zakat_calculation_method,
  pm.escrow_enabled,
  pm.escrow_percent,
  pm.release_threshold,
  pm.release_trigger_type,
  pm.release_rule_details,
  pm.start_date,
  pm.end_date,
  pm.status::text,
  pm.is_demo,
  pm.is_pinned,
  pm.created_at,
  pm.updated_at
FROM project_mapping pm;

-- 7. Update scenarios to link to assets instead of projects
WITH scenario_asset_mapping AS (
  SELECT 
    s.id as scenario_id,
    a.id as asset_id,
    s.project_id as old_project_id
  FROM public.scenarios s
  JOIN public.development_projects_backup dpb ON dpb.id = s.project_id
  JOIN public.projects p ON p.name = dpb.name AND p.created_at = dpb.created_at
  JOIN public.assets a ON a.project_id = p.id
)
UPDATE public.scenarios 
SET asset_id = sam.asset_id
FROM scenario_asset_mapping sam 
WHERE scenarios.id = sam.scenario_id;

-- 8. Set base scenario flag (first scenario per asset)
WITH first_scenarios AS (
  SELECT DISTINCT ON (asset_id) id 
  FROM public.scenarios 
  WHERE asset_id IS NOT NULL
  ORDER BY asset_id, created_at
)
UPDATE public.scenarios 
SET is_base = true 
WHERE id IN (SELECT id FROM first_scenarios);

-- 9. Enable Row Level Security on new tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies for new projects table
CREATE POLICY "Users can manage their own projects" ON public.projects
FOR ALL USING (
  is_authenticated_user() AND (
    -- Direct ownership
    owner_id = auth.uid() OR
    -- Organization membership
    (owner_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    ))
  )
);

-- 11. Update RLS policies for assets to use project ownership
DROP POLICY IF EXISTS "assets_strict" ON public.assets;
CREATE POLICY "Assets access through project ownership" ON public.assets
FOR ALL USING (
  is_authenticated_user() AND (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE owner_id = auth.uid() OR 
      owner_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  )
);

-- 12. Update RLS policies for scenarios to use asset ownership
CREATE POLICY "Scenarios access through asset ownership" ON public.scenarios
FOR ALL USING (
  is_authenticated_user() AND (
    asset_id IN (
      SELECT a.id FROM public.assets a
      JOIN public.projects p ON p.id = a.project_id
      WHERE p.owner_id = auth.uid() OR 
      p.owner_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  )
);

-- 13. Add update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 14. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assets_project_id ON public.assets(project_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_asset_id ON public.scenarios(asset_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);

-- 15. Add foreign key constraints
ALTER TABLE public.assets 
DROP CONSTRAINT IF EXISTS assets_project_id_fkey,
ADD CONSTRAINT assets_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE public.scenarios 
DROP CONSTRAINT IF EXISTS scenarios_asset_id_fkey,
ADD CONSTRAINT scenarios_asset_id_fkey 
FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;