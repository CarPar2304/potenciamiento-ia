-- Agregar configuración para webhook de aprobación de solicitudes si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.webhook_config WHERE name = 'Aprobar Solicitud') THEN
    INSERT INTO public.webhook_config (name, url, method, is_active)
    VALUES ('Aprobar Solicitud', 'https://n8n-n8n.5cj84u.easypanel.host/webhook-test/aprobar-solicitud', 'POST', false);
  END IF;
END
$$;