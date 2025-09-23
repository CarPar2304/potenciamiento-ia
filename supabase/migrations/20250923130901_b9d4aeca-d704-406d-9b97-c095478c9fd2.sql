-- Cambiar la columna grupo_etnico de enum a text
ALTER TABLE public.solicitudes 
ALTER COLUMN grupo_etnico TYPE text 
USING grupo_etnico::text;

-- Eliminar el enum que ya no se necesita
DROP TYPE IF EXISTS grupo_etnico_enum CASCADE;