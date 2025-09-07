-- Fix security warnings by ensuring all policies require authentication
-- Fix od_requests policies to require authenticated users only
DROP POLICY IF EXISTS "Students can view their requests" ON public.od_requests;
DROP POLICY IF EXISTS "HOD can view all requests" ON public.od_requests;
DROP POLICY IF EXISTS "Faculty can view all requests" ON public.od_requests;
DROP POLICY IF EXISTS "Owner can update own requests" ON public.od_requests;
DROP POLICY IF EXISTS "HOD can update any request" ON public.od_requests;
DROP POLICY IF EXISTS "Authenticated can insert od_requests (strict)" ON public.od_requests;

-- Create secure policies for od_requests (authenticated users only)
CREATE POLICY "Students can view their requests"
ON public.od_requests
FOR SELECT
TO authenticated
USING ((owner_id = auth.uid()) OR ((current_registration_number() IS NOT NULL) AND (student_ids_array @> ARRAY[current_registration_number()])));

CREATE POLICY "HOD can view all requests"
ON public.od_requests
FOR SELECT
TO authenticated
USING (has_profile_role('hod'::text));

CREATE POLICY "Faculty can view all requests"
ON public.od_requests
FOR SELECT
TO authenticated
USING (has_profile_role('faculty'::text));

CREATE POLICY "Owner can update own requests"
ON public.od_requests
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "HOD can update any request"
ON public.od_requests
FOR UPDATE
TO authenticated
USING (has_profile_role('hod'::text))
WITH CHECK (true);

CREATE POLICY "Authenticated can insert od_requests"
ON public.od_requests
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Fix profiles policies to be authenticated only
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix storage policies to require authentication
DROP POLICY IF EXISTS "Public can view files in od-documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view files in od-documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update files in od-documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete files in od-documents bucket" ON storage.objects;

-- Create secure storage policies
CREATE POLICY "Authenticated users can view files in od-documents bucket"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'od-documents');

CREATE POLICY "Authenticated users can insert files in od-documents bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'od-documents');

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