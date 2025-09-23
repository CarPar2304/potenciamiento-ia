-- Activar el webhook "Aprobar Solicitud" 
UPDATE webhook_config 
SET is_active = true 
WHERE name = 'Aprobar Solicitud';