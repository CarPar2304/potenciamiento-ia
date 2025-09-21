-- Agregar foreign keys para relacionar datos de Platzi con solicitudes (versión corregida)
-- Esto permitirá rastrear desde la solicitud inicial hasta el progreso en Platzi

-- 1. Agregar columna solicitud_id a platzi_general si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'platzi_general' AND column_name = 'solicitud_id') THEN
        ALTER TABLE public.platzi_general 
        ADD COLUMN solicitud_id uuid REFERENCES public.solicitudes(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Agregar columna solicitud_id a platzi_seguimiento si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'platzi_seguimiento' AND column_name = 'solicitud_id') THEN
        ALTER TABLE public.platzi_seguimiento 
        ADD COLUMN solicitud_id uuid REFERENCES public.solicitudes(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_platzi_general_solicitud_id ON public.platzi_general(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_platzi_general_email ON public.platzi_general(email);
CREATE INDEX IF NOT EXISTS idx_platzi_seguimiento_solicitud_id ON public.platzi_seguimiento(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_platzi_seguimiento_email ON public.platzi_seguimiento(email);

-- 4. Crear función para sincronizar datos de Platzi con solicitudes por email
CREATE OR REPLACE FUNCTION public.sync_platzi_with_solicitudes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Actualizar platzi_general con solicitud_id basado en email
  UPDATE public.platzi_general 
  SET solicitud_id = s.id
  FROM public.solicitudes s
  WHERE platzi_general.email = s.email 
  AND platzi_general.solicitud_id IS NULL;
  
  -- Actualizar platzi_seguimiento con solicitud_id basado en email
  UPDATE public.platzi_seguimiento 
  SET solicitud_id = s.id
  FROM public.solicitudes s
  WHERE platzi_seguimiento.email = s.email 
  AND platzi_seguimiento.solicitud_id IS NULL;
END;
$function$;

-- 5. Actualizar políticas RLS para usar las nuevas relaciones
-- Política mejorada para platzi_general
DROP POLICY IF EXISTS "Users can view platzi data from their chamber" ON public.platzi_general;
CREATE POLICY "Users can view platzi data from their chamber" 
ON public.platzi_general 
FOR SELECT 
USING (
  get_user_role() = 'admin'::text OR 
  (
    solicitud_id IS NOT NULL AND 
    solicitud_id IN (
      SELECT s.id 
      FROM solicitudes s
      JOIN empresas e ON s.empresa_id = e.id
      JOIN profiles p ON e.camara_id = p.camara_id
      WHERE p.id = auth.uid()
    )
  ) OR
  (
    -- Fallback para datos sin solicitud_id pero con email coincidente
    solicitud_id IS NULL AND
    email IN (
      SELECT s.email
      FROM solicitudes s
      JOIN empresas e ON s.empresa_id = e.id
      JOIN profiles p ON e.camara_id = p.camara_id
      WHERE p.id = auth.uid()
    )
  )
);

-- Política mejorada para platzi_seguimiento
DROP POLICY IF EXISTS "Users can view platzi tracking from their chamber" ON public.platzi_seguimiento;
CREATE POLICY "Users can view platzi tracking from their chamber" 
ON public.platzi_seguimiento 
FOR SELECT 
USING (
  get_user_role() = 'admin'::text OR 
  (
    solicitud_id IS NOT NULL AND 
    solicitud_id IN (
      SELECT s.id 
      FROM solicitudes s
      JOIN empresas e ON s.empresa_id = e.id
      JOIN profiles p ON e.camara_id = p.camara_id
      WHERE p.id = auth.uid()
    )
  ) OR
  (
    -- Fallback para datos sin solicitud_id pero con email coincidente
    solicitud_id IS NULL AND
    email IN (
      SELECT s.email
      FROM solicitudes s
      JOIN empresas e ON s.empresa_id = e.id
      JOIN profiles p ON e.camara_id = p.camara_id
      WHERE p.id = auth.uid()
    )
  )
);

-- 6. Ejecutar la sincronización inicial
SELECT public.sync_platzi_with_solicitudes();