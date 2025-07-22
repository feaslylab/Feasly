-- Create dummy data for admin user (admin@admin.com)
-- User ID: d8ef9fe2-26a9-4ed6-b7c2-e29154db13fc

-- Insert projects for admin user
INSERT INTO projects (id, name, description, user_id, currency_code, start_date, end_date, is_demo, zakat_applicable) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Riyadh Mixed-Use Development', 'Premium mixed-use development in Riyadh featuring residential, retail, and office spaces', 'd8ef9fe2-26a9-4ed6-b7c2-e29154db13fc', 'SAR', '2024-01-01', '2027-12-31', true, true),
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Dubai Marina Residential Tower', 'Luxury residential tower in Dubai Marina with premium amenities', 'd8ef9fe2-26a9-4ed6-b7c2-e29154db13fc', 'AED', '2024-03-01', '2027-06-30', true, false),
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'London Commercial Office', 'Grade A office building in Central London financial district', 'd8ef9fe2-26a9-4ed6-b7c2-e29154db13fc', 'GBP', '2024-02-01', '2026-12-31', true, false),
('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'Doha Retail Complex', 'Modern retail and entertainment complex in West Bay, Doha', 'd8ef9fe2-26a9-4ed6-b7c2-e29154db13fc', 'QAR', '2024-04-01', '2027-03-31', true, false);

-- Insert assets for admin user projects
INSERT INTO assets (id, project_id, name, asset_type, gfa_sqm, construction_cost_aed, annual_revenue_aed, operating_cost_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months, stabilization_period_months) VALUES
-- Riyadh Mixed-Use Development
('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Residential Tower A', 'residential', 45000, 165000000, 24750000, 7425000, 92, 6.5, 36, 12),
('f47ac10b-58cc-4372-a567-0e02b2c3d484', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Retail Podium', 'retail', 15000, 82500000, 16500000, 4950000, 88, 7.2, 30, 6),
('f47ac10b-58cc-4372-a567-0e02b2c3d485', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Office Tower B', 'office', 25000, 137500000, 22000000, 6600000, 90, 6.8, 34, 9),

-- Dubai Marina Residential Tower
('f47ac10b-58cc-4372-a567-0e02b2c3d486', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Marina Tower', 'residential', 60000, 330000000, 49500000, 14850000, 94, 6.0, 42, 15),

-- London Commercial Office
('f47ac10b-58cc-4372-a567-0e02b2c3d487', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'City Office Building', 'office', 35000, 525000000, 52500000, 15750000, 95, 5.5, 30, 12),

-- Doha Retail Complex
('f47ac10b-58cc-4372-a567-0e02b2c3d488', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'West Bay Mall', 'retail', 40000, 220000000, 35200000, 10560000, 85, 7.5, 36, 8);

-- Insert scenarios for admin user projects
INSERT INTO scenarios (id, project_id, name, description, is_base) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d489', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Base Case', 'Conservative baseline scenario', true),
('f47ac10b-58cc-4372-a567-0e02b2c3d490', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Base Case', 'Conservative baseline scenario', true),
('f47ac10b-58cc-4372-a567-0e02b2c3d491', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Base Case', 'Conservative baseline scenario', true),
('f47ac10b-58cc-4372-a567-0e02b2c3d492', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'Base Case', 'Conservative baseline scenario', true);

-- Insert project milestones for admin user projects
INSERT INTO project_milestones (project_id, label, target_date, status, description) VALUES
-- Riyadh Mixed-Use Development
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Site Acquisition', '2024-02-15', 'completed', 'Land purchase and legal documentation'),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Design Development', '2024-06-30', 'in_progress', 'Architectural and engineering design'),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Construction Start', '2024-09-01', 'planned', 'Groundbreaking and foundation work'),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Topping Out', '2026-03-15', 'planned', 'Structural completion'),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Project Completion', '2027-12-31', 'planned', 'Final handover and occupancy'),

-- Dubai Marina Residential Tower
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Permits Approval', '2024-04-15', 'completed', 'All regulatory approvals obtained'),
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Foundation Complete', '2024-12-01', 'in_progress', 'Foundation and basement levels'),
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Shell Complete', '2026-09-30', 'planned', 'Structural and MEP rough-in'),
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Fit-out Complete', '2027-06-30', 'planned', 'Interior finishing and delivery'),

-- London Commercial Office
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Planning Permission', '2024-03-30', 'completed', 'Local authority planning approval'),
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Demolition Complete', '2024-08-15', 'in_progress', 'Existing structure removal'),
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Construction Milestone', '2025-12-01', 'planned', 'Major construction progress'),
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Practical Completion', '2026-12-31', 'planned', 'Building ready for occupation'),

-- Doha Retail Complex
('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'Land Development', '2024-05-15', 'in_progress', 'Site preparation and utilities'),
('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'Structural Work', '2025-08-30', 'planned', 'Main structural construction'),
('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'Tenant Fit-out', '2026-12-15', 'planned', 'Retail tenant improvements'),
('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'Grand Opening', '2027-03-31', 'planned', 'Official opening and operations');

-- Insert project contractors for admin user projects (using valid phase values)
INSERT INTO project_contractors (project_id, name, phase, amount, status, risk_rating, contact_person, contact_email, start_date, expected_completion, notes) VALUES
-- Riyadh Mixed-Use Development
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Saudi Binladin Group', 'structure', 180000000, 'in_progress', 'low', 'Ahmed Al-Rashid', 'ahmed.rashid@sbg.com.sa', '2024-09-01', '2027-08-31', 'Main contractor for all construction phases'),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Al-Arrab Contracting', 'mep', 45000000, 'planned', 'medium', 'Khalid Al-Mutairi', 'k.mutairi@alarrab.com', '2025-01-15', '2027-06-30', 'Mechanical, electrical, and plumbing'),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Modern Systems Co.', 'other', 12000000, 'planned', 'low', 'Nasser Al-Qahtani', 'nasser@modernsystems.sa', '2026-03-01', '2027-10-31', 'Vertical transportation systems'),

-- Dubai Marina Residential Tower
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Arabtec Construction', 'structure', 285000000, 'in_progress', 'medium', 'Mohamed Al-Blooshi', 'm.blooshi@arabtec.com', '2024-05-01', '2027-04-30', 'Primary construction contractor'),
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Drake & Scull', 'facade', 52000000, 'planned', 'medium', 'Saeed Al-Mansoori', 's.mansoori@drakescull.com', '2025-03-01', '2027-02-28', 'MEP and building envelope'),

-- London Commercial Office
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Multiplex Construction', 'structure', 420000000, 'in_progress', 'low', 'James Thompson', 'j.thompson@multiplex.com', '2024-09-01', '2026-10-31', 'Principal contractor for office tower'),
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Bouygues UK', 'foundation', 95000000, 'planned', 'low', 'Philippe Dubois', 'p.dubois@bouygues-uk.com', '2024-11-01', '2025-12-31', 'Concrete and steel structure'),

-- Doha Retail Complex
('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'Consolidated Contractors', 'structure', 190000000, 'planned', 'medium', 'Omar Al-Thani', 'o.thani@ccc.com.qa', '2024-06-01', '2027-01-31', 'Complete construction delivery'),
('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'Midmac Contracting', 'fit_out', 35000000, 'planned', 'medium', 'Rashid Al-Kuwari', 'r.kuwari@midmac.com', '2026-09-01', '2027-02-28', 'Retail interior finishing');