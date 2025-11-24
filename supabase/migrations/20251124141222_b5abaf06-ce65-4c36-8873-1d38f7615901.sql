-- Fix 1: Move vector extension from public schema to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION vector SET SCHEMA extensions;

-- Fix 2: Add SET search_path to all SECURITY DEFINER functions

-- Update get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_chamber_id UUID;
  ccc_chamber_id UUID;
  user_is_admin BOOLEAN;
BEGIN
  -- Obtener el ID de la cámara CCC
  SELECT id INTO ccc_chamber_id FROM public.camaras WHERE nit = '890399001';
  
  -- Obtener información del usuario actual
  SELECT camara_id, is_admin INTO user_chamber_id, user_is_admin 
  FROM public.profiles WHERE id = auth.uid();
  
  -- Determinar el rol basado en is_admin y cámara
  IF user_is_admin = true THEN
    RETURN 'admin';
  ELSIF user_chamber_id = ccc_chamber_id THEN
    RETURN 'ccc';
  ELSIF user_chamber_id IS NOT NULL THEN
    RETURN 'camara_aliada';
  ELSE
    RETURN 'user';
  END IF;
END;
$$;

-- Update set_user_admin function
CREATE OR REPLACE FUNCTION public.set_user_admin(user_id uuid, admin_status boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET is_admin = admin_status 
  WHERE id = user_id;
END;
$$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, email, camara_id, celular, cargo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    NEW.email,
    (NEW.raw_user_meta_data->>'camara_id')::uuid,
    NEW.raw_user_meta_data->>'celular',
    NEW.raw_user_meta_data->>'cargo'
  );
  RETURN NEW;
END;
$$;

-- Update sync_platzi_with_solicitudes function
CREATE OR REPLACE FUNCTION public.sync_platzi_with_solicitudes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Actualizar platzi_general con solicitud_id basado en email
  UPDATE public.platzi_general 
  SET solicitud_id = s.id
  FROM public.solicitudes s
  WHERE platzi_general.email = s.email 
  AND platzi_general.solicitud_id IS NULL;
  
  -- Actualizar platzi_seguimiento con solicitud_id basado en email
  UPDATE public.platzi_seguimiento 
  SET solicitud_id = s.id
  FROM public.solicitudes s
  WHERE platzi_seguimiento.email = s.email 
  AND platzi_seguimiento.solicitud_id IS NULL;
END;
$$;

-- Update has_approved_request function
CREATE OR REPLACE FUNCTION public.has_approved_request(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.solicitudes s
    WHERE s.email = user_email 
    AND s.estado = 'Aprobada'::estado_solicitud_enum
  );
$$;

-- Update get_chamber_by_email function
CREATE OR REPLACE FUNCTION public.get_chamber_by_email(user_email text)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.camara_id
  FROM public.solicitudes s
  JOIN public.empresas e ON s.nit_empresa = e.nit
  WHERE s.email = user_email
  LIMIT 1;
$$;