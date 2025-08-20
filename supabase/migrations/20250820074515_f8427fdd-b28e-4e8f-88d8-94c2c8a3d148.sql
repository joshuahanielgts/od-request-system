-- Secure od_requests RLS by restricting to authenticated users only and add storage policies for private bucket access

-- 1) Remove overly permissive policy
DROP POLICY IF EXISTS "Allow all operations on od_requests" ON public.od_requests;

-- 2) Create secure, role-limited policies (authenticated only)
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

-- (Optional) Do not allow deletes by default for safety
DROP POLICY IF EXISTS "Authenticated can delete od_requests" ON public.od_requests;

-- 3) Storage: allow authenticated users to upload and read from the private bucket via signed URLs
-- Note: Signed URLs still require appropriate SELECT permissions to be generated
CREATE POLICY IF NOT EXISTS "Authenticated can upload od-documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'od-documents');

CREATE POLICY IF NOT EXISTS "Authenticated can read od-documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'od-documents');

CREATE POLICY IF NOT EXISTS "Authenticated can update od-documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'od-documents');