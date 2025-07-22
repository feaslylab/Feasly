-- Add comprehensive test data for real-life scenarios with proper phase values

-- Complex Project 1: Mixed-Use Development in Dubai
INSERT INTO projects (name, description, start_date, end_date, currency_code, user_id, is_demo, zakat_applicable, zakat_rate_percent, is_public) VALUES
('Dubai Marina Mixed-Use Tower', '35-story mixed-use development with residential, retail, and office components', DATE '2024-01-01', DATE '2027-12-31', 'AED', (SELECT id FROM auth.users LIMIT 1), true, true, 2.5, true);

-- Complex Project 2: Luxury Resort in Saudi Arabia  
INSERT INTO projects (name, description, start_date, end_date, currency_code, user_id, is_demo, zakat_applicable, zakat_rate_percent, is_public) VALUES
('NEOM Luxury Resort Complex', 'High-end resort with villas, spa, and entertainment facilities', DATE '2024-06-01', DATE '2026-12-31', 'SAR', (SELECT id FROM auth.users LIMIT 1), true, true, 2.5, true);

-- Complex Project 3: Commercial Office Complex in London
INSERT INTO projects (name, description, start_date, end_date, currency_code, user_id, is_demo, zakat_applicable, zakat_rate_percent, is_public) VALUES
('Canary Wharf Business Center', 'Grade A office complex with retail podium', DATE '2024-03-01', DATE '2026-09-30', 'GBP', (SELECT id FROM auth.users LIMIT 1), true, false, 0, true);

-- Multiple Assets for Dubai Project
INSERT INTO assets (project_id, name, asset_type, gfa_sqm, construction_cost_aed, annual_revenue_aed, operating_cost_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months, stabilization_period_months) 
SELECT 
  p.id, 
  'Residential Tower (Floors 10-35)', 
  'Residential', 
  15000, 75000000, 18000000, 2500000, 95, 6.5, 30, 6
FROM projects p WHERE p.name = 'Dubai Marina Mixed-Use Tower'
UNION ALL
SELECT 
  p.id, 
  'Retail Podium (Floors 1-3)', 
  'Retail', 
  3000, 25000000, 8000000, 1200000, 85, 8.0, 18, 3
FROM projects p WHERE p.name = 'Dubai Marina Mixed-Use Tower'
UNION ALL
SELECT 
  p.id, 
  'Office Floors (Floors 4-9)', 
  'Office', 
  4500, 35000000, 12000000, 1800000, 90, 7.0, 24, 4
FROM projects p WHERE p.name = 'Dubai Marina Mixed-Use Tower';

-- Assets for Saudi Resort
INSERT INTO assets (project_id, name, asset_type, gfa_sqm, construction_cost_aed, annual_revenue_aed, operating_cost_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months, stabilization_period_months)
SELECT 
  p.id, 
  'Luxury Villas (50 units)', 
  'Hospitality', 
  8000, 120000000, 25000000, 8000000, 80, 9.0, 36, 12
FROM projects p WHERE p.name = 'NEOM Luxury Resort Complex'
UNION ALL
SELECT 
  p.id, 
  'Main Resort Hotel', 
  'Hospitality', 
  12000, 85000000, 35000000, 12000000, 75, 8.5, 30, 9
FROM projects p WHERE p.name = 'NEOM Luxury Resort Complex'
UNION ALL
SELECT 
  p.id, 
  'Spa & Wellness Center', 
  'Hospitality', 
  2500, 15000000, 8000000, 3000000, 70, 7.5, 18, 6
FROM projects p WHERE p.name = 'NEOM Luxury Resort Complex';

-- Assets for London Office
INSERT INTO assets (project_id, name, asset_type, gfa_sqm, construction_cost_aed, annual_revenue_aed, operating_cost_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months, stabilization_period_months)
SELECT 
  p.id, 
  'Tower A - Premium Offices', 
  'Office', 
  18000, 180000000, 22000000, 4500000, 95, 5.5, 30, 6
