-- Temporary public access to od_requests due to no-auth requirement
-- NOTE: This is insecure for production. Revert to authenticated policies when auth is added.

-- Create permissive policies for anonymous (public) access
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'od_requests' AND policyname = 'Public can read od_requests'
  ) THEN
    CREATE POLICY "Public can read od_requests"
    ON public.od_requests
    FOR SELECT
    TO public
    USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'od_requests' AND policyname = 'Public can insert od_requests'
  ) THEN
    CREATE POLICY "Public can insert od_requests"
    ON public.od_requests
    FOR INSERT
    TO public
    WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'od_requests' AND policyname = 'Public can update od_requests'
  ) THEN
    CREATE POLICY "Public can update od_requests"
    ON public.od_requests
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;
