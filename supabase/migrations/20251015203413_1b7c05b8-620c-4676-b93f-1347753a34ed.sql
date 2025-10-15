BEGIN;

-- Drop existing FK on platzi_seguimiento.email (currently points to platzi_general)
ALTER TABLE public.platzi_seguimiento 
  DROP CONSTRAINT IF EXISTS platzi_seguimiento_email_fkey;

-- Recreate FK to point back to solicitudes(email)
ALTER TABLE public.platzi_seguimiento 
  ADD CONSTRAINT platzi_seguimiento_email_fkey 
  FOREIGN KEY (email) 
  REFERENCES public.solicitudes(email)
  ON DELETE CASCADE;

-- Keep helper index (no-op if exists)
CREATE INDEX IF NOT EXISTS idx_platzi_seguimiento_email 
  ON public.platzi_seguimiento(email);

COMMIT;