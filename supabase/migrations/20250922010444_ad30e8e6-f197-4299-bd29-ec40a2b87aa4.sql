-- Create enum for Yes/No values
CREATE TYPE si_no_enum AS ENUM ('Sí', 'No');

-- Add new enum columns
ALTER TABLE public.empresas 
ADD COLUMN decision_adoptar_ia_enum si_no_enum,
ADD COLUMN invirtio_ia_2024_enum si_no_enum,
ADD COLUMN asigno_recursos_ia_enum si_no_enum,
ADD COLUMN plan_capacitacion_ia_enum si_no_enum;

-- Migrate existing boolean data to enum
UPDATE public.empresas 
SET 
  decision_adoptar_ia_enum = CASE WHEN decision_adoptar_ia = true THEN 'Sí'::si_no_enum 
                                 WHEN decision_adoptar_ia = false THEN 'No'::si_no_enum 
                                 ELSE NULL END,
  invirtio_ia_2024_enum = CASE WHEN invirtio_ia_2024 = true THEN 'Sí'::si_no_enum 
                              WHEN invirtio_ia_2024 = false THEN 'No'::si_no_enum 
                              ELSE NULL END,
  asigno_recursos_ia_enum = CASE WHEN asigno_recursos_ia = true THEN 'Sí'::si_no_enum 
                                WHEN asigno_recursos_ia = false THEN 'No'::si_no_enum 
                                ELSE NULL END,
  plan_capacitacion_ia_enum = CASE WHEN plan_capacitacion_ia = true THEN 'Sí'::si_no_enum 
                                  WHEN plan_capacitacion_ia = false THEN 'No'::si_no_enum 
                                  ELSE NULL END;

-- Drop old boolean columns
ALTER TABLE public.empresas 
DROP COLUMN decision_adoptar_ia,
DROP COLUMN invirtio_ia_2024,
DROP COLUMN asigno_recursos_ia,
DROP COLUMN plan_capacitacion_ia;

-- Rename enum columns to original names
ALTER TABLE public.empresas 
RENAME COLUMN decision_adoptar_ia_enum TO decision_adoptar_ia;

ALTER TABLE public.empresas 
RENAME COLUMN invirtio_ia_2024_enum TO invirtio_ia_2024;

ALTER TABLE public.empresas 
RENAME COLUMN asigno_recursos_ia_enum TO asigno_recursos_ia;

ALTER TABLE public.empresas 
RENAME COLUMN plan_capacitacion_ia_enum TO plan_capacitacion_ia;