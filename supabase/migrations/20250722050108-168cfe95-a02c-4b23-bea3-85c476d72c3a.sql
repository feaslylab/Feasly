-- Insert demo financial summaries for existing demo projects
-- This will help showcase AI summaries with KPIs

-- Get the project IDs for demo projects
INSERT INTO financial_summaries (project_id, total_revenue, total_cost, profit_margin, irr, payback_period, computed_at)
SELECT 
  p.id as project_id,
  CASE 
    WHEN p.name LIKE '%Dubai Marina%' THEN 450000000.00  -- 450M AED revenue
    WHEN p.name LIKE '%NEOM%' THEN 280000000.00         -- 280M AED revenue
    WHEN p.name LIKE '%London%' THEN 180000000.00       -- 180M AED revenue
    ELSE 100000000.00
  END as total_revenue,
  CASE 
    WHEN p.name LIKE '%Dubai Marina%' THEN 358000000.00  -- 358M AED cost
    WHEN p.name LIKE '%NEOM%' THEN 225000000.00         -- 225M AED cost  
    WHEN p.name LIKE '%London%' THEN 148000000.00       -- 148M AED cost
    ELSE 85000000.00
  END as total_cost,
  CASE 
    WHEN p.name LIKE '%Dubai Marina%' THEN 0.204        -- 20.4% profit margin
    WHEN p.name LIKE '%NEOM%' THEN 0.196               -- 19.6% profit margin
    WHEN p.name LIKE '%London%' THEN 0.178             -- 17.8% profit margin
    ELSE 0.15
  END as profit_margin,
  CASE 
    WHEN p.name LIKE '%Dubai Marina%' THEN 18.2         -- 18.2% IRR
    WHEN p.name LIKE '%NEOM%' THEN 15.8                -- 15.8% IRR
    WHEN p.name LIKE '%London%' THEN 14.5              -- 14.5% IRR
    ELSE 12.0
  END as irr,
  CASE 
    WHEN p.name LIKE '%Dubai Marina%' THEN 48           -- 48 months payback
    WHEN p.name LIKE '%NEOM%' THEN 54                  -- 54 months payback
    WHEN p.name LIKE '%London%' THEN 52                -- 52 months payback
    ELSE 60
  END as payback_period,
  NOW() as computed_at
FROM projects p 
WHERE p.is_demo = true 
AND NOT EXISTS (
  SELECT 1 FROM financial_summaries fs 
  WHERE fs.project_id = p.id
);