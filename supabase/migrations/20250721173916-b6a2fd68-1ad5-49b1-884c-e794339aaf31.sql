-- Add comprehensive region-specific dummy data for testing

-- Saudi Arabia Projects
INSERT INTO projects (id, name, description, user_id, currency_code, start_date, end_date, is_demo, zakat_applicable, zakat_rate_percent) VALUES
('sa-riyadh-01', 'King Salman Mixed-Use Tower', 'Premium mixed-use development in Riyadh Financial District with residential, office, and retail components', 'bee8e7de-357f-4334-a591-978ebb11f446', 'SAR', '2024-01-01', '2026-12-31', true, true, 2.5),
('sa-jeddah-01', 'Red Sea Gateway Mall', 'Large-scale shopping and entertainment complex near King Abdulaziz International Airport', 'bee8e7de-357f-4334-a591-978ebb11f446', 'SAR', '2024-03-01', '2025-11-30', true, true, 2.5),
('sa-neom-01', 'NEOM Smart Residential Complex', 'Futuristic residential development with AI-integrated smart home technology', 'bee8e7de-357f-4334-a591-978ebb11f446', 'SAR', '2024-06-01', '2027-05-31', true, true, 2.5);

-- UAE Projects  
INSERT INTO projects (id, name, description, user_id, currency_code, start_date, end_date, is_demo, zakat_applicable, zakat_rate_percent) VALUES
('ae-dubai-01', 'Dubai Marina Luxury Towers', 'Twin luxury residential towers with marina views and premium amenities', 'bee8e7de-357f-4334-a591-978ebb11f446', 'AED', '2024-02-01', '2026-08-31', true, false, null),
('ae-abudhabi-01', 'Capital Gate Business Park', 'Modern office complex in Abu Dhabi with sustainable design features', 'bee8e7de-357f-4334-a591-978ebb11f446', 'AED', '2024-04-01', '2025-12-31', true, false, null),
('ae-sharjah-01', 'Sharjah Cultural Heritage Center', 'Mixed-use development combining cultural spaces with commercial areas', 'bee8e7de-357f-4334-a591-978ebb11f446', 'AED', '2024-05-01', '2026-03-31', true, false, null);

-- UK Projects
INSERT INTO projects (id, name, description, user_id, currency_code, start_date, end_date, is_demo, zakat_applicable, zakat_rate_percent) VALUES
('uk-london-01', 'Canary Wharf Residential Quarter', 'High-end residential development in London financial district', 'bee8e7de-357f-4334-a591-978ebb11f446', 'GBP', '2024-01-15', '2026-09-30', true, false, null),
('uk-manchester-01', 'MediaCity Innovation Hub', 'Tech-focused office and co-working space development', 'bee8e7de-357f-4334-a591-978ebb11f446', 'GBP', '2024-03-15', '2025-10-31', true, false, null);

-- Qatar Projects
INSERT INTO projects (id, name, description, user_id, currency_code, start_date, end_date, is_demo, zakat_applicable, zakat_rate_percent) VALUES
('qa-doha-01', 'West Bay Premium Offices', 'Grade A office development in Doha West Bay financial district', 'bee8e7de-357f-4334-a591-978ebb11f446', 'QAR', '2024-02-15', '2026-01-31', true, false, null),
('qa-lusail-01', 'Lusail Marina Residential', 'Waterfront residential complex with yacht club and amenities', 'bee8e7de-357f-4334-a591-978ebb11f446', 'QAR', '2024-07-01', '2027-06-30', true, false, null);

-- Assets for Saudi Arabia Projects
INSERT INTO assets (id, project_id, name, asset_type, gfa_sqm, construction_cost_aed, annual_revenue_aed, operating_cost_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months, stabilization_period_months) VALUES
-- King Salman Mixed-Use Tower
('sa-riyadh-01-res', 'sa-riyadh-01', 'Residential Component', 'Residential', 45000, 562500000, 112500000, 22500000, 95, 5.5, 36, 6),
('sa-riyadh-01-off', 'sa-riyadh-01', 'Office Component', 'Office', 25000, 375000000, 93750000, 18750000, 90, 6.0, 36, 12),
('sa-riyadh-01-ret', 'sa-riyadh-01', 'Retail Component', 'Retail', 8000, 120000000, 36000000, 7200000, 85, 7.0, 30, 3),

