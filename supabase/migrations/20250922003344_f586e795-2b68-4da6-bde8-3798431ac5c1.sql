-- Primero agregar la columna nit_empresa y poblarla
ALTER TABLE public.solicitudes 
ADD COLUMN nit_empresa TEXT;

-- Poblar la nueva columna con los NITs de las empresas relacionadas
UPDATE public.solicitudes 
SET nit_empresa = e.nit
FROM public.empresas e
WHERE solicitudes.empresa_id = e.id;

-- Hacer la columna nit_empresa obligatoria
ALTER TABLE public.solicitudes 
ALTER COLUMN nit_empresa SET NOT NULL;

-- Crear índices para mejorar performance
CREATE INDEX idx_solicitudes_nit_empresa ON public.solicitudes(nit_empresa);
CREATE INDEX IF NOT EXISTS idx_empresas_nit ON public.empresas(nit);

-- Eliminar las políticas RLS existentes que dependen de empresa_id
DROP POLICY IF EXISTS "Users can view requests from their chamber companies" ON public.solicitudes;
DROP POLICY IF EXISTS "Users can view platzi data from their chamber" ON public.platzi_general;
DROP POLICY IF EXISTS "Users can view platzi tracking from their chamber" ON public.platzi_seguimiento;

-- Crear nuevas políticas RLS usando nit_empresa
CREATE POLICY "Users can view requests from their chamber companies" 
ON public.solicitudes 
FOR SELECT 
USING (
  (get_user_role() = 'admin'::text) OR 
  (nit_empresa IN (
    SELECT e.nit
    FROM empresas e
    JOIN profiles p ON e.camara_id = p.camara_id
    WHERE p.id = auth.uid()
  ))
);

-- Actualizar políticas de platzi para usar nit_empresa
CREATE POLICY "Users can view platzi data from their chamber" 
ON public.platzi_general 
FOR SELECT 
USING (
  (get_user_role() = 'admin'::text) OR 
  (email IN (
    SELECT s.email
    FROM solicitudes s
    JOIN empresas e ON s.nit_empresa = e.nit
    JOIN profiles p ON e.camara_id = p.camara_id
    WHERE p.id = auth.uid()
  ))
);

CREATE POLICY "Users can view platzi tracking from their chamber" 
ON public.platzi_seguimiento 
FOR SELECT 
USING (
  (get_user_role() = 'admin'::text) OR 
  (email IN (
    SELECT s.email
    FROM solicitudes s
    JOIN empresas e ON s.nit_empresa = e.nit
    JOIN profiles p ON e.camara_id = p.camara_id
    WHERE p.id = auth.uid()
  ))
);

-- Finalmente eliminar la columna empresa_id
ALTER TABLE public.solicitudes 
DROP COLUMN empresa_id;