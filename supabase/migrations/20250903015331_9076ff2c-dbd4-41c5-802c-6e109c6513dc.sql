-- Fix storage policies to only allow authenticated users (not anonymous)

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload files to od-documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files in od-documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "HOD can view all files in od-documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Faculty can view all files in od-documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files in od-documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files in od-documents bucket" ON storage.objects;

-- Create secure policies that only allow authenticated users
CREATE POLICY "Authenticated users can upload files to od-documents bucket" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'od-documents');

CREATE POLICY "Authenticated users can view files in od-documents bucket" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'od-documents');

CREATE POLICY "Authenticated users can update files in od-documents bucket" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'od-documents');

CREATE POLICY "Authenticated users can delete files in od-documents bucket" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'od-documents');