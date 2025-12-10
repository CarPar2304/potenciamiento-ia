-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create RLS policies for user_roles table
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Migrate existing admins from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles
WHERE is_admin = true
ON CONFLICT (user_id, role) DO NOTHING;

-- Update set_user_admin function with proper authorization check
CREATE OR REPLACE FUNCTION public.set_user_admin(user_id uuid, admin_status boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only existing admins can modify admin status
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can modify admin status';
  END IF;
  
  IF admin_status = true THEN
    -- Add admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Keep profiles.is_admin in sync for backward compatibility
    UPDATE public.profiles SET is_admin = true WHERE id = user_id;
  ELSE
    -- Remove admin role
    DELETE FROM public.user_roles WHERE user_id = set_user_admin.user_id AND role = 'admin';
    
    -- Keep profiles.is_admin in sync for backward compatibility
    UPDATE public.profiles SET is_admin = false WHERE id = user_id;
  END IF;
END;
$$;

-- Update get_user_role function to use user_roles table
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_chamber_id UUID;
  ccc_chamber_id UUID;
  user_is_admin BOOLEAN;
BEGIN
  -- Check if user has admin role in user_roles table
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN 'admin';
  END IF;
  
  -- Get CCC chamber ID
  SELECT id INTO ccc_chamber_id FROM public.camaras WHERE nit = '890399001';
  
  -- Get current user's chamber
  SELECT camara_id INTO user_chamber_id FROM public.profiles WHERE id = auth.uid();
  
  -- Determine role based on chamber
  IF user_chamber_id = ccc_chamber_id THEN
    RETURN 'ccc';
  ELSIF user_chamber_id IS NOT NULL THEN
    RETURN 'camara_aliada';
  ELSE
    RETURN 'user';
  END IF;
END;
$$;

-- Create trigger for updated_at on user_roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();