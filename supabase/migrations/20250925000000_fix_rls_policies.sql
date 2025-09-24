-- Fix RLS policies for the OD request system

-- Temporarily disable RLS to allow the migration to proceed
ALTER TABLE public.od_requests DISABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to insert OD requests
CREATE POLICY allow_all_authenticated_insert 
ON public.od_requests 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow all authenticated users to select OD requests
CREATE POLICY allow_all_authenticated_select
ON public.od_requests
FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated users to update OD requests
CREATE POLICY allow_all_authenticated_update
ON public.od_requests
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE public.od_requests ENABLE ROW LEVEL SECURITY;