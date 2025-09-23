-- Crear tabla para configuración de webhooks
CREATE TABLE public.webhook_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'POST',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.webhook_config ENABLE ROW LEVEL SECURITY;

-- Create policies for webhook config
CREATE POLICY "Admins can manage webhook config" 
ON public.webhook_config 
FOR ALL 
USING (get_user_role() = 'admin');

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_webhook_config_updated_at
BEFORE UPDATE ON public.webhook_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default webhook configuration
INSERT INTO public.webhook_config (name, url, method) 
VALUES ('Recordatorio Licencia', 'https://n8n-n8n.5cj84u.easypanel.host/webhook-test/6bbaf907-ae4e-4592-95f2-474b1caab123', 'POST');