-- Add INSERT/UPDATE policies for Platzi data upload functionality
-- This allows admins to import Excel files from the Ajustes page

-- Drop existing ALL policies and recreate with proper permissions
DROP POLICY IF EXISTS "Admins can manage all platzi data" ON public.platzi_general;
DROP POLICY IF EXISTS "Admins can manage all platzi tracking" ON public.platzi_seguimiento;

-- Create comprehensive admin policies for platzi_general
CREATE POLICY "Admins can select platzi general data" 
ON public.platzi_general 
FOR SELECT 
TO public 
USING (get_user_role() = 'admin');

CREATE POLICY "Admins can insert platzi general data" 
ON public.platzi_general 
FOR INSERT 
TO public 
WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admins can update platzi general data" 
ON public.platzi_general 
FOR UPDATE 
TO public 
USING (get_user_role() = 'admin')
WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admins can delete platzi general data" 
ON public.platzi_general 
FOR DELETE 
TO public 
USING (get_user_role() = 'admin');

-- Create comprehensive admin policies for platzi_seguimiento
CREATE POLICY "Admins can select platzi tracking data" 
ON public.platzi_seguimiento 
FOR SELECT 
TO public 
USING (get_user_role() = 'admin');

CREATE POLICY "Admins can insert platzi tracking data" 
ON public.platzi_seguimiento 
FOR INSERT 
TO public 
WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admins can update platzi tracking data" 
ON public.platzi_seguimiento 
FOR UPDATE 
TO public 
USING (get_user_role() = 'admin')
WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admins can delete platzi tracking data" 
ON public.platzi_seguimiento 
FOR DELETE 
TO public 
USING (get_user_role() = 'admin');