-- Crear enums para tipos de datos
CREATE TYPE public.tipo_identificacion_enum AS ENUM (
  'Tarjeta_Identidad',
  'Cedula_Ciudadania', 
  'Cedula_Extranjeria',
  'Pasaporte',
  'Permiso_Permanencia_Temporal'
);

CREATE TYPE public.genero_enum AS ENUM (
  'Masculino',
  'Femenino', 
  'Otro',
  'Prefiero_no_decir'
);

CREATE TYPE public.mercado_enum AS ENUM (
  'Local',
  'Nacional',
  'Internacional'
);

CREATE TYPE public.estado_solicitud_enum AS ENUM (
  'Pendiente',
  'Aprobada',
  'Rechazada'
);

CREATE TYPE public.estado_curso_enum AS ENUM (
  'En_progreso',
  'Completado',
  'Certificado'
);

-- Tabla de cámaras de comercio
CREATE TABLE public.camaras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  nit TEXT NOT NULL UNIQUE,
  licencias_disponibles INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de perfiles de usuarios (conectada a auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  cargo TEXT,
  celular TEXT,
  camara_id UUID REFERENCES public.camaras(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de empresas
CREATE TABLE public.empresas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  nit TEXT NOT NULL UNIQUE,
  camara_id UUID REFERENCES public.camaras(id),
  sector TEXT,
  productos_servicios TEXT,
  tipo_cliente TEXT,
  mercado public.mercado_enum,
  ventas_2024 NUMERIC,
  utilidades_2024 NUMERIC,
  num_colaboradores INTEGER,
  mujeres_colaboradoras INTEGER,
  
  -- Datos de adopción de IA
  decision_adoptar_ia BOOLEAN,
  areas_implementacion_ia TEXT,
  razon_no_adopcion TEXT,
  invirtio_ia_2024 BOOLEAN,
  monto_inversion_2024 NUMERIC,
  asigno_recursos_ia BOOLEAN,
  probabilidad_adopcion_12m INTEGER CHECK (probabilidad_adopcion_12m >= 1 AND probabilidad_adopcion_12m <= 5),
  probabilidad_inversion_12m INTEGER CHECK (probabilidad_inversion_12m >= 1 AND probabilidad_inversion_12m <= 5),
  monto_invertir_12m NUMERIC,
  colaboradores_capacitados_ia INTEGER,
  plan_capacitacion_ia BOOLEAN,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de solicitudes (independiente de auth)
CREATE TABLE public.solicitudes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha_solicitud TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  autorizacion_datos BOOLEAN NOT NULL DEFAULT false,
  nombres_apellidos TEXT NOT NULL,
  genero public.genero_enum,
  grupo_etnico TEXT,
  fecha_nacimiento DATE,
  tipo_identificacion public.tipo_identificacion_enum,
  numero_documento TEXT NOT NULL,
  celular TEXT,
  email TEXT NOT NULL,
  nivel_educativo TEXT,
  cargo TEXT,
  empresa_id UUID REFERENCES public.empresas(id),
  estado public.estado_solicitud_enum DEFAULT 'Pendiente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla platzi_general
CREATE TABLE public.platzi_general (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  estado_acceso TEXT,
  dias_acceso_restantes INTEGER,
  equipos TEXT,
  ruta TEXT,
  progreso_ruta NUMERIC,
  cursos_totales_progreso INTEGER,
  cursos_totales_certificados INTEGER,
  tiempo_total_dedicado INTEGER, -- en segundos
  dias_sin_progreso INTEGER,
  dias_sin_certificar INTEGER,
  fecha_inicio_ultima_licencia DATE,
  fecha_expiracion_ultima_licencia DATE,
  fecha_primera_activacion DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla platzi_seguimiento (tabla de hechos)
CREATE TABLE public.platzi_seguimiento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  id_curso TEXT,
  curso TEXT,
  porcentaje_avance NUMERIC,
  tiempo_invertido INTEGER, -- en segundos
  estado_curso public.estado_curso_enum,
  fecha_certificacion DATE,
  ruta TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insertar datos de las cámaras
INSERT INTO public.camaras (nombre, nit, licencias_disponibles) VALUES
('Cámara de Comercio de Cali', '890399001', 0), -- CCC - Licencias restantes
('Cámara de Comercio de Buenaventura', '890399034', 70),
('Cámara de Comercio de Buga', '891380018', 80),
('Cámara de Comercio de Cartago', '891900539', 80),
('Cámara de Comercio de Palmira', '891380012', 80),
('Cámara de Comercio de Sevilla', '891902186', 30),
('Cámara de Comercio de Tulúa', '891900300', 80),
('Cámara de Comercio del Cauca', '891580011', 40),
('Cámara de Comercio de Pasto', '891280005', 30),
('Cámara de Comercio de Ipiales', '891200485', 30),
('Cámara de Comercio de Tumaco', '800131382', 30),
('Cámara de Comercio del Putumayo', '891224106', 80);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.camaras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platzi_general ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platzi_seguimiento ENABLE ROW LEVEL SECURITY;

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_chamber_id UUID;
  ccc_chamber_id UUID;
BEGIN
  -- Obtener el ID de la cámara CCC
  SELECT id INTO ccc_chamber_id FROM public.camaras WHERE nit = '890399001';
  
  -- Obtener la cámara del usuario actual
  SELECT camara_id INTO user_chamber_id FROM public.profiles WHERE id = auth.uid();
  
  -- Determinar el rol
  IF user_chamber_id = ccc_chamber_id THEN
    RETURN 'admin'; -- CCC tiene permisos de admin
  ELSIF user_chamber_id IS NOT NULL THEN
    RETURN 'camara_aliada';
  ELSE
    RETURN 'user';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role() = 'admin');

-- Políticas RLS para cámaras (lectura para todos los autenticados)
CREATE POLICY "All authenticated users can view chambers" ON public.camaras
  FOR SELECT TO authenticated USING (true);

-- Políticas RLS para empresas
CREATE POLICY "Users can view companies from their chamber" ON public.empresas
  FOR SELECT USING (
    public.get_user_role() = 'admin' OR
    camara_id = (SELECT camara_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage all companies" ON public.empresas
  FOR ALL USING (public.get_user_role() = 'admin');

-- Políticas RLS para solicitudes
CREATE POLICY "Users can view requests from their chamber companies" ON public.solicitudes
  FOR SELECT USING (
    public.get_user_role() = 'admin' OR
    empresa_id IN (
      SELECT e.id FROM public.empresas e 
      JOIN public.profiles p ON e.camara_id = p.camara_id 
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all requests" ON public.solicitudes
  FOR ALL USING (public.get_user_role() = 'admin');

-- Políticas RLS para platzi_general
CREATE POLICY "Users can view platzi data from their chamber" ON public.platzi_general
  FOR SELECT USING (
    public.get_user_role() = 'admin' OR
    email IN (
      SELECT s.email FROM public.solicitudes s
      JOIN public.empresas e ON s.empresa_id = e.id
      JOIN public.profiles p ON e.camara_id = p.camara_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all platzi data" ON public.platzi_general
  FOR ALL USING (public.get_user_role() = 'admin');

-- Políticas RLS para platzi_seguimiento
CREATE POLICY "Users can view platzi tracking from their chamber" ON public.platzi_seguimiento
  FOR SELECT USING (
    public.get_user_role() = 'admin' OR
    email IN (
      SELECT s.email FROM public.solicitudes s
      JOIN public.empresas e ON s.empresa_id = e.id
      JOIN public.profiles p ON e.camara_id = p.camara_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all platzi tracking" ON public.platzi_seguimiento
  FOR ALL USING (public.get_user_role() = 'admin');

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para crear perfil automáticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para actualizar timestamps
CREATE TRIGGER update_camaras_updated_at BEFORE UPDATE ON public.camaras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_solicitudes_updated_at BEFORE UPDATE ON public.solicitudes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platzi_general_updated_at BEFORE UPDATE ON public.platzi_general
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para mejorar performance
CREATE INDEX idx_profiles_camara_id ON public.profiles(camara_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_empresas_camara_id ON public.empresas(camara_id);
CREATE INDEX idx_empresas_nit ON public.empresas(nit);
CREATE INDEX idx_solicitudes_empresa_id ON public.solicitudes(empresa_id);
CREATE INDEX idx_solicitudes_email ON public.solicitudes(email);
CREATE INDEX idx_platzi_general_email ON public.platzi_general(email);
CREATE INDEX idx_platzi_seguimiento_email ON public.platzi_seguimiento(email);