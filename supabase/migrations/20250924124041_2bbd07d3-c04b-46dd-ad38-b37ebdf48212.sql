-- Add tipo_sociedad column to empresas table
ALTER TABLE public.empresas 
ADD COLUMN tipo_sociedad TEXT;