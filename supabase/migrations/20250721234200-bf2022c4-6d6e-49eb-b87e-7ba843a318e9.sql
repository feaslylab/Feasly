-- Add comprehensive region-specific dummy data for testing

-- Saudi Arabia Projects
INSERT INTO projects (id, name, description, user_id, currency_code, start_date, end_date, is_demo, zakat_applicable, zakat_rate_percent) VALUES
('11111111-1111-1111-1111-111111111111', 'King Salman Mixed-Use Tower', 'Premium mixed-use development in Riyadh Financial District with residential, office, and retail components', '88fd1f21-08b9-4e58-bc20-8c75fef1e7f5', 'SAR', '2024-01-01', '2026-12-31', true, true, 2.5),
('22222222-2222-2222-2222-222222222222', 'Red Sea Gateway Mall', 'Large-scale shopping and entertainment complex near King Abdulaziz International Airport', '88fd1f21-08b9-4e58-bc20-8c75fef1e7f5', 'SAR', '2024-03-01', '2025-11-30', true, true, 2.5),
('33333333-3333-3333-3333-333333333333', 'NEOM Smart Residential Complex', 'Futuristic residential development with AI-integrated smart home technology', '88fd1f21-08b9-4e58-bc20-8c75fef1e7f5', 'SAR', '2024-06-01', '2027-05-31', true, true, 2.5);

-- UAE Projects  
INSERT INTO projects (id, name, description, user_id, currency_code, start_date, end_date, is_demo, zakat_applicable, zakat_rate_percent) VALUES
('44444444-4444-4444-4444-444444444444', 'Dubai Marina Luxury Towers', 'Twin luxury residential towers with marina views and premium amenities', '88fd1f21-08b9-4e58-bc20-8c75fef1e7f5', 'AED', '2024-02-01', '2026-08-31', true, false, null),
('55555555-5555-5555-5555-555555555555', 'Capital Gate Business Park', 'Modern office complex in Abu Dhabi with sustainable design features', '88fd1f21-08b9-4e58-bc20-8c75fef1e7f5', 'AED', '2024-04-01', '2025-12-31', true, false, null),
('66666666-6666-6666-6666-666666666666', 'Sharjah Cultural Heritage Center', 'Mixed-use development combining cultural spaces with commercial areas', '88fd1f21-08b9-4e58-bc20-8c75fef1e7f5', 'AED', '2024-05-01', '2026-03-31', true, false, null);

-- UK Projects
INSERT INTO projects (id, name, description, user_id, currency_code, start_date, end_date, is_demo, zakat_applicable, zakat_rate_percent) VALUES
('77777777-7777-7777-7777-777777777777', 'Canary Wharf Residential Quarter', 'High-end residential development in London financial district', '88fd1f21-08b9-4e58-bc20-8c75fef1e7f5', 'GBP', '2024-01-15', '2026-09-30', true, false, null),
('88888888-8888-8888-8888-888888888888', 'MediaCity Innovation Hub', 'Tech-focused office and co-working space development', '88fd1f21-08b9-4e58-bc20-8c75fef1e7f5', 'GBP', '2024-03-15', '2025-10-31', true, false, null);

-- Qatar Projects
INSERT INTO projects (id, name, description, user_id, currency_code, start_date, end_date, is_demo, zakat_applicable, zakat_rate_percent) VALUES
('99999999-9999-9999-9999-999999999999', 'West Bay Premium Offices', 'Grade A office development in Doha West Bay financial district', '88fd1f21-08b9-4e58-bc20-8c75fef1e7f5', 'QAR', '2024-02-15', '2026-01-31', true, false, null),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Lusail Marina Residential', 'Waterfront residential complex with yacht club and amenities', '88fd1f21-08b9-4e58-bc20-8c75fef1e7f5', 'QAR', '2024-07-01', '2027-06-30', true, false, null);