FROM projects p WHERE p.name = 'Canary Wharf Business Center'
UNION ALL
SELECT 
  p.id, 
  'Tower B - Standard Offices', 
  'Office', 
  15000, 120000000, 16000000, 3200000, 90, 6.0, 24, 4
FROM projects p WHERE p.name = 'Canary Wharf Business Center'
UNION ALL
SELECT 
  p.id, 
  'Retail & Food Court', 
  'Retail', 
  3500, 25000000, 9000000, 1800000, 85, 7.5, 18, 3
FROM projects p WHERE p.name = 'Canary Wharf Business Center';

-- Scenarios for testing
INSERT INTO scenarios (project_id, name, description, is_base)
SELECT 
  p.id, 
  'Conservative Market', 
  'Conservative growth assumptions for Dubai market', 
  true
FROM projects p WHERE p.name = 'Dubai Marina Mixed-Use Tower'
UNION ALL
SELECT 
  p.id, 
  'Optimistic Growth', 
  'High growth scenario with premium pricing', 
  false
FROM projects p WHERE p.name = 'Dubai Marina Mixed-Use Tower'
UNION ALL
SELECT 
  p.id, 
  'Market Stress', 
  'Pessimistic scenario with reduced demand', 
  false
FROM projects p WHERE p.name = 'Dubai Marina Mixed-Use Tower';

INSERT INTO scenarios (project_id, name, description, is_base)
SELECT 
  p.id, 
  'Base Tourism', 
  'Standard tourism growth for NEOM', 
  true
FROM projects p WHERE p.name = 'NEOM Luxury Resort Complex'
UNION ALL
SELECT 
  p.id, 
  'Premium Positioning', 
  'Ultra-luxury positioning strategy', 
  false
FROM projects p WHERE p.name = 'NEOM Luxury Resort Complex';

INSERT INTO scenarios (project_id, name, description, is_base)
SELECT 
  p.id, 
  'Post-Brexit Baseline', 
  'Conservative London office market', 
  true
FROM projects p WHERE p.name = 'Canary Wharf Business Center'
UNION ALL
SELECT 
  p.id, 
  'Financial Hub Growth', 
  'Strong demand from financial services', 
  false
FROM projects p WHERE p.name = 'Canary Wharf Business Center';

-- Complex contractor data with proper phase values (design, foundation, structure, mep, facade, fit_out, landscaping, other)
INSERT INTO project_contractors (project_id, name, phase, amount, start_date, expected_completion, status, risk_rating, contact_person, contact_email, notes)
SELECT 
  p.id, 
  'Emaar Construction LLC', 
  'foundation', 
  45000000, 
  DATE '2024-01-15', 
  DATE '2025-06-30', 
  'in_progress', 
  'low', 
  'Ahmed Al-Rashid', 
  'ahmed@emaar.ae', 
  'Main structural contractor with excellent track record'
FROM projects p WHERE p.name = 'Dubai Marina Mixed-Use Tower'
UNION ALL
SELECT 
  p.id, 
  'Drake & Scull International', 
  'mep', 
  28000000, 
  DATE '2024-08-01', 
  DATE '2026-02-28', 
  'planned', 
  'medium', 
  'Sarah Johnson', 
  'sarah@dsi.ae', 
  'Mechanical, electrical & plumbing systems'
FROM projects p WHERE p.name = 'Dubai Marina Mixed-Use Tower'
UNION ALL
SELECT 
  p.id, 
  'Alec Engineering', 
  'facade', 
  35000000, 
  DATE '2025-01-01', 
  DATE '2026-08-31', 
  'planned', 
  'low', 
  'Hassan Al-Mansoori', 
  'hassan@alec.ae', 
  'Premium finishing and facade work'
