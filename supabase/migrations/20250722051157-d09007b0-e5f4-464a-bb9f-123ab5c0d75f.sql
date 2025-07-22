-- Add version tracking columns to feasly_cashflows if not exists
ALTER TABLE feasly_cashflows ADD COLUMN IF NOT EXISTS version_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE feasly_cashflows ADD COLUMN IF NOT EXISTS version_notes TEXT;
ALTER TABLE feasly_cashflows ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Create table for version metadata
CREATE TABLE IF NOT EXISTS feasly_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_label TEXT NOT NULL,
  is_latest BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  version_notes TEXT,
  scenario_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  kpi_snapshot JSONB,
  
  UNIQUE(project_id, version_label)
);

-- Enable RLS on feasly_versions
ALTER TABLE feasly_versions ENABLE ROW LEVEL SECURITY;

-- Create policies for feasly_versions
CREATE POLICY "Users can view versions for their projects" 
ON feasly_versions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = feasly_versions.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create versions for their projects" 
ON feasly_versions 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = feasly_versions.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update versions for their projects" 
ON feasly_versions 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = feasly_versions.project_id 
  AND projects.user_id = auth.uid()
));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_feasly_versions_project_id ON feasly_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_feasly_versions_latest ON feasly_versions(project_id, is_latest) WHERE is_latest = true;
CREATE INDEX IF NOT EXISTS idx_feasly_cashflows_version ON feasly_cashflows(project_id, version_label);

-- Insert sample version data for demo project
INSERT INTO feasly_versions (project_id, version_label, is_latest, created_at, version_notes, scenario_types, kpi_snapshot)
SELECT 
  p.id as project_id,
  'v1.0' as version_label,
  true as is_latest,
  NOW() - INTERVAL '7 days' as created_at,
  'Initial baseline model' as version_notes,
  ARRAY['base', 'optimistic', 'pessimistic'] as scenario_types,
  jsonb_build_object(
    'irr', 15.2,
    'roi', 18.5,
    'totalProfit', 45000000,
    'totalRevenue', 280000000,
    'totalCost', 235000000
  ) as kpi_snapshot
FROM projects p 
WHERE p.is_demo = true 
AND NOT EXISTS (
  SELECT 1 FROM feasly_versions fv 
  WHERE fv.project_id = p.id AND fv.version_label = 'v1.0'
)
LIMIT 1;

-- Insert additional historical versions for comparison
INSERT INTO feasly_versions (project_id, version_label, is_latest, created_at, version_notes, scenario_types, kpi_snapshot)
SELECT 
  p.id as project_id,
  'v0.9' as version_label,
  false as is_latest,
  NOW() - INTERVAL '14 days' as created_at,
  'Pre-NEOM market adjustment' as version_notes,
  ARRAY['base', 'optimistic'] as scenario_types,
  jsonb_build_object(
    'irr', 13.8,
    'roi', 16.2,
    'totalProfit', 38000000,
    'totalRevenue', 260000000,
    'totalCost', 222000000
  ) as kpi_snapshot
FROM projects p 
WHERE p.is_demo = true 
AND NOT EXISTS (
  SELECT 1 FROM feasly_versions fv 
  WHERE fv.project_id = p.id AND fv.version_label = 'v0.9'
)
LIMIT 1;

INSERT INTO feasly_versions (project_id, version_label, is_latest, created_at, version_notes, scenario_types, kpi_snapshot)
SELECT 
  p.id as project_id,
  'v0.8' as version_label,
  false as is_latest,
  NOW() - INTERVAL '21 days' as created_at,
  'Original feasibility study' as version_notes,
  ARRAY['base'] as scenario_types,
  jsonb_build_object(
    'irr', 12.5,
    'roi', 14.8,
    'totalProfit', 32000000,
    'totalRevenue', 240000000,
    'totalCost', 208000000
  ) as kpi_snapshot
FROM projects p 
WHERE p.is_demo = true 
AND NOT EXISTS (
  SELECT 1 FROM feasly_versions fv 
  WHERE fv.project_id = p.id AND fv.version_label = 'v0.8'
)
LIMIT 1;