-- Red Sea Gateway Mall
('sa-jeddah-01-mal', 'sa-jeddah-01', 'Shopping Mall', 'Retail', 65000, 731250000, 219375000, 43875000, 88, 6.5, 24, 6),
('sa-jeddah-01-ent', 'sa-jeddah-01', 'Entertainment Zone', 'Entertainment', 15000, 225000000, 67500000, 13500000, 80, 8.0, 20, 3),

-- NEOM Smart Residential
('sa-neom-01-res', 'sa-neom-01', 'Smart Homes Phase 1', 'Residential', 60000, 900000000, 180000000, 36000000, 92, 5.0, 42, 9);

-- Assets for UAE Projects
INSERT INTO assets (id, project_id, name, asset_type, gfa_sqm, construction_cost_aed, annual_revenue_aed, operating_cost_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months, stabilization_period_months) VALUES
-- Dubai Marina Luxury Towers
('ae-dubai-01-tw1', 'ae-dubai-01', 'Tower 1 - Marina View', 'Residential', 35000, 420000000, 84000000, 16800000, 96, 5.2, 30, 6),
('ae-dubai-01-tw2', 'ae-dubai-01', 'Tower 2 - City View', 'Residential', 32000, 384000000, 76800000, 15360000, 94, 5.4, 30, 6),

-- Capital Gate Business Park
('ae-abudhabi-01-off', 'ae-abudhabi-01', 'Office Complex', 'Office', 40000, 480000000, 120000000, 24000000, 88, 6.2, 24, 12),
('ae-abudhabi-01-con', 'ae-abudhabi-01', 'Conference Center', 'Office', 8000, 120000000, 36000000, 7200000, 75, 7.5, 18, 6),

-- Sharjah Cultural Heritage Center
('ae-sharjah-01-cul', 'ae-sharjah-01', 'Cultural Spaces', 'Mixed', 20000, 280000000, 42000000, 8400000, 70, 6.8, 28, 9),
('ae-sharjah-01-com', 'ae-sharjah-01', 'Commercial Areas', 'Retail', 12000, 168000000, 50400000, 10080000, 85, 6.5, 24, 6);

-- Assets for UK Projects  
INSERT INTO assets (id, project_id, name, asset_type, gfa_sqm, construction_cost_aed, annual_revenue_aed, operating_cost_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months, stabilization_period_months) VALUES
-- Canary Wharf Residential Quarter
('uk-london-01-res', 'uk-london-01', 'Residential Units', 'Residential', 28000, 504000000, 75600000, 15120000, 97, 4.5, 32, 6),
('uk-london-01-ame', 'uk-london-01', 'Amenity Spaces', 'Mixed', 5000, 90000000, 18000000, 3600000, 85, 5.5, 24, 3),

-- MediaCity Innovation Hub
('uk-manchester-01-hub', 'uk-manchester-01', 'Innovation Hub', 'Office', 22000, 308000000, 77000000, 15400000, 90, 5.8, 20, 9);

-- Assets for Qatar Projects
INSERT INTO assets (id, project_id, name, asset_type, gfa_sqm, construction_cost_aed, annual_revenue_aed, operating_cost_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months, stabilization_period_months) VALUES
-- West Bay Premium Offices
('qa-doha-01-off', 'qa-doha-01', 'Premium Office Towers', 'Office', 45000, 495000000, 123750000, 24750000, 92, 5.8, 24, 12),

-- Lusail Marina Residential
('qa-lusail-01-res', 'qa-lusail-01', 'Marina Residences', 'Residential', 50000, 550000000, 110000000, 22000000, 94, 5.2, 36, 6),
('qa-lusail-01-yac', 'qa-lusail-01', 'Yacht Club', 'Entertainment', 8000, 88000000, 26400000, 5280000, 80, 7.2, 24, 6);

