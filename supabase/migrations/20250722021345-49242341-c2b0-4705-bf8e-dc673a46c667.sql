-- Add comprehensive test data for real-life scenarios

-- Complex Project 1: Mixed-Use Development in Dubai
INSERT INTO projects (id, name, description, start_date, end_date, currency_code, user_id, is_demo, zakat_applicable, zakat_rate_percent, is_public) VALUES
('11111111-1111-1111-1111-111111111111', 'Dubai Marina Mixed-Use Tower', '35-story mixed-use development with residential, retail, and office components', '2024-01-01', '2027-12-31', 'AED', (SELECT id FROM auth.users LIMIT 1), true, true, 2.5, true);

-- Complex Project 2: Luxury Resort in Saudi Arabia
INSERT INTO projects (id, name, description, start_date, end_date, currency_code, user_id, is_demo, zakat_applicable, zakat_rate_percent, is_public) VALUES
('22222222-2222-2222-2222-222222222222', 'NEOM Luxury Resort Complex', 'High-end resort with villas, spa, and entertainment facilities', '2024-06-01', '2026-12-31', 'SAR', (SELECT id FROM auth.users LIMIT 1), true, true, 2.5, true);

-- Complex Project 3: Commercial Office Complex in London
INSERT INTO projects (id, name, description, start_date, end_date, currency_code, user_id, is_demo, zakat_applicable, zakat_rate_percent, is_public) VALUES
('33333333-3333-3333-3333-333333333333', 'Canary Wharf Business Center', 'Grade A office complex with retail podium', '2024-03-01', '2026-09-30', 'GBP', (SELECT id FROM auth.users LIMIT 1), true, false, 0, true);

