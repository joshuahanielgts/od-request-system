-- NOTE: This is PostgreSQL syntax which is what Supabase uses
-- The editor might show syntax errors but this is valid PostgreSQL code

-- Fix OD request submission issues by adjusting RLS policies

-- Remove the existing policy
DROP POLICY IF EXISTS "Allow all operations on od_requests" ON public.od_requests;

-- Create a simpler policy that allows authenticated users to perform all operations
CREATE POLICY "Allow authenticated operations on od_requests" 
ON public.od_requests 
FOR ALL 
TO authenticated 
USING (true);

-- Ensure RLS is enabled
ALTER TABLE public.od_requests ENABLE ROW LEVEL SECURITY;

-- Also fix storage permissions to ensure document uploads work
DROP POLICY IF EXISTS "Allow all operations on od-documents" ON storage.objects;

CREATE POLICY "Allow authenticated operations on od-documents" 
ON storage.objects 
FOR ALL 
TO authenticated 
USING (bucket_id = 'od-documents');