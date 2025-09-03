-- Create storage bucket for OD documents
INSERT INTO storage.buckets (id, name, public) VALUES ('od-documents', 'od-documents', false);

-- Create RLS policies for the od-documents bucket

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload files to od-documents bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'od-documents' 
  AND auth.role() = 'authenticated'
);

-- Allow users to view files they uploaded
CREATE POLICY "Users can view their own files in od-documents bucket" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'od-documents' 
  AND auth.role() = 'authenticated'
);

-- Allow HOD to view all files in od-documents bucket
CREATE POLICY "HOD can view all files in od-documents bucket" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'od-documents' 
  AND auth.role() = 'authenticated'
  AND has_profile_role('hod'::text)
);

-- Allow Faculty to view all files in od-documents bucket  
CREATE POLICY "Faculty can view all files in od-documents bucket" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'od-documents' 
  AND auth.role() = 'authenticated'
  AND has_profile_role('faculty'::text)
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files in od-documents bucket" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'od-documents' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files in od-documents bucket" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'od-documents' 
  AND auth.role() = 'authenticated'
);