-- Drop existing restrictive policies and create new ones that allow CCC global read access

-- EMPRESAS TABLE: Allow CCC to view all companies globally
DROP POLICY IF EXISTS "Users can view companies from their chamber" ON public.empresas;
DROP POLICY IF EXISTS "Admins can manage all companies" ON public.empresas;

-- Create new policies for empresas
CREATE POLICY "Admins and CCC can view all companies" 
ON public.empresas 
FOR SELECT 
USING (get_user_role() = ANY(ARRAY['admin'::text, 'ccc'::text]));

CREATE POLICY "Chamber users can view companies from their chamber"
ON public.empresas
FOR SELECT
USING ((get_user_role() = 'camara_aliada'::text) AND (camara_id = (SELECT profiles.camara_id FROM profiles WHERE profiles.id = auth.uid())));

CREATE POLICY "Admins can manage all companies" 
ON public.empresas 
FOR ALL 
USING (get_user_role() = 'admin'::text);

-- SOLICITUDES TABLE: Allow CCC to view all requests globally
DROP POLICY IF EXISTS "Users can view collaborators from their chamber" ON public.solicitudes;
DROP POLICY IF EXISTS "Users can view company requests from their chamber" ON public.solicitudes;
DROP POLICY IF EXISTS "Admins can manage all requests" ON public.solicitudes;

-- Create new policies for solicitudes
CREATE POLICY "Admins and CCC can view all requests"
ON public.solicitudes
FOR SELECT
USING (get_user_role() = ANY(ARRAY['admin'::text, 'ccc'::text]));

CREATE POLICY "Chamber users can view collaborators from their chamber"
ON public.solicitudes
FOR SELECT
USING ((get_user_role() = 'camara_aliada'::text) AND (es_colaborador = true) AND (camara_colaborador_id = (SELECT profiles.camara_id FROM profiles WHERE profiles.id = auth.uid())));

CREATE POLICY "Chamber users can view company requests from their chamber"
ON public.solicitudes
FOR SELECT
USING ((get_user_role() = 'camara_aliada'::text) AND (es_colaborador = false) AND (nit_empresa IN (SELECT e.nit FROM empresas e JOIN profiles p ON e.camara_id = p.camara_id WHERE p.id = auth.uid())));

CREATE POLICY "Admins can manage all requests"
ON public.solicitudes
FOR ALL
USING (get_user_role() = 'admin'::text);

-- PLATZI_GENERAL TABLE: Allow CCC to view all Platzi data globally
DROP POLICY IF EXISTS "Users can view platzi data from their chamber" ON public.platzi_general;
DROP POLICY IF EXISTS "Admins can select platzi general data" ON public.platzi_general;
DROP POLICY IF EXISTS "Admins can insert platzi general data" ON public.platzi_general;
DROP POLICY IF EXISTS "Admins can update platzi general data" ON public.platzi_general;
DROP POLICY IF EXISTS "Admins can delete platzi general data" ON public.platzi_general;

-- Create new policies for platzi_general
CREATE POLICY "Admins and CCC can view all platzi general data"
ON public.platzi_general
FOR SELECT
USING (get_user_role() = ANY(ARRAY['admin'::text, 'ccc'::text]));

CREATE POLICY "Chamber users can view platzi data from their chamber"
ON public.platzi_general
FOR SELECT
USING ((get_user_role() = 'camara_aliada'::text) AND (email IN (SELECT s.email FROM solicitudes s JOIN empresas e ON s.nit_empresa = e.nit JOIN profiles p ON e.camara_id = p.camara_id WHERE p.id = auth.uid())));

CREATE POLICY "Admins can manage platzi general data"
ON public.platzi_general
FOR ALL
USING (get_user_role() = 'admin'::text);

-- PLATZI_SEGUIMIENTO TABLE: Allow CCC to view all tracking data globally
DROP POLICY IF EXISTS "Users can view platzi tracking from their chamber" ON public.platzi_seguimiento;
DROP POLICY IF EXISTS "Admins can select platzi tracking data" ON public.platzi_seguimiento;
DROP POLICY IF EXISTS "Admins can insert platzi tracking data" ON public.platzi_seguimiento;
DROP POLICY IF EXISTS "Admins can update platzi tracking data" ON public.platzi_seguimiento;
DROP POLICY IF EXISTS "Admins can delete platzi tracking data" ON public.platzi_seguimiento;

-- Create new policies for platzi_seguimiento
CREATE POLICY "Admins and CCC can view all platzi tracking data"
ON public.platzi_seguimiento
FOR SELECT
USING (get_user_role() = ANY(ARRAY['admin'::text, 'ccc'::text]));

CREATE POLICY "Chamber users can view platzi tracking from their chamber"
ON public.platzi_seguimiento
FOR SELECT
USING ((get_user_role() = 'camara_aliada'::text) AND (email IN (SELECT s.email FROM solicitudes s JOIN empresas e ON s.nit_empresa = e.nit JOIN profiles p ON e.camara_id = p.camara_id WHERE p.id = auth.uid())));

CREATE POLICY "Admins can manage platzi tracking data"
ON public.platzi_seguimiento
FOR ALL
USING (get_user_role() = 'admin'::text);

-- CRM_ACTIVIDADES TABLE: Allow CCC to view all activities but not create/modify them
DROP POLICY IF EXISTS "Admins and CCC can manage all activities" ON public.crm_actividades;
DROP POLICY IF EXISTS "Chamber users can view activities for their chamber" ON public.crm_actividades;

-- Create new policies for crm_actividades
CREATE POLICY "Admins and CCC can view all activities"
ON public.crm_actividades
FOR SELECT
USING (get_user_role() = ANY(ARRAY['admin'::text, 'ccc'::text]));

CREATE POLICY "Chamber users can view activities for their chamber"
ON public.crm_actividades
FOR SELECT
USING ((get_user_role() = 'camara_aliada'::text) AND (camara_id = (SELECT profiles.camara_id FROM profiles WHERE profiles.id = auth.uid())));

CREATE POLICY "Only admins can manage activities"
ON public.crm_actividades
FOR ALL
USING (get_user_role() = 'admin'::text);