-- Remove enum from platzi_seguimiento table and convert to TEXT
-- This allows more flexibility in handling different status values from Excel imports

-- Change estado_curso column from enum to TEXT
ALTER TABLE public.platzi_seguimiento 
ALTER COLUMN estado_curso TYPE TEXT USING estado_curso::TEXT;

-- Drop the enum type (only if it's not used elsewhere)
DROP TYPE IF EXISTS public.estado_curso_enum;