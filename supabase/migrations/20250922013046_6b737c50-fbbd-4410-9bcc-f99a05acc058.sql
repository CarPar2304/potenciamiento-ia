-- Add unique constraints to support upsert operations for Platzi imports
-- This enables idempotent imports from Ajustes.tsx using onConflict targets

-- platzi_general: unique by email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'platzi_general_email_key'
  ) THEN
    ALTER TABLE public.platzi_general
    ADD CONSTRAINT platzi_general_email_key UNIQUE (email);
  END IF;
END $$;

-- platzi_seguimiento: unique by (email, id_curso)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'platzi_seguimiento_email_id_curso_key'
  ) THEN
    ALTER TABLE public.platzi_seguimiento
    ADD CONSTRAINT platzi_seguimiento_email_id_curso_key UNIQUE (email, id_curso);
  END IF;
END $$;
