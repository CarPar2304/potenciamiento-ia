-- Drop the old enum type and recreate it with new values
-- First, remove the constraint on the column
ALTER TABLE public.empresas ALTER COLUMN mercado DROP DEFAULT;
ALTER TABLE public.empresas ALTER COLUMN mercado TYPE text;

-- Drop the old enum
DROP TYPE IF EXISTS mercado_enum;

-- Create the new enum with updated values
CREATE TYPE mercado_enum AS ENUM (
  'Local (ciudad/municipio)',
  'Regional (departamento / región del país)',
  'Nacional',
  'Internacional'
);

-- Update the column to use the new enum
ALTER TABLE public.empresas ALTER COLUMN mercado TYPE mercado_enum USING 
  CASE 
    WHEN mercado = 'Local' THEN 'Local (ciudad/municipio)'::mercado_enum
    WHEN mercado = 'Nacional' THEN 'Nacional'::mercado_enum
    WHEN mercado = 'Internacional' THEN 'Internacional'::mercado_enum
    ELSE NULL
  END;