-- Create insights table for content management
CREATE TABLE public.insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  autor_id UUID REFERENCES auth.users(id) NOT NULL,
  audiencia TEXT NOT NULL CHECK (audiencia IN ('admin', 'ccc', 'camara_aliada', 'todos')),
  fecha_publicacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for insights
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- Create policies for insights
CREATE POLICY "Admins can manage all insights" 
ON public.insights 
FOR ALL 
USING (get_user_role() = 'admin');

CREATE POLICY "Users can view insights based on audience" 
ON public.insights 
FOR SELECT 
USING (
  activo = true AND (
    audiencia = 'todos' OR
    (audiencia = 'admin' AND get_user_role() = 'admin') OR
    (audiencia = 'ccc' AND get_user_role() IN ('admin', 'ccc')) OR
    (audiencia = 'camara_aliada' AND get_user_role() IN ('admin', 'ccc', 'camara_aliada'))
  )
);

-- Create CRM activities table for camera management
CREATE TABLE public.crm_actividades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  camara_id UUID REFERENCES public.camaras(id) NOT NULL,
  tipo_actividad TEXT NOT NULL CHECK (tipo_actividad IN ('reunion', 'llamada', 'email', 'capacitacion', 'seguimiento', 'asignacion_licencias', 'otro')),
  descripcion TEXT NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  usuario_id UUID REFERENCES auth.users(id) NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completado', 'cancelado')),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for crm_actividades
ALTER TABLE public.crm_actividades ENABLE ROW LEVEL SECURITY;

-- Create policies for crm_actividades
CREATE POLICY "Admins and CCC can manage all activities" 
ON public.crm_actividades 
FOR ALL 
USING (get_user_role() IN ('admin', 'ccc'));

CREATE POLICY "Chamber users can view activities for their chamber" 
ON public.crm_actividades 
FOR SELECT 
USING (
  get_user_role() IN ('admin', 'ccc') OR
  (get_user_role() = 'camara_aliada' AND camara_id = (
    SELECT camara_id FROM public.profiles WHERE id = auth.uid()
  ))
);

-- Create triggers for updated_at columns
CREATE TRIGGER update_insights_updated_at
  BEFORE UPDATE ON public.insights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_actividades_updated_at
  BEFORE UPDATE ON public.crm_actividades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();