-- Reestructurar tablas de Platzi para usar email como clave y eliminar columna id

-- platzi_general: PK por email + FK a solicitudes(email)
DO $$
BEGIN
  -- 1) Quitar PK existente si la hay
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.platzi_general'::regclass 
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.platzi_general DROP CONSTRAINT IF EXISTS platzi_general_pkey;
  END IF;

  -- 2) Eliminar columna id si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'platzi_general' AND column_name = 'id'
  ) THEN
    ALTER TABLE public.platzi_general DROP COLUMN id;
  END IF;

  -- 3) Crear PK por email si no existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.platzi_general'::regclass 
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.platzi_general ADD CONSTRAINT platzi_general_pkey PRIMARY KEY (email);
  END IF;

  -- 4) Crear FK a solicitudes(email) si no existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'platzi_general_email_fkey'
  ) THEN
    ALTER TABLE public.platzi_general 
      ADD CONSTRAINT platzi_general_email_fkey 
      FOREIGN KEY (email) REFERENCES public.solicitudes(email) ON DELETE CASCADE;
  END IF;
END $$;

-- platzi_seguimiento: PK compuesta (email, id_curso) + FK a solicitudes(email)
DO $$
BEGIN
  -- 1) Quitar PK existente si la hay
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.platzi_seguimiento'::regclass 
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.platzi_seguimiento DROP CONSTRAINT IF EXISTS platzi_seguimiento_pkey;
  END IF;

  -- 2) Eliminar columna id si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'platzi_seguimiento' AND column_name = 'id'
  ) THEN
    ALTER TABLE public.platzi_seguimiento DROP COLUMN id;
  END IF;

  -- 3) Asegurar PK compuesta (esto también forzará NOT NULL en ambas columnas)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.platzi_seguimiento'::regclass 
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.platzi_seguimiento ADD CONSTRAINT platzi_seguimiento_pkey PRIMARY KEY (email, id_curso);
  END IF;

  -- 4) Crear FK a solicitudes(email) si no existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'platzi_seguimiento_email_fkey'
  ) THEN
    ALTER TABLE public.platzi_seguimiento 
      ADD CONSTRAINT platzi_seguimiento_email_fkey 
      FOREIGN KEY (email) REFERENCES public.solicitudes(email) ON DELETE CASCADE;
  END IF;
END $$;