FROM projects p WHERE p.name = 'Dubai Marina Mixed-Use Tower'
UNION ALL
SELECT 
  p.id, 
  'Sobha Realty', 
  'fit_out', 
  22000000, 
  DATE '2025-09-01', 
  DATE '2027-03-31', 
  'planned', 
  'low', 
  'Priya Sharma', 
  'priya@sobha.com', 
  'Luxury interior finishing'
FROM projects p WHERE p.name = 'Dubai Marina Mixed-Use Tower';

-- Saudi Project Contractors
INSERT INTO project_contractors (project_id, name, phase, amount, start_date, expected_completion, status, risk_rating, contact_person, contact_email, notes)
SELECT 
  p.id, 
  'Saudi Binladin Group', 
  'foundation', 
  35000000, 
  DATE '2024-06-15', 
  DATE '2025-02-28', 
  'in_progress', 
  'medium', 
  'Omar Bin Rashid', 
  'omar@sbg.sa', 
  'Major infrastructure development'
FROM projects p WHERE p.name = 'NEOM Luxury Resort Complex'
UNION ALL
SELECT 
  p.id, 
  'El Seif Engineering', 
  'structure', 
  85000000, 
  DATE '2024-10-01', 
  DATE '2026-04-30', 
  'planned', 
  'low', 
  'Khalid Al-Otaibi', 
  'khalid@elseif.sa', 
  'Hospitality construction specialist'
FROM projects p WHERE p.name = 'NEOM Luxury Resort Complex'
UNION ALL
SELECT 
  p.id, 
  'Nesma & Partners', 
  'landscaping', 
  18000000, 
  DATE '2025-03-01', 
  DATE '2026-09-30', 
  'planned', 
  'low', 
  'Fatima Al-Zahra', 
  'fatima@nesma.sa', 
  'Luxury landscaping and pools'
FROM projects p WHERE p.name = 'NEOM Luxury Resort Complex';

-- London Project Contractors
INSERT INTO project_contractors (project_id, name, phase, amount, start_date, expected_completion, status, risk_rating, contact_person, contact_email, notes)
SELECT 
  p.id, 
  'Skanska UK', 
  'structure', 
  165000000, 
  DATE '2024-03-15', 
  DATE '2026-01-31', 
  'in_progress', 
  'low', 
  'James Mitchell', 
  'james@skanska.co.uk', 
  'Primary construction contractor'
FROM projects p WHERE p.name = 'Canary Wharf Business Center'
UNION ALL
SELECT 
  p.id, 
  'Mace Group', 
  'other', 
  8500000, 
  DATE '2024-03-01', 
  DATE '2026-09-30', 
  'in_progress', 
  'low', 
  'Emma Thompson', 
  'emma@macegroup.com', 
  'Overall project management'
FROM projects p WHERE p.name = 'Canary Wharf Business Center'
UNION ALL
SELECT 
  p.id, 
  'Arup', 
  'design', 
  4200000, 
  DATE '2024-02-01', 
  DATE '2026-06-30', 
  'in_progress', 
  'low', 
  'David Chen', 
  'david@arup.com', 
  'Engineering and technical advisory'
FROM projects p WHERE p.name = 'Canary Wharf Business Center';

