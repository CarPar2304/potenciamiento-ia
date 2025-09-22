-- Eliminar la columna autorizacion_datos de la tabla solicitudes
ALTER TABLE public.solicitudes 
DROP COLUMN autorizacion_datos;