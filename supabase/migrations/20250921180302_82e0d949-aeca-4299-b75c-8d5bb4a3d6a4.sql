-- Paso 2: Eliminar columnas solicitud_id y recrear estructura correcta con email como clave
-- Los reportes de Platzi solo contienen email, no IDs internos

-- 1. Eliminar las columnas solicitud_id que no son necesarias
ALTER TABLE public.platzi_general DROP COLUMN IF EXISTS solicitud_id;
ALTER TABLE public.platzi_seguimiento DROP COLUMN IF EXISTS solicitud_id;

-- 2. Eliminar índices relacionados con solicitud_id (si existen)
DROP INDEX IF EXISTS idx_platzi_general_solicitud_id;
DROP INDEX IF EXISTS idx_platzi_seguimiento_solicitud_id;

-- 3. Asegurar que el email sea único en solicitudes para evitar duplicados
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'solicitudes_email_key' 
        AND table_name = 'solicitudes'
    ) THEN
        ALTER TABLE public.solicitudes ADD CONSTRAINT solicitudes_email_key UNIQUE (email);
    END IF;
END $$;

-- 4. Crear índices de email para performance
CREATE INDEX IF NOT EXISTS idx_platzi_general_email ON public.platzi_general(email);
CREATE INDEX IF NOT EXISTS idx_platzi_seguimiento_email ON public.platzi_seguimiento(email);
CREATE INDEX IF NOT EXISTS idx_solicitudes_email ON public.solicitudes(email);

-- 5. Crear función para validar si un email tiene solicitud aprobada
CREATE OR REPLACE FUNCTION public.has_approved_request(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.solicitudes s
    WHERE s.email = user_email 
    AND s.estado = 'Aprobado'::estado_solicitud_enum
  );
$function$;

-- 6. Crear función para obtener la cámara de un email
CREATE OR REPLACE FUNCTION public.get_chamber_by_email(user_email text)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT e.camara_id
  FROM public.solicitudes s
  JOIN public.empresas e ON s.empresa_id = e.id
  WHERE s.email = user_email
  LIMIT 1;
$function$;

-- 7. Recrear todas las políticas RLS usando email como clave de relación

-- Políticas para platzi_general
CREATE POLICY "Admins can manage all platzi data" 
ON public.platzi_general 
FOR ALL 
USING (get_user_role() = 'admin'::text);

CREATE POLICY "Users can view platzi data from their chamber" 
ON public.platzi_general 
FOR SELECT 
USING (
  get_user_role() = 'admin'::text OR 
  (
    email IN (
      SELECT s.email
      FROM public.solicitudes s
      JOIN public.empresas e ON s.empresa_id = e.id
      JOIN public.profiles p ON e.camara_id = p.camara_id
      WHERE p.id = auth.uid()
    )
  )
);

-- Políticas para platzi_seguimiento
CREATE POLICY "Admins can manage all platzi tracking" 
ON public.platzi_seguimiento 
FOR ALL 
USING (get_user_role() = 'admin'::text);

CREATE POLICY "Users can view platzi tracking from their chamber" 
ON public.platzi_seguimiento 
FOR SELECT 
USING (
  get_user_role() = 'admin'::text OR 
  (
    email IN (
      SELECT s.email
      FROM public.solicitudes s
      JOIN public.empresas e ON s.empresa_id = e.id
      JOIN public.profiles p ON e.camara_id = p.camara_id
      WHERE p.id = auth.uid()
    )
  )
);

-- 8. Eliminar función de sincronización que ya no es necesaria
DROP FUNCTION IF EXISTS public.sync_platzi_with_solicitudes();