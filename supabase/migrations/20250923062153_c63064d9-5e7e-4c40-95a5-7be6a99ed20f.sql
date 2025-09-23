-- Fix RLS policies for OD requests to allow proper authentication flow

-- Update the insert policy to be more specific about authentication
DROP POLICY IF EXISTS "Authenticated can insert od_requests" ON public.od_requests;

CREATE POLICY "Students can insert their own requests" 
ON public.od_requests 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);

-- Also ensure the students can view policy allows for newly created requests
-- This policy already exists but let's make it more robust

DROP POLICY IF EXISTS "Students can view their requests" ON public.od_requests;

CREATE POLICY "Students can view their requests" 
ON public.od_requests 
FOR SELECT 
TO authenticated
USING (
  (owner_id = auth.uid()) OR 
  ((current_registration_number() IS NOT NULL) AND (student_ids_array @> ARRAY[current_registration_number()]))
);