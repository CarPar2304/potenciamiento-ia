-- Tabla para el historial de cargas masivas
CREATE TABLE public.cargas_masivas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('solicitudes', 'empresas')),
  nombre_archivo TEXT NOT NULL,
  registros_totales INTEGER NOT NULL DEFAULT 0,
  registros_insertados INTEGER NOT NULL DEFAULT 0,
  registros_duplicados INTEGER NOT NULL DEFAULT 0,
  usuario_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agregar columna para rastrear el lote en solicitudes
ALTER TABLE public.solicitudes 
ADD COLUMN IF NOT EXISTS carga_masiva_id UUID REFERENCES public.cargas_masivas(id) ON DELETE SET NULL;

-- Agregar columna para rastrear el lote en empresas
ALTER TABLE public.empresas 
ADD COLUMN IF NOT EXISTS carga_masiva_id UUID REFERENCES public.cargas_masivas(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.cargas_masivas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cargas_masivas
CREATE POLICY "Admins can manage all bulk uploads"
ON public.cargas_masivas
FOR ALL
USING (get_user_role() = 'admin');

CREATE POLICY "Admins and CCC can view all bulk uploads"
ON public.cargas_masivas
FOR SELECT
USING (get_user_role() = ANY (ARRAY['admin', 'ccc']));

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_solicitudes_carga_masiva ON public.solicitudes(carga_masiva_id);
CREATE INDEX IF NOT EXISTS idx_empresas_carga_masiva ON public.empresas(carga_masiva_id);