-- Actualizar la función handle_new_user para manejar los nuevos campos del registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;