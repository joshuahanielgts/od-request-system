-- Add public storage policies for no-auth environment
CREATE POLICY "Public can upload files to od-documents bucket" 
ON storage.objects 
FOR INSERT 
TO public
WITH CHECK (bucket_id = 'od-documents');

CREATE POLICY "Public can view files in od-documents bucket" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'od-documents');