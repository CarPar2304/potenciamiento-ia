-- Allow anonymous users to fetch list of chambers for the signup form
-- This is required because the /auth page is accessed before users log in
-- and current RLS only allows authenticated users to select from public.camaras

-- Create a SELECT policy for the anon role if it doesn't exist yet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename  = 'camaras' 
      AND policyname = 'Anonymous users can view chambers'
  ) THEN
    CREATE POLICY "Anonymous users can view chambers"
    ON public.camaras
    FOR SELECT
    TO anon
    USING (true);
  END IF;
END $$;
