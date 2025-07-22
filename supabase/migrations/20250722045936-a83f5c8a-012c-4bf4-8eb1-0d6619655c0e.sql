-- Update existing demo projects with AI summaries
UPDATE projects 
SET project_ai_summary = CASE 
  WHEN name LIKE '%Dubai Marina%' THEN 'Mixed Use development in Dubai Marina with luxury amenities and waterfront access.'
  WHEN name LIKE '%NEOM%' THEN 'Hospitality resort project in NEOM with sustainable tourism focus and premium facilities.'
  WHEN name LIKE '%London%' THEN 'Office development in London Financial District with Grade A commercial space.'
  ELSE 'Real estate development project with comprehensive financial analysis.'
END
WHERE is_demo = true AND project_ai_summary IS NULL;