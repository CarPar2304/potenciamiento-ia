-- Add INSERT/UPDATE policies for Platzi data upload functionality
-- This allows admins to import Excel files from the Ajustes page

-- Allow admins to insert into platzi_general
CREATE POLICY IF NOT EXISTS "Admins can insert platzi general data" 
ON public.platzi_general 
FOR INSERT 
TO public 
WITH CHECK (get_user_role() = 'admin');

-- Allow admins to update platzi_general  
CREATE POLICY IF NOT EXISTS "Admins can update platzi general data" 
ON public.platzi_general 
FOR UPDATE 
TO public 
USING (get_user_role() = 'admin')
WITH CHECK (get_user_role() = 'admin');

-- Allow admins to insert into platzi_seguimiento
CREATE POLICY IF NOT EXISTS "Admins can insert platzi tracking data" 
ON public.platzi_seguimiento 
FOR INSERT 
TO public 
WITH CHECK (get_user_role() = 'admin');

-- Allow admins to update platzi_seguimiento
CREATE POLICY IF NOT EXISTS "Admins can update platzi tracking data" 
ON public.platzi_seguimiento 
FOR UPDATE 
TO public 
USING (get_user_role() = 'admin')
WITH CHECK (get_user_role() = 'admin');