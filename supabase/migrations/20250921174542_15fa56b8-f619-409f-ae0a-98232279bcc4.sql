-- Agregar columna is_admin a la tabla profiles
ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;

-- Actualizar la función get_user_role para incluir la verificación de is_admin
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
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
    RETURN 'ccc'; -- CCC sin admin explicit es solo CCC
  ELSIF user_chamber_id IS NOT NULL THEN
    RETURN 'camara_aliada';
  ELSE
    RETURN 'user';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Crear función para asignar rol admin a usuarios
CREATE OR REPLACE FUNCTION public.set_user_admin(user_id UUID, admin_status BOOLEAN)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET is_admin = admin_status 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Política RLS para permitir que los admins gestionen otros perfiles
CREATE POLICY "Admins can manage user admin status" ON public.profiles
  FOR UPDATE USING (public.get_user_role() = 'admin');