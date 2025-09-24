-- Remove primary key constraint from email column in platzi_general
ALTER TABLE public.platzi_general DROP CONSTRAINT IF EXISTS platzi_general_pkey;

-- Add new id column as UUID primary key (if it doesn't exist)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'platzi_general' AND column_name = 'id') THEN
        ALTER TABLE public.platzi_general ADD COLUMN id UUID DEFAULT gen_random_uuid();
    END IF;
END $$;

-- Set id as primary key
ALTER TABLE public.platzi_general ADD CONSTRAINT platzi_general_pkey PRIMARY KEY (id);

-- Create index on email for efficient lookups (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_platzi_general_email ON public.platzi_general(email);

-- Update any existing records to ensure they have an id
UPDATE public.platzi_general SET id = gen_random_uuid() WHERE id IS NULL;