-- Assets for Saudi Arabia Projects
INSERT INTO assets (id, project_id, name, asset_type, gfa_sqm, construction_cost_aed, annual_revenue_aed, operating_cost_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months, stabilization_period_months) VALUES
-- King Salman Mixed-Use Tower
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Residential Component', 'Residential', 45000, 562500000, 112500000, 22500000, 95, 5.5, 36, 6),
('a1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Office Component', 'Office', 25000, 375000000, 93750000, 18750000, 90, 6.0, 36, 12),
('a1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'Retail Component', 'Retail', 8000, 120000000, 36000000, 7200000, 85, 7.0, 30, 3),

-- Red Sea Gateway Mall
('a2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Shopping Mall', 'Retail', 65000, 731250000, 219375000, 43875000, 88, 6.5, 24, 6),
('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Entertainment Zone', 'Entertainment', 15000, 225000000, 67500000, 13500000, 80, 8.0, 20, 3),

-- NEOM Smart Residential
('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Smart Homes Phase 1', 'Residential', 60000, 900000000, 180000000, 36000000, 92, 5.0, 42, 9);

-- Assets for UAE Projects
INSERT INTO assets (id, project_id, name, asset_type, gfa_sqm, construction_cost_aed, annual_revenue_aed, operating_cost_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months, stabilization_period_months) VALUES
-- Dubai Marina Luxury Towers
('a4444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', 'Tower 1 - Marina View', 'Residential', 35000, 420000000, 84000000, 16800000, 96, 5.2, 30, 6),
('a4444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444', 'Tower 2 - City View', 'Residential', 32000, 384000000, 76800000, 15360000, 94, 5.4, 30, 6),

-- Capital Gate Business Park
('a5555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 'Office Complex', 'Office', 40000, 480000000, 120000000, 24000000, 88, 6.2, 24, 12),
('a5555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555', 'Conference Center', 'Office', 8000, 120000000, 36000000, 7200000, 75, 7.5, 18, 6),

-- Sharjah Cultural Heritage Center
('a6666666-6666-6666-6666-666666666661', '66666666-6666-6666-6666-666666666666', 'Cultural Spaces', 'Mixed', 20000, 280000000, 42000000, 8400000, 70, 6.8, 28, 9),
('a6666666-6666-6666-6666-666666666662', '66666666-6666-6666-6666-666666666666', 'Commercial Areas', 'Retail', 12000, 168000000, 50400000, 10080000, 85, 6.5, 24, 6);

-- Assets for UK Projects  
INSERT INTO assets (id, project_id, name, asset_type, gfa_sqm, construction_cost_aed, annual_revenue_aed, operating_cost_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months, stabilization_period_months) VALUES
-- Canary Wharf Residential Quarter
('a7777777-7777-7777-7777-777777777771', '77777777-7777-7777-7777-777777777777', 'Residential Units', 'Residential', 28000, 504000000, 75600000, 15120000, 97, 4.5, 32, 6),
('a7777777-7777-7777-7777-777777777772', '77777777-7777-7777-7777-777777777777', 'Amenity Spaces', 'Mixed', 5000, 90000000, 18000000, 3600000, 85, 5.5, 24, 3),

-- MediaCity Innovation Hub
('a8888888-8888-8888-8888-888888888881', '88888888-8888-8888-8888-888888888888', 'Innovation Hub', 'Office', 22000, 308000000, 77000000, 15400000, 90, 5.8, 20, 9);

-- Assets for Qatar Projects
INSERT INTO assets (id, project_id, name, asset_type, gfa_sqm, construction_cost_aed, annual_revenue_aed, operating_cost_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months, stabilization_period_months) VALUES
-- West Bay Premium Offices
('a9999999-9999-9999-9999-999999999991', '99999999-9999-9999-9999-999999999999', 'Premium Office Towers', 'Office', 45000, 495000000, 123750000, 24750000, 92, 5.8, 24, 12),

-- Lusail Marina Residential
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Marina Residences', 'Residential', 50000, 550000000, 110000000, 22000000, 94, 5.2, 36, 6),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Yacht Club', 'Entertainment', 8000, 88000000, 26400000, 5280000, 80, 7.2, 24, 6);

-- Scenarios for all projects
INSERT INTO scenarios (id, project_id, name, description, is_base) VALUES
-- Saudi Arabia
('s1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Base Case', 'Conservative projections based on current market conditions', true),
('s1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Vision 2030 Optimistic', 'Optimistic scenario aligned with Saudi Vision 2030 growth targets', false),
('s2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Base Case', 'Standard retail development assumptions', true),
('s3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Base Case', 'NEOM development baseline projections', true),

-- UAE
('s4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Base Case', 'Current Dubai marina market conditions', true),
('s4444444-4444-4444-4444-444444444445', '44444444-4444-4444-4444-444444444444', 'Post-Expo Growth', 'Sustained growth following Expo 2020 legacy', false),
('s5555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'Base Case', 'Abu Dhabi business district standard projections', true),
('s6666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 'Base Case', 'Sharjah cultural development baseline', true),

-- UK
('s7777777-7777-7777-7777-777777777777', '77777777-7777-7777-7777-777777777777', 'Base Case', 'London financial district market conditions', true),
('s8888888-8888-8888-8888-888888888888', '88888888-8888-8888-8888-888888888888', 'Base Case', 'Manchester tech sector growth projections', true),

-- Qatar
('s9999999-9999-9999-9999-999999999999', '99999999-9999-9999-9999-999999999999', 'Base Case', 'Doha Grade A office market conditions', true),
('saaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Base Case', 'Lusail waterfront development projections', true);

-- Milestones for Saudi Arabia Projects
INSERT INTO project_milestones (project_id, label, target_date, status, description) VALUES
-- King Salman Mixed-Use Tower
('11111111-1111-1111-1111-111111111111', 'REGA Approval', '2024-02-15', 'completed', 'Real Estate General Authority development approval obtained'),
('11111111-1111-1111-1111-111111111111', 'Foundation Complete', '2024-08-30', 'in_progress', 'Deep foundation and basement construction completed'),
('11111111-1111-1111-1111-111111111111', 'Topping Out Ceremony', '2025-06-15', 'planned', 'Structural completion and traditional topping out'),
('11111111-1111-1111-1111-111111111111', 'MEP Installation', '2025-12-31', 'planned', 'Mechanical, electrical, and plumbing systems installation'),
('11111111-1111-1111-1111-111111111111', 'SABER Certification', '2026-09-30', 'planned', 'Saudi building code compliance certification'),
('11111111-1111-1111-1111-111111111111', 'Grand Opening', '2026-12-31', 'planned', 'Official opening and handover to operations team'),

-- Red Sea Gateway Mall
('22222222-2222-2222-2222-222222222222', 'MOMRA Permits', '2024-04-01', 'completed', 'Ministry of Municipal and Rural Affairs permits secured'),
('22222222-2222-2222-2222-222222222222', 'Structural Steel Complete', '2024-10-31', 'in_progress', 'Main structural framework completed'),
('22222222-2222-2222-2222-222222222222', 'Tenant Fit-Out Start', '2025-04-01', 'planned', 'Major anchor tenants begin fit-out work'),
('22222222-2222-2222-2222-222222222222', 'Soft Opening', '2025-09-30', 'planned', 'Limited operational opening for key tenants'),
('22222222-2222-2222-2222-222222222222', 'Grand Opening', '2025-11-30', 'planned', 'Full mall opening with all tenants operational');

-- Milestones for UAE Projects
INSERT INTO project_milestones (project_id, label, target_date, status, description) VALUES
-- Dubai Marina Luxury Towers
('44444444-4444-4444-4444-444444444444', 'DLD Approval', '2024-03-15', 'completed', 'Dubai Land Department development approval'),
('44444444-4444-4444-4444-444444444444', 'Piling Complete', '2024-07-31', 'in_progress', 'Foundation piling work for both towers completed'),
('44444444-4444-4444-4444-444444444444', 'Tower 1 Handover', '2026-03-31', 'planned', 'First tower completion and unit handovers'),
('44444444-4444-4444-4444-444444444444', 'Tower 2 Handover', '2026-08-31', 'planned', 'Second tower completion and final handovers'),

-- Capital Gate Business Park
('55555555-5555-5555-5555-555555555555', 'ADDA Approval', '2024-05-01', 'completed', 'Abu Dhabi Department of Development approval'),
('55555555-5555-5555-5555-555555555555', 'Core & Shell Complete', '2025-06-30', 'planned', 'Building envelope and core systems completed'),
('55555555-5555-5555-5555-555555555555', 'LEED Gold Certification', '2025-10-31', 'planned', 'Green building certification achieved'),
('55555555-5555-5555-5555-555555555555', 'First Tenant Move-In', '2025-12-31', 'planned', 'Initial tenant occupancy begins');

-- Milestones for UK Projects
INSERT INTO project_milestones (project_id, label, target_date, status, description) VALUES
-- Canary Wharf Residential Quarter
('77777777-7777-7777-7777-777777777777', 'Planning Permission', '2024-02-28', 'completed', 'London Borough planning permission granted'),
('77777777-7777-7777-7777-777777777777', 'Demolition Complete', '2024-05-31', 'completed', 'Site clearance and preparation completed'),
('77777777-7777-7777-7777-777777777777', 'Basement Waterproofing', '2024-12-31', 'in_progress', 'Below-grade construction and waterproofing'),
('77777777-7777-7777-7777-777777777777', 'Practical Completion', '2026-07-31', 'planned', 'Building completion ready for handover'),
('77777777-7777-7777-7777-777777777777', 'Final Completions', '2026-09-30', 'planned', 'All unit sales completed and handed over');

-- Milestones for Qatar Projects  
INSERT INTO project_milestones (project_id, label, target_date, status, description) VALUES
-- West Bay Premium Offices
('99999999-9999-9999-9999-999999999999', 'MME Approval', '2024-03-30', 'completed', 'Ministry of Municipality approval obtained'),
('99999999-9999-9999-9999-999999999999', 'Substructure Complete', '2024-09-30', 'in_progress', 'Below-ground construction completed'),
('99999999-9999-9999-9999-999999999999', 'Superstructure Complete', '2025-06-30', 'planned', 'Above-ground structure completion'),
('99999999-9999-9999-9999-999999999999', 'GSAS 4-Star Certification', '2025-11-30', 'planned', 'Qatar green building certification'),
('99999999-9999-9999-9999-999999999999', 'Tenant Handover', '2026-01-31', 'planned', 'Ready for tenant fit-out and occupancy');

-- Contractors for Saudi Arabia Projects
INSERT INTO project_contractors (project_id, name, phase, amount, status, risk_rating, contact_person, contact_email, start_date, expected_completion, notes) VALUES
-- King Salman Mixed-Use Tower
('11111111-1111-1111-1111-111111111111', 'Al Rashid Trading & Contracting', 'main_contractor', 450000000, 'in_progress', 'low', 'Khalid Al-Rashid', 'khalid@alrashid.sa', '2024-01-15', '2026-10-31', 'Main construction contractor with strong KSA track record'),
('11111111-1111-1111-1111-111111111111', 'Saudi Engineering Consultants', 'design', 22500000, 'completed', 'low', 'Dr. Fahad Al-Otaibi', 'fahad@seconsult.sa', '2023-10-01', '2024-01-31', 'Local engineering design compliance'),
('11111111-1111-1111-1111-111111111111', 'Advanced MEP Systems', 'mep', 67500000, 'planned', 'medium', 'Ahmed Bin Saleh', 'ahmed@advancedmep.sa', '2025-01-01', '2025-11-30', 'Mechanical, electrical, and plumbing installation'),

-- Red Sea Gateway Mall  
('22222222-2222-2222-2222-222222222222', 'Saudi Binladin Group', 'main_contractor', 585000000, 'in_progress', 'low', 'Omar Binladin', 'omar@sbg.sa', '2024-03-15', '2025-10-31', 'Major infrastructure and construction contractor'),
('22222222-2222-2222-2222-222222222222', 'Jeddah Steel Works', 'structure', 87750000, 'in_progress', 'low', 'Mansour Al-Harbi', 'mansour@jeddahsteel.sa', '2024-04-01', '2024-12-31', 'Structural steel and framework'),
('22222222-2222-2222-2222-222222222222', 'Red Sea Fit-Out Specialists', 'fit_out', 73125000, 'planned', 'medium', 'Layla Al-Zahrani', 'layla@redsea-fitout.sa', '2025-02-01', '2025-09-30', 'Tenant spaces and common area fit-out');

-- Contractors for UAE Projects
INSERT INTO project_contractors (project_id, name, phase, amount, status, risk_rating, contact_person, contact_email, start_date, expected_completion, notes) VALUES
-- Dubai Marina Luxury Towers
('44444444-4444-4444-4444-444444444444', 'ALEC Engineering & Construction', 'main_contractor', 644000000, 'in_progress', 'low', 'Michael Thompson', 'michael@alec.ae', '2024-02-15', '2026-07-31', 'Premium residential construction specialist'),
('44444444-4444-4444-4444-444444444444', 'Emirates Steel Industries', 'structure', 96600000, 'in_progress', 'low', 'Saif Al-Mansouri', 'saif@emiratessteel.ae', '2024-03-01', '2025-01-31', 'High-rise structural steel work'),
('44444444-4444-4444-4444-444444444444', 'Drake & Scull International', 'mep', 80500000, 'planned', 'medium', 'James Parker', 'james@dsi.ae', '2024-12-01', '2026-03-31', 'MEP systems for luxury developments'),

-- Capital Gate Business Park
('55555555-5555-5555-5555-555555555555', 'Trojan General Contracting', 'main_contractor', 480000000, 'in_progress', 'low', 'Robert Johnson', 'robert@trojan.ae', '2024-04-15', '2025-11-30', 'Commercial office development specialist'),
('55555555-5555-5555-5555-555555555555', 'Dutco Construction', 'facade', 72000000, 'planned', 'medium', 'Hassan Al-Bloushi', 'hassan@dutco.ae', '2024-10-01', '2025-08-31', 'Premium facade and curtain wall systems');

-- Contractors for UK Projects
INSERT INTO project_contractors (project_id, name, phase, amount, status, risk_rating, contact_person, contact_email, start_date, expected_completion, notes) VALUES
-- Canary Wharf Residential Quarter
('77777777-7777-7777-7777-777777777777', 'Multiplex Construction', 'main_contractor', 475200000, 'in_progress', 'low', 'David Williams', 'david@multiplex.co.uk', '2024-01-20', '2026-08-31', 'High-end residential construction in London'),
('77777777-7777-7777-7777-777777777777', 'Arup Group', 'design', 23760000, 'completed', 'low', 'Sarah Mitchell', 'sarah@arup.com', '2023-09-01', '2024-01-15', 'Structural and MEP engineering design'),
('77777777-7777-7777-7777-777777777777', 'ISG Construction', 'fit_out', 59400000, 'planned', 'medium', 'Mark Thompson', 'mark@isgltd.com', '2026-01-01', '2026-07-31', 'High-end residential fit-out and finishes'),

-- MediaCity Innovation Hub
('88888888-8888-8888-8888-888888888888', 'BAM Construction', 'main_contractor', 246400000, 'in_progress', 'low', 'Peter Brown', 'peter@bam.co.uk', '2024-03-20', '2025-09-30', 'Commercial office construction specialist'),
('88888888-8888-8888-8888-888888888888', 'Kier Construction', 'facade', 30800000, 'planned', 'medium', 'Emma Davis', 'emma@kier.co.uk', '2024-11-01', '2025-07-31', 'Modern facade and glazing systems');

-- Contractors for Qatar Projects
INSERT INTO project_contractors (project_id, name, phase, amount, status, risk_rating, contact_person, contact_email, start_date, expected_completion, notes) VALUES
-- West Bay Premium Offices
('99999999-9999-9999-9999-999999999999', 'Midmac Contracting', 'main_contractor', 396000000, 'in_progress', 'low', 'Ali Al-Kuwari', 'ali@midmac.com.qa', '2024-02-20', '2025-12-31', 'Premier office development contractor in Qatar'),
('99999999-9999-9999-9999-999999999999', 'Qatar Steel Industries', 'structure', 59400000, 'in_progress', 'low', 'Mohammed Al-Thani', 'mohammed@qsi.qa', '2024-04-01', '2024-12-31', 'Structural steel and concrete work'),
('99999999-9999-9999-9999-999999999999', 'Techno Q', 'mep', 49500000, 'planned', 'medium', 'Rashid Al-Mannai', 'rashid@technoq.qa', '2025-01-01', '2025-10-31', 'Advanced MEP systems for Grade A offices'),

-- Lusail Marina Residential
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UCC Holding', 'main_contractor', 462000000, 'planned', 'low', 'Khalifa Al-Sulaiti', 'khalifa@uccqatar.com', '2024-07-15', '2027-05-31', 'Luxury residential development specialist'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Gulf Contracting Company', 'marine_works', 88000000, 'planned', 'medium', 'Nasser Al-Kharafi', 'nasser@gcc-qatar.com', '2024-08-01', '2025-12-31', 'Marina and waterfront infrastructure');

-- Exchange rates updates for regional currencies
INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
('SAR', 'AED', 0.98),
('AED', 'SAR', 1.02),
('SAR', 'QAR', 0.97),
('QAR', 'SAR', 1.03),
('SAR', 'GBP', 0.21),
('GBP', 'SAR', 4.76),
('AED', 'QAR', 0.99),
('QAR', 'AED', 1.01),
('AED', 'GBP', 0.22),
('GBP', 'AED', 4.59),
('QAR', 'GBP', 0.22),
('GBP', 'QAR', 4.57)
ON CONFLICT (from_currency, to_currency) DO UPDATE SET 
rate = EXCLUDED.rate,
updated_at = now();

-- Add region-specific benchmark data
INSERT INTO feasly_benchmarks (asset_type, avg_roi, avg_irr, avg_profit_margin) VALUES
('Saudi_Residential', 18.5, 14.2, 22.3),
('Saudi_Office', 16.8, 12.5, 19.7),
('Saudi_Retail', 21.2, 16.8, 25.1),
('UAE_Residential', 15.3, 11.8, 18.9),
('UAE_Office', 14.7, 10.9, 17.2),
('UAE_Retail', 19.4, 15.1, 23.6),
('UK_Residential', 12.1, 8.9, 14.8),
('UK_Office', 11.5, 8.2, 13.6),
('Qatar_Office', 16.2, 12.1, 19.1),
('Qatar_Residential', 17.9, 13.7, 21.4)
ON CONFLICT (asset_type) DO UPDATE SET
avg_roi = EXCLUDED.avg_roi,
avg_irr = EXCLUDED.avg_irr,  
avg_profit_margin = EXCLUDED.avg_profit_margin,
updated_at = now();