-- Scenarios for all projects
INSERT INTO scenarios (id, project_id, name, description, is_base) VALUES
-- Saudi Arabia
('sa-riyadh-01-base', 'sa-riyadh-01', 'Base Case', 'Conservative projections based on current market conditions', true),
('sa-riyadh-01-opt', 'sa-riyadh-01', 'Vision 2030 Optimistic', 'Optimistic scenario aligned with Saudi Vision 2030 growth targets', false),
('sa-jeddah-01-base', 'sa-jeddah-01', 'Base Case', 'Standard retail development assumptions', true),
('sa-neom-01-base', 'sa-neom-01', 'Base Case', 'NEOM development baseline projections', true),

-- UAE
('ae-dubai-01-base', 'ae-dubai-01', 'Base Case', 'Current Dubai marina market conditions', true),
('ae-dubai-01-expo', 'ae-dubai-01', 'Post-Expo Growth', 'Sustained growth following Expo 2020 legacy', false),
('ae-abudhabi-01-base', 'ae-abudhabi-01', 'Base Case', 'Abu Dhabi business district standard projections', true),
('ae-sharjah-01-base', 'ae-sharjah-01', 'Base Case', 'Sharjah cultural development baseline', true),

-- UK
('uk-london-01-base', 'uk-london-01', 'Base Case', 'London financial district market conditions', true),
('uk-manchester-01-base', 'uk-manchester-01', 'Base Case', 'Manchester tech sector growth projections', true),

-- Qatar
('qa-doha-01-base', 'qa-doha-01', 'Base Case', 'Doha Grade A office market conditions', true),
('qa-lusail-01-base', 'qa-lusail-01', 'Base Case', 'Lusail waterfront development projections', true);

-- Milestones for Saudi Arabia Projects
INSERT INTO project_milestones (project_id, label, target_date, status, description) VALUES
-- King Salman Mixed-Use Tower
('sa-riyadh-01', 'REGA Approval', '2024-02-15', 'completed', 'Real Estate General Authority development approval obtained'),
('sa-riyadh-01', 'Foundation Complete', '2024-08-30', 'in_progress', 'Deep foundation and basement construction completed'),
('sa-riyadh-01', 'Topping Out Ceremony', '2025-06-15', 'planned', 'Structural completion and traditional topping out'),
('sa-riyadh-01', 'MEP Installation', '2025-12-31', 'planned', 'Mechanical, electrical, and plumbing systems installation'),
('sa-riyadh-01', 'SABER Certification', '2026-09-30', 'planned', 'Saudi building code compliance certification'),
('sa-riyadh-01', 'Grand Opening', '2026-12-31', 'planned', 'Official opening and handover to operations team'),

-- Red Sea Gateway Mall
('sa-jeddah-01', 'MOMRA Permits', '2024-04-01', 'completed', 'Ministry of Municipal and Rural Affairs permits secured'),
('sa-jeddah-01', 'Structural Steel Complete', '2024-10-31', 'in_progress', 'Main structural framework completed'),
('sa-jeddah-01', 'Tenant Fit-Out Start', '2025-04-01', 'planned', 'Major anchor tenants begin fit-out work'),
('sa-jeddah-01', 'Soft Opening', '2025-09-30', 'planned', 'Limited operational opening for key tenants'),
('sa-jeddah-01', 'Grand Opening', '2025-11-30', 'planned', 'Full mall opening with all tenants operational');

-- Milestones for UAE Projects
INSERT INTO project_milestones (project_id, label, target_date, status, description) VALUES
-- Dubai Marina Luxury Towers
('ae-dubai-01', 'DLD Approval', '2024-03-15', 'completed', 'Dubai Land Department development approval'),
('ae-dubai-01', 'Piling Complete', '2024-07-31', 'in_progress', 'Foundation piling work for both towers completed'),
('ae-dubai-01', 'Tower 1 Handover', '2026-03-31', 'planned', 'First tower completion and unit handovers'),
('ae-dubai-01', 'Tower 2 Handover', '2026-08-31', 'planned', 'Second tower completion and final handovers'),

