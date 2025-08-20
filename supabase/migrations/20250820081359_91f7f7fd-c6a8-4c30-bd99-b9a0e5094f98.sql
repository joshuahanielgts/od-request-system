-- Secure od_requests RLS by removing overly permissive public access and adding authenticated-only policies

-- 1) Remove overly permissive policy
DROP POLICY IF EXISTS "Allow all operations on od_requests" ON public.od_requests;

-- 2) Create secure, authenticated-only policies
CREATE POLICY "Authenticated can read od_requests"
ON public.od_requests
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert od_requests"
ON public.od_requests
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update od_requests"
ON public.od_requests
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 3) Storage policies for private bucket access (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated can upload od-documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read od-documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update od-documents" ON storage.objects;

CREATE POLICY "Authenticated can upload od-documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'od-documents');

CREATE POLICY "Authenticated can read od-documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'od-documents');

CREATE POLICY "Authenticated can update od-documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'od-documents');