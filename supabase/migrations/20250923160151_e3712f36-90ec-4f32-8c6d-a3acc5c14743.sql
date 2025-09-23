-- Add new fields to insights table for enhanced post functionality
ALTER TABLE public.insights 
ADD COLUMN icono text,
ADD COLUMN color text DEFAULT '#8B5CF6',
ADD COLUMN camaras_especificas uuid[];

-- Update RLS policies to handle the new permissions structure
-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage all insights" ON public.insights;
DROP POLICY IF EXISTS "Users can view insights based on audience" ON public.insights;

-- Create new policies with proper permissions
-- Admin: full CRUD access
CREATE POLICY "Admins can manage all insights" 
ON public.insights 
FOR ALL 
USING (get_user_role() = 'admin');

-- CCC: read-only access to everything
CREATE POLICY "CCC can view all insights" 
ON public.insights 
FOR SELECT 
USING (get_user_role() = 'ccc' AND activo = true);

-- Allied chambers: can view general content and content specifically for their chamber
CREATE POLICY "Allied chambers can view relevant insights" 
ON public.insights 
FOR SELECT 
USING (
  get_user_role() = 'camara_aliada' 
  AND activo = true 
  AND (
    audiencia = 'todos' 
    OR (
      audiencia = 'camara_aliada' 
      AND (
        camaras_especificas IS NULL 
        OR (SELECT profiles.camara_id FROM profiles WHERE profiles.id = auth.uid()) = ANY(camaras_especificas)
      )
    )
  )
);