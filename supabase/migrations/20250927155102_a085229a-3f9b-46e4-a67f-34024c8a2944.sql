-- Agregar columna razon_rechazo a la tabla solicitudes
ALTER TABLE public.solicitudes 
ADD COLUMN razon_rechazo TEXT;