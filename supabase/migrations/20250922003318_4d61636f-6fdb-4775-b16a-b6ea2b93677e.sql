-- Agregar columna nit_empresa a solicitudes
ALTER TABLE public.solicitudes 
ADD COLUMN nit_empresa TEXT;

-- Poblar la nueva columna con los NITs de las empresas relacionadas
UPDATE public.solicitudes 
SET nit_empresa = e.nit
FROM public.empresas e
WHERE solicitudes.empresa_id = e.id;

-- Hacer la columna nit_empresa obligatoria una vez poblada
ALTER TABLE public.solicitudes 
ALTER COLUMN nit_empresa SET NOT NULL;

-- Crear índice para mejorar performance
CREATE INDEX idx_solicitudes_nit_empresa ON public.solicitudes(nit_empresa);

-- Crear índice en empresas.nit si no existe
CREATE INDEX IF NOT EXISTS idx_empresas_nit ON public.empresas(nit);

-- Eliminar la columna empresa_id (UUID) ya que ahora usaremos nit_empresa
ALTER TABLE public.solicitudes 
DROP COLUMN empresa_id;