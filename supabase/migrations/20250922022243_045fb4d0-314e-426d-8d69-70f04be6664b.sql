-- Agregar columnas para identificar colaboradores en solicitudes
ALTER TABLE public.solicitudes 
ADD COLUMN es_colaborador boolean DEFAULT false NOT NULL,
ADD COLUMN camara_colaborador_id uuid REFERENCES public.camaras(id);

-- Crear índice para mejor performance en consultas de colaboradores
CREATE INDEX idx_solicitudes_es_colaborador ON public.solicitudes(es_colaborador);
CREATE INDEX idx_solicitudes_camara_colaborador ON public.solicitudes(camara_colaborador_id);

-- Actualizar políticas RLS para colaboradores
-- Los usuarios de cámaras aliadas solo pueden ver colaboradores de su cámara
CREATE POLICY "Users can view collaborators from their chamber" ON public.solicitudes
FOR SELECT USING (
  es_colaborador = true AND (
    get_user_role() = 'admin'::text OR 
    get_user_role() = 'ccc'::text OR
    (get_user_role() = 'camara_aliada'::text AND camara_colaborador_id = (
      SELECT camara_id FROM profiles WHERE id = auth.uid()
    ))
  )
);

-- Actualizar la política existente de solicitudes para excluir colaboradores de la vista de empresas
-- Primero eliminamos la política existente
DROP POLICY IF EXISTS "Users can view requests from their chamber companies" ON public.solicitudes;

-- Crear nueva política que excluye colaboradores
CREATE POLICY "Users can view company requests from their chamber" ON public.solicitudes
FOR SELECT USING (
  es_colaborador = false AND (
    get_user_role() = 'admin'::text OR 
    nit_empresa IN (
      SELECT e.nit
      FROM empresas e
      JOIN profiles p ON e.camara_id = p.camara_id
      WHERE p.id = auth.uid()
    )
  )
);