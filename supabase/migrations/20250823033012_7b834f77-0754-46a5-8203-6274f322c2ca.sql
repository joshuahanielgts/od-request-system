-- Fix security warnings by ensuring all policies are restricted to authenticated users only

-- 1. Fix od_requests policies - ensure they only work for authenticated users, not anonymous
DROP POLICY IF EXISTS "Students can view their requests" ON public.od_requests;
DROP POLICY IF EXISTS "HOD can view all requests" ON public.od_requests;
DROP POLICY IF EXISTS "Owner can update own requests" ON public.od_requests;
DROP POLICY IF EXISTS "HOD can update any request" ON public.od_requests;
DROP POLICY IF EXISTS "Authenticated can insert od_requests (strict)" ON public.od_requests;

CREATE POLICY "Students can view their requests"
ON public.od_requests
FOR SELECT
TO authenticated
USING (
  auth.role() = 'authenticated' AND (
    (owner_id = auth.uid())
    OR (
      public.current_registration_number() IS NOT NULL
      AND student_ids_array @> array[public.current_registration_number()]
    )
  )
);

CREATE POLICY "HOD can view all requests"
ON public.od_requests
FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated' AND public.has_profile_role('hod'));

CREATE POLICY "Owner can update own requests"
ON public.od_requests
FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated' AND owner_id = auth.uid())
WITH CHECK (auth.role() = 'authenticated' AND owner_id = auth.uid());

CREATE POLICY "HOD can update any request"
ON public.od_requests
FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated' AND public.has_profile_role('hod'))
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert od_requests (strict)"
ON public.od_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- 2. Fix profiles policies - ensure they only work for authenticated users, not anonymous
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are insertable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are updatable by owner" ON public.profiles;

CREATE POLICY "Profiles are viewable by owner"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Profiles are insertable by owner"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Profiles are updatable by owner"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated' AND auth.uid() = user_id)
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- 3. Fix storage policies - ensure they only work for authenticated users, not anonymous
DROP POLICY IF EXISTS "Allow all operations on od-documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload od-documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read od-documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update od-documents" ON storage.objects;

CREATE POLICY "Authenticated can upload od-documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'od-documents');

CREATE POLICY "Authenticated can read od-documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated' AND bucket_id = 'od-documents');

CREATE POLICY "Authenticated can update od-documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated' AND bucket_id = 'od-documents')
WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'od-documents');