-- Actualizar política RLS para platzi_general
DROP POLICY IF EXISTS "Chamber users can view platzi data from their chamber" ON public.platzi_general;

CREATE POLICY "Chamber users can view platzi data from their chamber"
ON public.platzi_general
FOR SELECT
TO public
USING (
  (get_user_role() = 'camara_aliada'::text) AND (email IN (
    SELECT s.email
    FROM solicitudes s
    JOIN profiles p ON (p.id = auth.uid())
    WHERE (
      -- Caso 1: Solicitudes de empresas de su cámara
      (s.es_colaborador = false AND EXISTS(
        SELECT 1 FROM empresas e 
        WHERE e.nit = s.nit_empresa 
        AND e.camara_id = p.camara_id
      ))
      OR
      -- Caso 2: Colaboradores directos de su cámara
      (s.es_colaborador = true AND s.camara_colaborador_id = p.camara_id)
    )
  ))
);

-- Actualizar política RLS para platzi_seguimiento
DROP POLICY IF EXISTS "Chamber users can view platzi tracking from their chamber" ON public.platzi_seguimiento;

CREATE POLICY "Chamber users can view platzi tracking from their chamber"
ON public.platzi_seguimiento
FOR SELECT
TO public
USING (
  (get_user_role() = 'camara_aliada'::text) AND (email IN (
    SELECT s.email
    FROM solicitudes s
    JOIN profiles p ON (p.id = auth.uid())
    WHERE (
      -- Caso 1: Solicitudes de empresas de su cámara
      (s.es_colaborador = false AND EXISTS(
        SELECT 1 FROM empresas e 
        WHERE e.nit = s.nit_empresa 
        AND e.camara_id = p.camara_id
      ))
      OR
      -- Caso 2: Colaboradores directos de su cámara
      (s.es_colaborador = true AND s.camara_colaborador_id = p.camara_id)
    )
  ))
);