-- Multiple Assets for Dubai Project
INSERT INTO assets (id, project_id, name, asset_type, gfa_sqm, construction_cost_aed, annual_revenue_aed, operating_cost_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months, stabilization_period_months) VALUES
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Residential Tower (Floors 10-35)', 'Residential', 15000, 75000000, 18000000, 2500000, 95, 6.5, 30, 6),
('a1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Retail Podium (Floors 1-3)', 'Retail', 3000, 25000000, 8000000, 1200000, 85, 8.0, 18, 3),
('a1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'Office Floors (Floors 4-9)', 'Office', 4500, 35000000, 12000000, 1800000, 90, 7.0, 24, 4);

-- Assets for Saudi Resort
INSERT INTO assets (id, project_id, name, asset_type, gfa_sqm, construction_cost_aed, annual_revenue_aed, operating_cost_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months, stabilization_period_months) VALUES
('a2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Luxury Villas (50 units)', 'Hospitality', 8000, 120000000, 25000000, 8000000, 80, 9.0, 36, 12),
('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Main Resort Hotel', 'Hospitality', 12000, 85000000, 35000000, 12000000, 75, 8.5, 30, 9),
('a2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'Spa & Wellness Center', 'Hospitality', 2500, 15000000, 8000000, 3000000, 70, 7.5, 18, 6);

-- Assets for London Office
INSERT INTO assets (id, project_id, name, asset_type, gfa_sqm, construction_cost_aed, annual_revenue_aed, operating_cost_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months, stabilization_period_months) VALUES
('a3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'Tower A - Premium Offices', 'Office', 18000, 180000000, 22000000, 4500000, 95, 5.5, 30, 6),
('a3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 'Tower B - Standard Offices', 'Office', 15000, 120000000, 16000000, 3200000, 90, 6.0, 24, 4),
('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Retail & Food Court', 'Retail', 3500, 25000000, 9000000, 1800000, 85, 7.5, 18, 3);

-- Scenarios for testing
INSERT INTO scenarios (id, project_id, name, description, is_base) VALUES
('s1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Conservative Market', 'Conservative growth assumptions for Dubai market', true),
('s1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Optimistic Growth', 'High growth scenario with premium pricing', false),
('s1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'Market Stress', 'Pessimistic scenario with reduced demand', false),
('s2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Base Tourism', 'Standard tourism growth for NEOM', true),
('s2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Premium Positioning', 'Ultra-luxury positioning strategy', false),
('s3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'Post-Brexit Baseline', 'Conservative London office market', true),
('s3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 'Financial Hub Growth', 'Strong demand from financial services', false);

-- Scenario overrides for testing complex variations
INSERT INTO scenario_overrides (scenario_id, asset_id, construction_cost_aed, annual_revenue_aed, operating_cost_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months) VALUES
-- Optimistic Dubai scenario
('s1111111-1111-1111-1111-111111111112', 'a1111111-1111-1111-1111-111111111111', 75000000, 22000000, 2200000, 98, 6.0, 28),
('s1111111-1111-1111-1111-111111111112', 'a1111111-1111-1111-1111-111111111112', 25000000, 10000000, 1000000, 92, 7.5, 16),
-- Stress scenario
('s1111111-1111-1111-1111-111111111113', 'a1111111-1111-1111-1111-111111111111', 85000000, 14000000, 2800000, 85, 7.5, 36),
('s1111111-1111-1111-1111-111111111113', 'a1111111-1111-1111-1111-111111111112', 30000000, 6000000, 1400000, 75, 9.0, 22),
-- Premium Saudi scenario
('s2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222221', 140000000, 32000000, 7000000, 85, 8.0, 32),
('s2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 100000000, 45000000, 10000000, 80, 7.5, 28),
-- London growth scenario
('s3333333-3333-3333-3333-333333333332', 'a3333333-3333-3333-3333-333333333331', 170000000, 28000000, 4000000, 98, 5.0, 28),
('s3333333-3333-3333-3333-333333333332', 'a3333333-3333-3333-3333-333333333332', 115000000, 20000000, 2800000, 95, 5.5, 22);

-- Complex contractor data with realistic phases and amounts
INSERT INTO project_contractors (id, project_id, name, phase, amount, start_date, expected_completion, status, risk_rating, contact_person, contact_email, notes) VALUES
-- Dubai Project Contractors
('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Emaar Construction LLC', 'Foundation & Structure', 45000000, '2024-01-15', '2025-06-30', 'in_progress', 'low', 'Ahmed Al-Rashid', 'ahmed@emaar.ae', 'Main structural contractor with excellent track record'),
('c1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Drake & Scull International', 'MEP Systems', 28000000, '2024-08-01', '2026-02-28', 'planned', 'medium', 'Sarah Johnson', 'sarah@dsi.ae', 'Mechanical, electrical & plumbing systems'),
('c1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'Alec Engineering', 'Facades & Finishing', 35000000, '2025-01-01', '2026-08-31', 'planned', 'low', 'Hassan Al-Mansoori', 'hassan@alec.ae', 'Premium finishing and facade work'),
('c1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 'Sobha Realty', 'Interior Fit-out', 22000000, '2025-09-01', '2027-03-31', 'planned', 'low', 'Priya Sharma', 'priya@sobha.com', 'Luxury interior finishing'),
-- Saudi Project Contractors
('c2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Saudi Binladin Group', 'Site Preparation & Infrastructure', 35000000, '2024-06-15', '2025-02-28', 'in_progress', 'medium', 'Omar Bin Rashid', 'omar@sbg.sa', 'Major infrastructure development'),
('c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'El Seif Engineering', 'Resort Construction', 85000000, '2024-10-01', '2026-04-30', 'planned', 'low', 'Khalid Al-Otaibi', 'khalid@elseif.sa', 'Hospitality construction specialist'),
('c2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'Nesma & Partners', 'Landscape & Recreation', 18000000, '2025-03-01', '2026-09-30', 'planned', 'low', 'Fatima Al-Zahra', 'fatima@nesma.sa', 'Luxury landscaping and pools'),
-- London Project Contractors
('c3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'Skanska UK', 'Main Construction', 165000000, '2024-03-15', '2026-01-31', 'in_progress', 'low', 'James Mitchell', 'james@skanska.co.uk', 'Primary construction contractor'),
('c3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 'Mace Group', 'Project Management', 8500000, '2024-03-01', '2026-09-30', 'in_progress', 'low', 'Emma Thompson', 'emma@macegroup.com', 'Overall project management'),
('c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Arup', 'Technical Consulting', 4200000, '2024-02-01', '2026-06-30', 'in_progress', 'low', 'David Chen', 'david@arup.com', 'Engineering and technical advisory');

-- Complex milestone schedules
INSERT INTO project_milestones (id, project_id, label, description, target_date, status) VALUES
-- Dubai Project Milestones
('m1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Planning Approval', 'Final planning and building permits approved', '2024-02-15', 'completed'),
('m1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Foundation Complete', 'Basement and foundation work finished', '2024-08-30', 'in_progress'),
('m1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'Structure Topped Out', 'Main structural work completed', '2025-09-15', 'planned'),
('m1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 'MEP Rough-In Complete', 'All MEP systems installed', '2026-03-31', 'planned'),
('m1111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111111', 'Facade Installation', 'External facade work completed', '2026-08-15', 'planned'),
('m1111111-1111-1111-1111-111111111116', '11111111-1111-1111-1111-111111111111', 'Interior Completion', 'All interior fit-out finished', '2027-02-28', 'planned'),
('m1111111-1111-1111-1111-111111111117', '11111111-1111-1111-1111-111111111111', 'Project Handover', 'Final inspections and handover', '2027-04-30', 'planned'),
-- Saudi Project Milestones
('m2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Environmental Clearance', 'All environmental approvals obtained', '2024-07-31', 'completed'),
('m2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Infrastructure Complete', 'Roads, utilities, and basic infrastructure', '2025-05-15', 'planned'),
('m2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'Villa Construction Start', 'Begin construction of luxury villas', '2025-01-15', 'planned'),
('m2222222-2222-2222-2222-222222222224', '22222222-2222-2222-2222-222222222222', 'Hotel Structure Complete', 'Main hotel building structure finished', '2025-11-30', 'planned'),
('m2222222-2222-2222-2222-222222222225', '22222222-2222-2222-2222-222222222222', 'Amenities Installation', 'Spa, pools, and recreation facilities', '2026-08-31', 'planned'),
('m2222222-2222-2222-2222-222222222226', '22222222-2222-2222-2222-222222222222', 'Resort Opening', 'Soft opening for initial operations', '2026-12-15', 'planned'),
-- London Project Milestones
('m3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'Site Acquisition', 'Land purchase and legal completion', '2024-02-28', 'completed'),
('m3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 'Demolition Complete', 'Existing structure demolished', '2024-05-31', 'in_progress'),
('m3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Excavation & Piling', 'Foundation work and basement excavation', '2024-09-30', 'planned'),
('m3333333-3333-3333-3333-333333333334', '33333333-3333-3333-3333-333333333333', 'Core & Shell Complete', 'Building envelope and structure finished', '2025-08-31', 'planned'),
('m3333333-3333-3333-3333-333333333335', '33333333-3333-3333-3333-333333333333', 'Tenant Fit-Out Start', 'Begin customized office fit-outs', '2025-12-01', 'planned'),
('m3333333-3333-3333-3333-333333333336', '33333333-3333-3333-3333-333333333333', 'First Tenant Move-In', 'Initial occupancy and operations', '2026-06-01', 'planned');

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
('SAR', 'GBP', 0.209);

-- Benchmark data for different asset types
INSERT INTO feasly_benchmarks (asset_type, avg_roi, avg_irr, avg_profit_margin) VALUES
('Mixed-Use', 18.5, 16.2, 22.5),
('Luxury Hospitality', 22.0, 19.8, 28.5),
('Premium Office', 15.2, 13.8, 18.7),
('High-End Residential', 16.8, 14.5, 24.3),
('Resort & Recreation', 20.5, 18.2, 26.8);

-- Sample export history for testing
INSERT INTO export_history (project_id, user_id, export_type, filename, scenario_id, exported_at) VALUES
('11111111-1111-1111-1111-111111111111', (SELECT id FROM auth.users LIMIT 1), 'PDF Report', 'dubai_tower_analysis_2024.pdf', 's1111111-1111-1111-1111-111111111111', '2024-01-15 10:30:00'),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM auth.users LIMIT 1), 'Excel Export', 'neom_resort_financials.xlsx', 's2222222-2222-2222-2222-222222222221', '2024-01-20 14:15:00'),
('33333333-3333-3333-3333-333333333333', (SELECT id FROM auth.users LIMIT 1), 'CSV Data', 'london_office_cashflow.csv', 's3333333-3333-3333-3333-333333333331', '2024-01-25 09:45:00');