-- Capital Gate Business Park
('ae-abudhabi-01', 'ADDA Approval', '2024-05-01', 'completed', 'Abu Dhabi Department of Development approval'),
('ae-abudhabi-01', 'Core & Shell Complete', '2025-06-30', 'planned', 'Building envelope and core systems completed'),
('ae-abudhabi-01', 'LEED Gold Certification', '2025-10-31', 'planned', 'Green building certification achieved'),
('ae-abudhabi-01', 'First Tenant Move-In', '2025-12-31', 'planned', 'Initial tenant occupancy begins');

-- Milestones for UK Projects
INSERT INTO project_milestones (project_id, label, target_date, status, description) VALUES
-- Canary Wharf Residential Quarter
('uk-london-01', 'Planning Permission', '2024-02-28', 'completed', 'London Borough planning permission granted'),
('uk-london-01', 'Demolition Complete', '2024-05-31', 'completed', 'Site clearance and preparation completed'),
('uk-london-01', 'Basement Waterproofing', '2024-12-31', 'in_progress', 'Below-grade construction and waterproofing'),
('uk-london-01', 'Practical Completion', '2026-07-31', 'planned', 'Building completion ready for handover'),
('uk-london-01', 'Final Completions', '2026-09-30', 'planned', 'All unit sales completed and handed over');

-- Milestones for Qatar Projects  
INSERT INTO project_milestones (project_id, label, target_date, status, description) VALUES
-- West Bay Premium Offices
('qa-doha-01', 'MME Approval', '2024-03-30', 'completed', 'Ministry of Municipality approval obtained'),
('qa-doha-01', 'Substructure Complete', '2024-09-30', 'in_progress', 'Below-ground construction completed'),
('qa-doha-01', 'Superstructure Complete', '2025-06-30', 'planned', 'Above-ground structure completion'),
('qa-doha-01', 'GSAS 4-Star Certification', '2025-11-30', 'planned', 'Qatar green building certification'),
('qa-doha-01', 'Tenant Handover', '2026-01-31', 'planned', 'Ready for tenant fit-out and occupancy');

-- Contractors for Saudi Arabia Projects
INSERT INTO project_contractors (project_id, name, phase, amount, status, risk_rating, contact_person, contact_email, start_date, expected_completion, notes) VALUES
-- King Salman Mixed-Use Tower
('sa-riyadh-01', 'Al Rashid Trading & Contracting', 'main_contractor', 450000000, 'in_progress', 'low', 'Khalid Al-Rashid', 'khalid@alrashid.sa', '2024-01-15', '2026-10-31', 'Main construction contractor with strong KSA track record'),
('sa-riyadh-01', 'Saudi Engineering Consultants', 'design', 22500000, 'completed', 'low', 'Dr. Fahad Al-Otaibi', 'fahad@seconsult.sa', '2023-10-01', '2024-01-31', 'Local engineering design compliance'),
('sa-riyadh-01', 'Advanced MEP Systems', 'mep', 67500000, 'planned', 'medium', 'Ahmed Bin Saleh', 'ahmed@advancedmep.sa', '2025-01-01', '2025-11-30', 'Mechanical, electrical, and plumbing installation'),

-- Red Sea Gateway Mall  
('sa-jeddah-01', 'Saudi Binladin Group', 'main_contractor', 585000000, 'in_progress', 'low', 'Omar Binladin', 'omar@sbg.sa', '2024-03-15', '2025-10-31', 'Major infrastructure and construction contractor'),
('sa-jeddah-01', 'Jeddah Steel Works', 'structure', 87750000, 'in_progress', 'low', 'Mansour Al-Harbi', 'mansour@jeddahsteel.sa', '2024-04-01', '2024-12-31', 'Structural steel and framework'),
('sa-jeddah-01', 'Red Sea Fit-Out Specialists', 'fit_out', 73125000, 'planned', 'medium', 'Layla Al-Zahrani', 'layla@redsea-fitout.sa', '2025-02-01', '2025-09-30', 'Tenant spaces and common area fit-out');

