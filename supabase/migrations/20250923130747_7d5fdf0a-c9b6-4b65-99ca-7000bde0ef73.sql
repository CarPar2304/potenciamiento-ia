-- Primero eliminar el enum existente si existe y recrearlo con los nuevos valores
DROP TYPE IF EXISTS grupo_etnico_enum CASCADE;

-- Crear el nuevo enum con las opciones solicitadas
CREATE TYPE grupo_etnico_enum AS ENUM (
  'Indígena',
  'Gitano(a) o Rrom',
  'Raizal de Archipiélago de San Andrés, providencia y Santa Catalina',
  'Palenquero(a) de San Basilio',
  'Negro(a), mulato(a), afrodescendiente, afrocolombiano(a).',
  'Ningún grupo étnico'
);

-- Actualizar la columna en la tabla solicitudes para usar el nuevo enum
ALTER TABLE public.solicitudes 
ALTER COLUMN grupo_etnico TYPE grupo_etnico_enum 
USING grupo_etnico::text::grupo_etnico_enum;