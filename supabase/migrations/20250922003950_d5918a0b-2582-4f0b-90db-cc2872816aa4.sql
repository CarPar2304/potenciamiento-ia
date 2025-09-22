-- Actualizar enum de tipo de identificación
-- Crear el nuevo enum con las opciones específicas
CREATE TYPE tipo_identificacion_enum_new AS ENUM (
  'Cédula de Ciudadanía',
  'Cédula de Extranjería',
  'Pasaporte'
);

-- Actualizar la tabla para usar el nuevo enum
ALTER TABLE public.solicitudes 
ALTER COLUMN tipo_identificacion TYPE tipo_identificacion_enum_new 
USING CASE 
  WHEN tipo_identificacion IS NULL THEN NULL
  ELSE tipo_identificacion::text::tipo_identificacion_enum_new
END;

-- Eliminar el enum anterior y renombrar el nuevo
DROP TYPE IF EXISTS tipo_identificacion_enum;
ALTER TYPE tipo_identificacion_enum_new RENAME TO tipo_identificacion_enum;