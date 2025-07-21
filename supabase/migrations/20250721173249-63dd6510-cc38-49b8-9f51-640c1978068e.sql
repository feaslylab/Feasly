-- Create demo project for FeaslyModel component
INSERT INTO projects (id, name, user_id, description)
VALUES ('demo-project-123', 'Demo Project', '88fd1f21-08b9-4e58-bc20-8c75fef1e7f5', 'Demo project for Feasly Model component')
ON CONFLICT (id) DO NOTHING;

-- Create demo milestones
INSERT INTO project_milestones (project_id, label, target_date, status, description) VALUES
('demo-project-123', 'Project Kickoff', '2024-01-15', 'completed', 'Initial project setup and team onboarding'),
('demo-project-123', 'Design Phase Complete', '2024-03-30', 'completed', 'Architectural and engineering designs finalized'),
('demo-project-123', 'Foundation Complete', '2024-06-15', 'in_progress', 'Foundation work and utilities installation'),
('demo-project-123', 'Structure Complete', '2024-09-30', 'planned', 'Main structure and framing completion'),
('demo-project-123', 'MEP Installation', '2024-12-15', 'planned', 'Mechanical, electrical, and plumbing systems'),
('demo-project-123', 'Final Handover', '2025-03-30', 'planned', 'Project completion and client handover')
ON CONFLICT DO NOTHING;

-- Create demo contractors
INSERT INTO project_contractors (project_id, name, phase, amount, status, risk_rating, contact_person, contact_email, start_date, expected_completion, notes) VALUES
('demo-project-123', 'ABC Design Studio', 'design', 250000, 'completed', 'low', 'Sarah Johnson', 'sarah@abcdesign.com', '2024-01-15', '2024-03-30', 'Architectural design and planning'),
('demo-project-123', 'Foundation Masters', 'foundation', 800000, 'in_progress', 'medium', 'Mike Rodriguez', 'mike@foundationmasters.com', '2024-04-01', '2024-06-15', 'Excavation and foundation work'),
('demo-project-123', 'Steel Works Inc', 'structure', 1200000, 'planned', 'low', 'David Chen', 'david@steelworks.com', '2024-06-20', '2024-09-30', 'Steel structure and framing'),
('demo-project-123', 'Elite MEP Solutions', 'mep', 650000, 'planned', 'high', 'Lisa Thompson', 'lisa@elitemep.com', '2024-10-01', '2024-12-15', 'Electrical and plumbing systems'),
('demo-project-123', 'Premium Facades', 'facade', 450000, 'planned', 'medium', 'Ahmed Al-Mansouri', 'ahmed@premiumfacades.ae', '2024-11-01', '2025-01-30', 'Exterior facade and glazing'),
('demo-project-123', 'Luxury Interiors', 'fit_out', 550000, 'planned', 'medium', 'Emily Davis', 'emily@luxuryinteriors.com', '2025-02-01', '2025-03-15', 'Interior fit-out and finishes')
ON CONFLICT DO NOTHING;