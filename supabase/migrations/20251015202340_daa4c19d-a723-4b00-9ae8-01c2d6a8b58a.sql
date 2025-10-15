
-- Eliminar la foreign key incorrecta que apunta a solicitudes
ALTER TABLE public.platzi_seguimiento 
DROP CONSTRAINT IF EXISTS platzi_seguimiento_email_fkey;

-- Asegurar que email en platzi_general sea único (si no lo es ya)
ALTER TABLE public.platzi_general 
DROP CONSTRAINT IF EXISTS platzi_general_email_key;

ALTER TABLE public.platzi_general 
ADD CONSTRAINT platzi_general_email_key UNIQUE (email);

-- Crear la nueva foreign key que apunta a platzi_general
ALTER TABLE public.platzi_seguimiento 
ADD CONSTRAINT platzi_seguimiento_email_fkey 
FOREIGN KEY (email) 
REFERENCES public.platzi_general(email) 
ON DELETE CASCADE;

-- Crear índice para mejorar performance en joins
CREATE INDEX IF NOT EXISTS idx_platzi_seguimiento_email 
ON public.platzi_seguimiento(email);
