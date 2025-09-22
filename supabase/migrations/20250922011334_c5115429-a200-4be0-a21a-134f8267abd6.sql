-- Allow NULL values for si_no_enum fields in empresas table
ALTER TABLE public.empresas ALTER COLUMN decision_adoptar_ia DROP NOT NULL;
ALTER TABLE public.empresas ALTER COLUMN invirtio_ia_2024 DROP NOT NULL;
ALTER TABLE public.empresas ALTER COLUMN asigno_recursos_ia DROP NOT NULL;
ALTER TABLE public.empresas ALTER COLUMN plan_capacitacion_ia DROP NOT NULL;