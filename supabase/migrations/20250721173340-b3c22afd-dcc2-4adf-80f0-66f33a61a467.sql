-- Create demo milestones for existing project
INSERT INTO project_milestones (project_id, label, target_date, status, description) VALUES
('bee8e7de-357f-4334-a591-978ebb11f446', 'Project Kickoff', '2024-01-15', 'completed', 'Initial project setup and team onboarding'),
('bee8e7de-357f-4334-a591-978ebb11f446', 'Design Phase Complete', '2024-03-30', 'completed', 'Architectural and engineering designs finalized'),
('bee8e7de-357f-4334-a591-978ebb11f446', 'Foundation Complete', '2024-06-15', 'in_progress', 'Foundation work and utilities installation'),
('bee8e7de-357f-4334-a591-978ebb11f446', 'Structure Complete', '2024-09-30', 'planned', 'Main structure and framing completion'),
('bee8e7de-357f-4334-a591-978ebb11f446', 'MEP Installation', '2024-12-15', 'planned', 'Mechanical, electrical, and plumbing systems'),
('bee8e7de-357f-4334-a591-978ebb11f446', 'Final Handover', '2025-03-30', 'planned', 'Project completion and client handover')
ON CONFLICT (project_id, label) DO NOTHING;

-- Create demo contractors for existing project
INSERT INTO project_contractors (project_id, name, phase, amount, status, risk_rating, contact_person, contact_email, start_date, expected_completion, notes) VALUES
('bee8e7de-357f-4334-a591-978ebb11f446', 'ABC Design Studio', 'design', 250000, 'completed', 'low', 'Sarah Johnson', 'sarah@abcdesign.com', '2024-01-15', '2024-03-30', 'Architectural design and planning'),
('bee8e7de-357f-4334-a591-978ebb11f446', 'Foundation Masters', 'foundation', 800000, 'in_progress', 'medium', 'Mike Rodriguez', 'mike@foundationmasters.com', '2024-04-01', '2024-06-15', 'Excavation and foundation work'),
('bee8e7de-357f-4334-a591-978ebb11f446', 'Steel Works Inc', 'structure', 1200000, 'planned', 'low', 'David Chen', 'david@steelworks.com', '2024-06-20', '2024-09-30', 'Steel structure and framing'),
('bee8e7de-357f-4334-a591-978ebb11f446', 'Elite MEP Solutions', 'mep', 650000, 'planned', 'high', 'Lisa Thompson', 'lisa@elitemep.com', '2024-10-01', '2024-12-15', 'Electrical and plumbing systems'),
('bee8e7de-357f-4334-a591-978ebb11f446', 'Premium Facades', 'facade', 450000, 'planned', 'medium', 'Ahmed Al-Mansouri', 'ahmed@premiumfacades.ae', '2024-11-01', '2025-01-30', 'Exterior facade and glazing'),
('bee8e7de-357f-4334-a591-978ebb11f446', 'Luxury Interiors', 'fit_out', 550000, 'planned', 'medium', 'Emily Davis', 'emily@luxuryinteriors.com', '2025-02-01', '2025-03-15', 'Interior fit-out and finishes')
ON CONFLICT (project_id, name) DO NOTHING;