# Excel Import Setup Instructions

## 1. Create Storage Bucket

In your Supabase dashboard, go to Storage and create a new bucket:

1. Go to Storage > Buckets
2. Click "New bucket"
3. Name: `imports`
4. Public: `false` (private bucket)
5. Click "Create bucket"

## 2. Set up RLS Policy for Storage

Add the following RLS policy for the `imports` bucket:

```sql
-- Allow authenticated users to upload files to imports bucket
CREATE POLICY "Users can upload to imports bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'imports');

-- Allow authenticated users to delete their own files from imports bucket
CREATE POLICY "Users can delete their own files from imports bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'imports' AND owner = auth.uid());
```

## 3. Deploy Edge Function

Deploy the edge function using the Supabase CLI:

```bash
supabase functions deploy process-excel-import
```

## 4. Excel File Format Expected

The edge function currently creates mock data, but in a production environment, you would parse the Excel file with the following expected structure:

### Sheet 1: Project Information
- A1: Project Name
- A2: Project Description  
- A3: Start Date
- A4: End Date

### Sheet 2: Assets
Headers in Row 1:
- Asset Name
- Asset Type (Residential, Mixed Use, Retail, Hospitality, Infrastructure)
- GFA (sqm)
- Construction Cost (AED)
- Annual Revenue Potential (AED)
- Operating Cost (AED)
- Occupancy Rate (%)
- Cap Rate (%)
- Development Timeline (months)
- Stabilization Period (months)

## 5. Production Enhancement

For production use, you would need to:

1. Install Excel parsing library in the edge function:
   ```typescript
   import * as XLSX from 'https://esm.sh/xlsx@0.18.5'
   ```

2. Parse the actual Excel data instead of using mock data

3. Add proper validation for the Excel structure

4. Handle different sheet formats gracefully