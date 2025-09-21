-- Asegurar constraint único en solicitudes.email antes de crear FKs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.solicitudes'::regclass 
      AND contype = 'u'
      AND conkey = ARRAY[
        (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.solicitudes'::regclass AND attname = 'email')
      ]
  ) THEN
    ALTER TABLE public.solicitudes ADD CONSTRAINT solicitudes_email_key UNIQUE (email);
  END IF;
END $$;

-- Reintentar reestructurar platzi_general y platzi_seguimiento
DO $$
BEGIN
  -- platzi_general
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.platzi_general'::regclass AND contype = 'p') THEN
    ALTER TABLE public.platzi_general DROP CONSTRAINT IF EXISTS platzi_general_pkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'platzi_general' AND column_name = 'id') THEN
    ALTER TABLE public.platzi_general DROP COLUMN id;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.platzi_general'::regclass AND contype = 'p') THEN
    ALTER TABLE public.platzi_general ADD CONSTRAINT platzi_general_pkey PRIMARY KEY (email);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'platzi_general_email_fkey') THEN
    ALTER TABLE public.platzi_general 
      ADD CONSTRAINT platzi_general_email_fkey 
      FOREIGN KEY (email) REFERENCES public.solicitudes(email) ON DELETE CASCADE;
  END IF;

  -- platzi_seguimiento
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.platzi_seguimiento'::regclass AND contype = 'p') THEN
    ALTER TABLE public.platzi_seguimiento DROP CONSTRAINT IF EXISTS platzi_seguimiento_pkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'platzi_seguimiento' AND column_name = 'id') THEN
    ALTER TABLE public.platzi_seguimiento DROP COLUMN id;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.platzi_seguimiento'::regclass AND contype = 'p') THEN
    ALTER TABLE public.platzi_seguimiento ADD CONSTRAINT platzi_seguimiento_pkey PRIMARY KEY (email, id_curso);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'platzi_seguimiento_email_fkey') THEN
    ALTER TABLE public.platzi_seguimiento 
      ADD CONSTRAINT platzi_seguimiento_email_fkey 
      FOREIGN KEY (email) REFERENCES public.solicitudes(email) ON DELETE CASCADE;
  END IF;
END $$;