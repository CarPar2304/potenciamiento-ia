-- Agregar configuración para webhook de aprobación de solicitudes
INSERT INTO public.webhook_config (name, url, method, is_active)
VALUES ('Aprobar Solicitud', 'https://n8n-n8n.5cj84u.easypanel.host/webhook-test/aprobar-solicitud', 'POST', false)
ON CONFLICT (name) DO NOTHING;