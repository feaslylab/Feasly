-- Enterprise Schema Refactor: Working with existing structure
-- Add asset-centric fields to existing tables without creating new ones

-- 1. Add asset_id to scenarios table (most critical change)
ALTER TABLE public.scenarios 
ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES public.assets(id),
ADD COLUMN IF NOT EXISTS is_base BOOLEAN DEFAULT false;

-- 2. Enhance assets table to be the primary modeling unit
ALTER TABLE public.assets 
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
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS owner_id UUID; -- Direct ownership for assets

-- 3. Add project container concept to existing projects table  
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'container';

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scenarios_asset_id ON public.scenarios(asset_id);
CREATE INDEX IF NOT EXISTS idx_assets_owner_id ON public.assets(owner_id);

-- 5. Update RLS policies for asset-centric access
DROP POLICY IF EXISTS "assets_strict" ON public.assets;
CREATE POLICY "Assets access control" ON public.assets
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    -- Direct asset ownership
    owner_id = auth.uid() OR
    -- Organization asset ownership  
    owner_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    ) OR
    -- Legacy project-based access
    project_id IN (
      SELECT id FROM public.projects 
      WHERE user_id = auth.uid() OR 
      organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  )
);