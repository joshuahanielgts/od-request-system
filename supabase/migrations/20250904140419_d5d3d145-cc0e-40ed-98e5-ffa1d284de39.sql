-- Secure od_requests by removing public access and preserving role-based access
-- 1) Drop insecure public policies if they exist
DROP POLICY IF EXISTS "Public can read od_requests" ON public.od_requests;
DROP POLICY IF EXISTS "Public can insert od_requests" ON public.od_requests;
DROP POLICY IF EXISTS "Public can update od_requests" ON public.od_requests;

-- 2) Ensure RLS is enabled (idempotent)
ALTER TABLE public.od_requests ENABLE ROW LEVEL SECURITY;

-- 3) Preserve faculty visibility with a dedicated policy (only if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'od_requests' AND policyname = 'Faculty can view all requests'
  ) THEN
    CREATE POLICY "Faculty can view all requests"
    ON public.od_requests
    FOR SELECT
    USING ((auth.role() = 'authenticated'::text) AND has_profile_role('faculty'::text));
  END IF;
END$$;