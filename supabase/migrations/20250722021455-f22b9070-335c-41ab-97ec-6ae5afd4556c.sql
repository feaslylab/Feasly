-- Add comprehensive test data for real-life scenarios with proper UUIDs

-- Complex Project 1: Mixed-Use Development in Dubai
INSERT INTO projects (id, name, description, start_date, end_date, currency_code, user_id, is_demo, zakat_applicable, zakat_rate_percent, is_public) VALUES
(gen_random_uuid(), 'Dubai Marina Mixed-Use Tower', '35-story mixed-use development with residential, retail, and office components', '2024-01-01', '2027-12-31', 'AED', (SELECT id FROM auth.users LIMIT 1), true, true, 2.5, true);

-- Get the project ID for Dubai project
WITH dubai_project AS (
  SELECT id FROM projects WHERE name = 'Dubai Marina Mixed-Use Tower' LIMIT 1
),
-- Complex Project 2: Luxury Resort in Saudi Arabia
saudi_project AS (
  INSERT INTO projects (id, name, description, start_date, end_date, currency_code, user_id, is_demo, zakat_applicable, zakat_rate_percent, is_public) VALUES
  (gen_random_uuid(), 'NEOM Luxury Resort Complex', 'High-end resort with villas, spa, and entertainment facilities', '2024-06-01', '2026-12-31', 'SAR', (SELECT id FROM auth.users LIMIT 1), true, true, 2.5, true)
  RETURNING id
),
-- Complex Project 3: Commercial Office Complex in London
london_project AS (
  INSERT INTO projects (id, name, description, start_date, end_date, currency_code, user_id, is_demo, zakat_applicable, zakat_rate_percent, is_public) VALUES
  (gen_random_uuid(), 'Canary Wharf Business Center', 'Grade A office complex with retail podium', '2024-03-01', '2026-09-30', 'GBP', (SELECT id FROM auth.users LIMIT 1), true, false, 0, true)
  RETURNING id
),
-- Multiple Assets for Dubai Project
dubai_assets AS (
  INSERT INTO assets (id, project_id, name, asset_type, gfa_sqm, construction_cost_aed, annual_revenue_aed, operating_cost_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months, stabilization_period_months) 
  SELECT 
    gen_random_uuid(), 
    dubai_project.id, 
    'Residential Tower (Floors 10-35)', 
    'Residential', 
    15000, 75000000, 18000000, 2500000, 95, 6.5, 30, 6
  FROM dubai_project
  UNION ALL
  SELECT 
    gen_random_uuid(), 
    dubai_project.id, 
    'Retail Podium (Floors 1-3)', 
    'Retail', 
    3000, 25000000, 8000000, 1200000, 85, 8.0, 18, 3
  FROM dubai_project
  UNION ALL
  SELECT 
    gen_random_uuid(), 
    dubai_project.id, 
    'Office Floors (Floors 4-9)', 
    'Office', 
    4500, 35000000, 12000000, 1800000, 90, 7.0, 24, 4
  FROM dubai_project
  RETURNING id, project_id, name
),
-- Assets for Saudi Resort
saudi_assets AS (
  INSERT INTO assets (id, project_id, name, asset_type, gfa_sqm, construction_cost_aed, annual_revenue_aed, operating_cost_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months, stabilization_period_months)
  SELECT 
    gen_random_uuid(), 
    saudi_project.id, 
    'Luxury Villas (50 units)', 
    'Hospitality', 
    8000, 120000000, 25000000, 8000000, 80, 9.0, 36, 12
  FROM saudi_project
  UNION ALL
  SELECT 
    gen_random_uuid(), 
    saudi_project.id, 
    'Main Resort Hotel', 
    'Hospitality', 
    12000, 85000000, 35000000, 12000000, 75, 8.5, 30, 9
  FROM saudi_project
  UNION ALL
  SELECT 
    gen_random_uuid(), 
    saudi_project.id, 
    'Spa & Wellness Center', 
    'Hospitality', 
    2500, 15000000, 8000000, 3000000, 70, 7.5, 18, 6
  FROM saudi_project
  RETURNING id, project_id, name
),
-- Assets for London Office
london_assets AS (
  INSERT INTO assets (id, project_id, name, asset_type, gfa_sqm, construction_cost_aed, annual_revenue_aed, operating_cost_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months, stabilization_period_months)
  SELECT 
    gen_random_uuid(), 
    london_project.id, 
    'Tower A - Premium Offices', 
    'Office', 
    18000, 180000000, 22000000, 4500000, 95, 5.5, 30, 6
  FROM london_project
  UNION ALL
  SELECT 
    gen_random_uuid(), 
    london_project.id, 
    'Tower B - Standard Offices', 
    'Office', 
    15000, 120000000, 16000000, 3200000, 90, 6.0, 24, 4
  FROM london_project
  UNION ALL
  SELECT 
    gen_random_uuid(), 
    london_project.id, 
    'Retail & Food Court', 
    'Retail', 
    3500, 25000000, 9000000, 1800000, 85, 7.5, 18, 3
  FROM london_project
  RETURNING id, project_id, name
),
-- Scenarios for testing
dubai_scenarios AS (
  INSERT INTO scenarios (id, project_id, name, description, is_base)
  SELECT 
    gen_random_uuid(), 
    dubai_project.id, 
    'Conservative Market', 
    'Conservative growth assumptions for Dubai market', 
    true
  FROM dubai_project
  UNION ALL
  SELECT 
    gen_random_uuid(), 
    dubai_project.id, 
    'Optimistic Growth', 
    'High growth scenario with premium pricing', 
    false
  FROM dubai_project
  UNION ALL
  SELECT 
    gen_random_uuid(), 
    dubai_project.id, 
    'Market Stress', 
    'Pessimistic scenario with reduced demand', 
    false
  FROM dubai_project
  RETURNING id, project_id, name
),
saudi_scenarios AS (
  INSERT INTO scenarios (id, project_id, name, description, is_base)
  SELECT 
    gen_random_uuid(), 
    saudi_project.id, 
    'Base Tourism', 
    'Standard tourism growth for NEOM', 
    true
  FROM saudi_project
  UNION ALL
  SELECT 
    gen_random_uuid(), 
    saudi_project.id, 
    'Premium Positioning', 
    'Ultra-luxury positioning strategy', 
    false
  FROM saudi_project
  RETURNING id, project_id, name
),
london_scenarios AS (
  INSERT INTO scenarios (id, project_id, name, description, is_base)
  SELECT 
    gen_random_uuid(), 
    london_project.id, 
    'Post-Brexit Baseline', 
    'Conservative London office market', 
    true
  FROM london_project
  UNION ALL
  SELECT 
    gen_random_uuid(), 
    london_project.id, 
    'Financial Hub Growth', 
    'Strong demand from financial services', 
    false
  FROM london_project
  RETURNING id, project_id, name
),
-- Complex contractor data
dubai_contractors AS (
  INSERT INTO project_contractors (id, project_id, name, phase, amount, start_date, expected_completion, status, risk_rating, contact_person, contact_email, notes)
  SELECT 
    gen_random_uuid(), 
    dubai_project.id, 
    'Emaar Construction LLC', 
    'Foundation & Structure', 
    45000000, 
    '2024-01-15', 
    '2025-06-30', 
    'in_progress', 
    'low', 
    'Ahmed Al-Rashid', 
    'ahmed@emaar.ae', 
    'Main structural contractor with excellent track record'
  FROM dubai_project
  UNION ALL
  SELECT 
    gen_random_uuid(), 
    dubai_project.id, 
    'Drake & Scull International', 
    'MEP Systems', 
    28000000, 
    '2024-08-01', 
    '2026-02-28', 
    'planned', 
    'medium', 
    'Sarah Johnson', 
    'sarah@dsi.ae', 
    'Mechanical, electrical & plumbing systems'
  FROM dubai_project
  RETURNING id, project_id, name
),
-- Additional exchange rates for comprehensive testing
new_exchange_rates AS (
  INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
  ('USD', 'AED', 3.6725),
  ('EUR', 'AED', 4.05),
  ('GBP', 'AED', 4.68),
  ('SAR', 'AED', 0.98),
  ('JPY', 'AED', 0.025),
  ('CHF', 'AED', 4.12),
  ('CAD', 'AED', 2.74),
  ('AUD', 'AED', 2.45),
  ('AED', 'USD', 0.272),
  ('AED', 'EUR', 0.247),
  ('AED', 'GBP', 0.214),
  ('AED', 'SAR', 1.02),
  ('USD', 'SAR', 3.75),
  ('EUR', 'SAR', 4.13),
  ('GBP', 'SAR', 4.78),
  ('USD', 'GBP', 0.785),
  ('EUR', 'GBP', 0.865),
  ('SAR', 'GBP', 0.209)
  ON CONFLICT (from_currency, to_currency) DO UPDATE SET 
    rate = EXCLUDED.rate,
    updated_at = now()
  RETURNING id
),
-- Benchmark data for different asset types
new_benchmarks AS (
  INSERT INTO feasly_benchmarks (asset_type, avg_roi, avg_irr, avg_profit_margin) VALUES
  ('Mixed-Use', 18.5, 16.2, 22.5),
  ('Luxury Hospitality', 22.0, 19.8, 28.5),
  ('Premium Office', 15.2, 13.8, 18.7),
  ('High-End Residential', 16.8, 14.5, 24.3),
  ('Resort & Recreation', 20.5, 18.2, 26.8)
  ON CONFLICT (asset_type) DO UPDATE SET 
    avg_roi = EXCLUDED.avg_roi,
    avg_irr = EXCLUDED.avg_irr,
    avg_profit_margin = EXCLUDED.avg_profit_margin,
    updated_at = now()
  RETURNING id
)
-- Return summary of inserted data
SELECT 
  'Complex test data inserted successfully' as status,
  (SELECT COUNT(*) FROM projects WHERE is_demo = true) as demo_projects,
  (SELECT COUNT(*) FROM assets WHERE project_id IN (SELECT id FROM projects WHERE is_demo = true)) as demo_assets,
  (SELECT COUNT(*) FROM scenarios WHERE project_id IN (SELECT id FROM projects WHERE is_demo = true)) as demo_scenarios;