-- Complex milestone schedules
INSERT INTO project_milestones (project_id, label, description, target_date, status)
SELECT p.id, 'Planning Approval', 'Final planning and building permits approved', DATE '2024-02-15', 'completed'
FROM projects p WHERE p.name = 'Dubai Marina Mixed-Use Tower'
UNION ALL
SELECT p.id, 'Foundation Complete', 'Basement and foundation work finished', DATE '2024-08-30', 'in_progress'
FROM projects p WHERE p.name = 'Dubai Marina Mixed-Use Tower'
UNION ALL
SELECT p.id, 'Structure Topped Out', 'Main structural work completed', DATE '2025-09-15', 'planned'
FROM projects p WHERE p.name = 'Dubai Marina Mixed-Use Tower'
UNION ALL
SELECT p.id, 'MEP Rough-In Complete', 'All MEP systems installed', DATE '2026-03-31', 'planned'
FROM projects p WHERE p.name = 'Dubai Marina Mixed-Use Tower'
UNION ALL
SELECT p.id, 'Facade Installation', 'External facade work completed', DATE '2026-08-15', 'planned'
FROM projects p WHERE p.name = 'Dubai Marina Mixed-Use Tower'
UNION ALL
SELECT p.id, 'Interior Completion', 'All interior fit-out finished', DATE '2027-02-28', 'planned'
FROM projects p WHERE p.name = 'Dubai Marina Mixed-Use Tower'
UNION ALL
SELECT p.id, 'Project Handover', 'Final inspections and handover', DATE '2027-04-30', 'planned'
FROM projects p WHERE p.name = 'Dubai Marina Mixed-Use Tower';

-- Saudi Project Milestones
INSERT INTO project_milestones (project_id, label, description, target_date, status)
SELECT p.id, 'Environmental Clearance', 'All environmental approvals obtained', DATE '2024-07-31', 'completed'
FROM projects p WHERE p.name = 'NEOM Luxury Resort Complex'
UNION ALL
SELECT p.id, 'Infrastructure Complete', 'Roads, utilities, and basic infrastructure', DATE '2025-05-15', 'planned'
FROM projects p WHERE p.name = 'NEOM Luxury Resort Complex'
UNION ALL
SELECT p.id, 'Villa Construction Start', 'Begin construction of luxury villas', DATE '2025-01-15', 'planned'
FROM projects p WHERE p.name = 'NEOM Luxury Resort Complex'
UNION ALL
SELECT p.id, 'Hotel Structure Complete', 'Main hotel building structure finished', DATE '2025-11-30', 'planned'
FROM projects p WHERE p.name = 'NEOM Luxury Resort Complex'
UNION ALL
SELECT p.id, 'Amenities Installation', 'Spa, pools, and recreation facilities', DATE '2026-08-31', 'planned'
FROM projects p WHERE p.name = 'NEOM Luxury Resort Complex'
UNION ALL
SELECT p.id, 'Resort Opening', 'Soft opening for initial operations', DATE '2026-12-15', 'planned'
FROM projects p WHERE p.name = 'NEOM Luxury Resort Complex';

-- London Project Milestones
INSERT INTO project_milestones (project_id, label, description, target_date, status)
SELECT p.id, 'Site Acquisition', 'Land purchase and legal completion', DATE '2024-02-28', 'completed'
FROM projects p WHERE p.name = 'Canary Wharf Business Center'
UNION ALL
SELECT p.id, 'Demolition Complete', 'Existing structure demolished', DATE '2024-05-31', 'in_progress'
FROM projects p WHERE p.name = 'Canary Wharf Business Center'
UNION ALL
SELECT p.id, 'Excavation & Piling', 'Foundation work and basement excavation', DATE '2024-09-30', 'planned'
FROM projects p WHERE p.name = 'Canary Wharf Business Center'
UNION ALL
SELECT p.id, 'Core & Shell Complete', 'Building envelope and structure finished', DATE '2025-08-31', 'planned'
FROM projects p WHERE p.name = 'Canary Wharf Business Center'
UNION ALL
SELECT p.id, 'Tenant Fit-Out Start', 'Begin customized office fit-outs', DATE '2025-12-01', 'planned'
FROM projects p WHERE p.name = 'Canary Wharf Business Center'
UNION ALL
SELECT p.id, 'First Tenant Move-In', 'Initial occupancy and operations', DATE '2026-06-01', 'planned'
FROM projects p WHERE p.name = 'Canary Wharf Business Center';

-- Additional exchange rates for comprehensive testing
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
  updated_at = now();

-- Benchmark data for different asset types
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
  updated_at = now();