-- Contractors for UAE Projects
INSERT INTO project_contractors (project_id, name, phase, amount, status, risk_rating, contact_person, contact_email, start_date, expected_completion, notes) VALUES
-- Dubai Marina Luxury Towers
('ae-dubai-01', 'ALEC Engineering & Construction', 'main_contractor', 644000000, 'in_progress', 'low', 'Michael Thompson', 'michael@alec.ae', '2024-02-15', '2026-07-31', 'Premium residential construction specialist'),
('ae-dubai-01', 'Emirates Steel Industries', 'structure', 96600000, 'in_progress', 'low', 'Saif Al-Mansouri', 'saif@emiratessteel.ae', '2024-03-01', '2025-01-31', 'High-rise structural steel work'),
('ae-dubai-01', 'Drake & Scull International', 'mep', 80500000, 'planned', 'medium', 'James Parker', 'james@dsi.ae', '2024-12-01', '2026-03-31', 'MEP systems for luxury developments'),

-- Capital Gate Business Park
('ae-abudhabi-01', 'Trojan General Contracting', 'main_contractor', 480000000, 'in_progress', 'low', 'Robert Johnson', 'robert@trojan.ae', '2024-04-15', '2025-11-30', 'Commercial office development specialist'),
('ae-abudhabi-01', 'Dutco Construction', 'facade', 72000000, 'planned', 'medium', 'Hassan Al-Bloushi', 'hassan@dutco.ae', '2024-10-01', '2025-08-31', 'Premium facade and curtain wall systems');

-- Contractors for UK Projects
INSERT INTO project_contractors (project_id, name, phase, amount, status, risk_rating, contact_person, contact_email, start_date, expected_completion, notes) VALUES
-- Canary Wharf Residential Quarter
('uk-london-01', 'Multiplex Construction', 'main_contractor', 475200000, 'in_progress', 'low', 'David Williams', 'david@multiplex.co.uk', '2024-01-20', '2026-08-31', 'High-end residential construction in London'),
('uk-london-01', 'Arup Group', 'design', 23760000, 'completed', 'low', 'Sarah Mitchell', 'sarah@arup.com', '2023-09-01', '2024-01-15', 'Structural and MEP engineering design'),
('uk-london-01', 'ISG Construction', 'fit_out', 59400000, 'planned', 'medium', 'Mark Thompson', 'mark@isgltd.com', '2026-01-01', '2026-07-31', 'High-end residential fit-out and finishes');

-- MediaCity Innovation Hub
('uk-manchester-01', 'BAM Construction', 'main_contractor', 246400000, 'in_progress', 'low', 'Peter Brown', 'peter@bam.co.uk', '2024-03-20', '2025-09-30', 'Commercial office construction specialist'),
('uk-manchester-01', 'Kier Construction', 'facade', 30800000, 'planned', 'medium', 'Emma Davis', 'emma@kier.co.uk', '2024-11-01', '2025-07-31', 'Modern facade and glazing systems');

-- Contractors for Qatar Projects
INSERT INTO project_contractors (project_id, name, phase, amount, status, risk_rating, contact_person, contact_email, start_date, expected_completion, notes) VALUES
-- West Bay Premium Offices
('qa-doha-01', 'Midmac Contracting', 'main_contractor', 396000000, 'in_progress', 'low', 'Ali Al-Kuwari', 'ali@midmac.com.qa', '2024-02-20', '2025-12-31', 'Premier office development contractor in Qatar'),
('qa-doha-01', 'Qatar Steel Industries', 'structure', 59400000, 'in_progress', 'low', 'Mohammed Al-Thani', 'mohammed@qsi.qa', '2024-04-01', '2024-12-31', 'Structural steel and concrete work'),
('qa-doha-01', 'Techno Q', 'mep', 49500000, 'planned', 'medium', 'Rashid Al-Mannai', 'rashid@technoq.qa', '2025-01-01', '2025-10-31', 'Advanced MEP systems for Grade A offices'),

-- Lusail Marina Residential
('qa-lusail-01', 'UCC Holding', 'main_contractor', 462000000, 'planned', 'low', 'Khalifa Al-Sulaiti', 'khalifa@uccqatar.com', '2024-07-15', '2027-05-31', 'Luxury residential development specialist'),
('qa-lusail-01', 'Gulf Contracting Company', 'marine_works', 88000000, 'planned', 'medium', 'Nasser Al-Kharafi', 'nasser@gcc-qatar.com', '2024-08-01', '2025-12-31', 'Marina and waterfront infrastructure');

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