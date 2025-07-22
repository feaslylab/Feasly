-- Update demo project AI summaries with KPI information
UPDATE projects 
SET project_ai_summary = CASE 
  WHEN name LIKE '%Dubai Marina%' THEN 'Mixed Use development in Dubai Marina with 18.2% IRR and 92.0M AED net profit from luxury amenities and waterfront access.'
  WHEN name LIKE '%NEOM%' THEN 'Hospitality resort in NEOM with 15.8% IRR and 55.0M AED net profit from sustainable tourism and premium facilities.'
  WHEN name LIKE '%London%' THEN 'Office development in London Financial District with 14.5% IRR and 32.0M AED net profit from Grade A commercial space.'
  ELSE 'Real estate development project with comprehensive financial analysis and performance metrics.'
END
WHERE is_demo = true;