-- Update the existing Riyadh demo project to showcase Sprint 14 compliance features
UPDATE projects 
SET 
  name = 'Riyadh Mixed-Use Development (Compliance Showcase)',
  description = 'Premium mixed-use development in Riyadh featuring residential, retail, and office spaces with full Saudi compliance framework',
  project_ai_summary = 'Riyadh Mixed-Use Development is a flagship project located in the heart of Riyadh, Saudi Arabia. The project features modern residential units, premium retail spaces, and Grade-A office facilities. With a total investment of 280M SAR, the project incorporates full Saudi compliance including 20% escrow protection and Zakat calculations. The development is designed to meet growing demand for integrated living and working spaces in the capital, with expected completion in 2027. Strong pre-sales indicate robust market appetite and the project is positioned to deliver superior returns while maintaining full regulatory compliance.',
  escrow_enabled = true,
  escrow_percent = 20.0,
  release_trigger_type = 'construction_percent',
  release_threshold = 50.0,
  release_rule_details = 'Funds released when construction reaches 50% completion as verified by third-party engineer',
  zakat_applicable = true,
  zakat_rate_percent = 2.5,
  zakat_calculation_method = 'net_profit',
  zakat_exclude_losses = true,
  tags = ARRAY['saudi-arabia', 'mixed-use', 'riyadh', 'compliance', 'escrow', 'zakat', 'islamic-finance'],
  updated_at = NOW()
WHERE id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

-- Add demo escrow releases schedule for Riyadh project
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
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', '2026-02-15', 28000000, 50.0, 'construction_percent', '50% construction completion verified by independent engineer', 50.0, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', '2026-09-01', 16800000, 30.0, 'construction_percent', '80% construction completion verified by independent engineer', 80.0, true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', '2027-02-15', 11200000, 20.0, 'construction_percent', 'Final completion and project handover', 100.0, true);

-- Update financial summary for the Riyadh project with compliance impact
INSERT INTO financial_summaries (
  project_id,
  total_revenue,
  total_cost,
  profit_margin,
  irr,
  payback_period,
  computed_at
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
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