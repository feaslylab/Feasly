-- Insert a demo project with escrow and zakat enabled for Sprint 14 showcase
INSERT INTO projects (
  id,
  name,
  description,
  project_ai_summary,
  user_id,
  currency_code,
  start_date,
  created_at,
  status,
  is_demo,
  is_public,
  escrow_enabled,
  escrow_percent,
  release_trigger_type,
  release_threshold,
  release_rule_details,
  zakat_applicable,
  zakat_rate_percent,
  zakat_calculation_method,
  zakat_exclude_losses,
  tags
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'Al-Noor Mixed-Use Development',
  'Premium mixed-use development in Riyadh featuring residential, retail, and office spaces with full Saudi compliance framework',
  'Al-Noor Development is a flagship mixed-use project located in the heart of Riyadh, Saudi Arabia. The project features modern residential units, premium retail spaces, and Grade-A office facilities. With a total investment of 280M SAR, the project incorporates full Saudi compliance including 20% escrow protection and Zakat calculations. The development is designed to meet growing demand for integrated living and working spaces in the capital, with expected completion in 2027. Strong pre-sales indicate robust market appetite and the project is positioned to deliver superior returns while maintaining full regulatory compliance.',
  '00000000-0000-0000-0000-000000000001'::uuid, -- Demo user ID
  'SAR',
  '2025-03-01',
  NOW(),
  'active',
  true,
  true,
  true, -- escrow enabled
  20.0, -- 20% escrow
  'construction_percent',
  50.0, -- 50% construction trigger
  'Funds released when construction reaches 50% completion as verified by third-party engineer',
  true, -- zakat applicable
  2.5, -- 2.5% zakat rate
  'net_profit',
  true, -- exclude losses
  ARRAY['saudi-arabia', 'mixed-use', 'riyadh', 'compliance', 'escrow', 'zakat', 'islamic-finance']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  project_ai_summary = EXCLUDED.project_ai_summary,
  escrow_enabled = EXCLUDED.escrow_enabled,
  escrow_percent = EXCLUDED.escrow_percent,
  release_trigger_type = EXCLUDED.release_trigger_type,
  release_threshold = EXCLUDED.release_threshold,
  release_rule_details = EXCLUDED.release_rule_details,
  zakat_applicable = EXCLUDED.zakat_applicable,
  zakat_rate_percent = EXCLUDED.zakat_rate_percent,
  zakat_calculation_method = EXCLUDED.zakat_calculation_method,
  zakat_exclude_losses = EXCLUDED.zakat_exclude_losses,
  updated_at = NOW();

-- Add demo milestones for the compliance project
INSERT INTO project_milestones (
  project_id,
  label,
  target_date,
  status,
  description
) VALUES
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Project Kickoff', '2025-03-01', 'completed', 'Project initiation and team mobilization'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Foundation Complete', '2025-08-15', 'planned', 'Foundation and basement construction completion'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, '50% Construction', '2026-01-30', 'planned', 'Mid-construction milestone triggering first escrow release'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Structure Topping', '2026-06-15', 'planned', 'Main structural work completion'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'MEP Installation', '2026-10-30', 'planned', 'Mechanical, electrical, and plumbing systems'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Fit-out Complete', '2027-02-28', 'planned', 'Interior fit-out and finishing works'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Project Handover', '2027-04-30', 'planned', 'Final completion and project delivery')
ON CONFLICT DO NOTHING;

-- Add demo contractors for the compliance project
INSERT INTO project_contractors (
  project_id,
  name,
  phase,
  amount,
  risk_rating,
  status,
  contact_person,
  contact_email,
  start_date,
  expected_completion,
  notes
) VALUES
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Al-Rashid Construction Co.', 'Foundation & Structure', 95000000, 'low', 'active', 'Ahmed Al-Mahmoud', 'ahmed@alrashid.sa', '2025-03-01', '2026-06-15', 'Leading contractor with 25+ years experience in mixed-use developments'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Modern MEP Systems', 'MEP Installation', 35000000, 'medium', 'planned', 'Sara Al-Zahra', 'sara@modernmep.sa', '2026-04-01', '2026-10-30', 'Specialized in smart building systems and energy efficiency'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Elite Interiors', 'Fit-out & Finishing', 28000000, 'medium', 'planned', 'Omar Bin Khalid', 'omar@eliteinteriors.sa', '2026-08-01', '2027-02-28', 'Premium interior contractor with international portfolio'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Riyadh Engineering Consultants', 'Design & Supervision', 12000000, 'low', 'active', 'Dr. Fatima Al-Nasser', 'fatima@rec.sa', '2025-01-15', '2027-04-30', 'Comprehensive engineering and project management services')
ON CONFLICT DO NOTHING;

-- Add demo escrow releases schedule
INSERT INTO escrow_releases (
  project_id,
  release_date,
  release_amount,
  release_percentage,
  trigger_type,
  trigger_details,
  construction_progress_percent,
  is_projected
) VALUES
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, '2026-02-15', 28000000, 50.0, 'construction_percent', '50% construction completion verified', 50.0, true),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, '2026-11-30', 16800000, 30.0, 'construction_percent', '80% construction completion verified', 80.0, true),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, '2027-05-15', 11200000, 20.0, 'construction_percent', 'Final completion and handover', 100.0, true)
ON CONFLICT DO NOTHING;

-- Add financial summary for the compliance demo project
INSERT INTO financial_summaries (
  project_id,
  total_revenue,
  total_cost,
  profit_margin,
  irr,
  payback_period,
  computed_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  390000000, -- 390M SAR revenue
  280000000, -- 280M SAR cost  
  28.2, -- 28.2% profit margin
  18.5, -- 18.5% IRR
  48, -- 48 months payback
  NOW()
)
ON CONFLICT (project_id) DO UPDATE SET
  total_revenue = EXCLUDED.total_revenue,
  total_cost = EXCLUDED.total_cost,
  profit_margin = EXCLUDED.profit_margin,
  irr = EXCLUDED.irr,
  payback_period = EXCLUDED.payback_period,
  computed_at = EXCLUDED.computed_at;

-- Add compliance insights for the demo project
INSERT INTO feasly_insights_notes (
  project_id,
  scenario,
  user_notes,
  generated_insights
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'Base',
  'This project showcases Feasly''s comprehensive Saudi compliance framework. The 20% escrow provides stakeholder protection while maintaining project liquidity. Zakat calculations ensure Shariah compliance for Islamic finance eligibility.',
  '{"insights": [
    {
      "id": "compliance_framework",
      "type": "opportunity", 
      "title": "Full Saudi Compliance Active",
      "description": "Project includes both escrow protection (20%) and zakat compliance (2.5% on net profit), positioning it well for Saudi market and Islamic finance opportunities.",
      "value": "Full Compliance"
    },
    {
      "id": "escrow_protection",
      "type": "note",
      "title": "Escrow Schedule Optimized", 
      "description": "Three-stage escrow release (50%, 30%, 20%) tied to construction milestones provides balanced protection and cash flow management.",
      "value": "20% Total"
    },
    {
      "id": "zakat_impact",
      "type": "note",
      "title": "Zakat Compliance Integrated",
      "description": "Zakat calculation on net profit with loss exclusion reduces total burden while maintaining religious compliance. Estimated impact: 2.75M SAR.",
      "value": "2.5% Rate"
    }
  ]}'
)
ON CONFLICT (project_id, scenario) DO UPDATE SET
  user_notes = EXCLUDED.user_notes,
  generated_insights = EXCLUDED.generated_insights,
  updated_at = NOW();