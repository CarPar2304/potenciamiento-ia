-- Paso 1: Eliminar políticas existentes que dependen de solicitud_id
DROP POLICY IF EXISTS "Users can view platzi data from their chamber" ON public.platzi_general;
DROP POLICY IF EXISTS "Users can view platzi tracking from their chamber" ON public.platzi_seguimiento;
DROP POLICY IF EXISTS "Admins can manage all platzi data" ON public.platzi_general;
DROP POLICY IF EXISTS "Admins can manage all platzi tracking" ON public.platzi_seguimiento;