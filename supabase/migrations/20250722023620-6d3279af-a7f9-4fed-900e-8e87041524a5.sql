-- Update existing demo projects with proper status and tags for testing

UPDATE projects 
SET 
  status = CASE 
    WHEN name LIKE '%Dubai%' THEN 'active'::project_status
    WHEN name LIKE '%NEOM%' THEN 'draft'::project_status  
    WHEN name LIKE '%London%' THEN 'active'::project_status
    ELSE 'draft'::project_status
  END,
  tags = CASE 
    WHEN name LIKE '%Dubai%' THEN ARRAY['Mixed Use', 'Residential', 'Retail', 'Office']
    WHEN name LIKE '%NEOM%' THEN ARRAY['Hospitality', 'Luxury', 'Resort', 'Tourism']
    WHEN name LIKE '%London%' THEN ARRAY['Office', 'Commercial', 'Grade A', 'Financial District']
    ELSE ARRAY['Development']
  END,
  is_pinned = CASE 
    WHEN name LIKE '%Dubai%' THEN true
    ELSE false
  END
WHERE is_demo = true;