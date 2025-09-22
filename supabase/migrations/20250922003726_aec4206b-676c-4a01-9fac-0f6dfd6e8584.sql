-- Actualizar enum de género
-- Primero crear el nuevo enum
CREATE TYPE genero_enum_new AS ENUM ('Hombre', 'Mujer', 'No Binario');

-- Actualizar la tabla para usar el nuevo enum
ALTER TABLE public.solicitudes 
ALTER COLUMN genero TYPE genero_enum_new 
USING genero::text::genero_enum_new;

-- Eliminar el enum anterior y renombrar el nuevo
DROP TYPE IF EXISTS genero_enum;
ALTER TYPE genero_enum_new RENAME TO genero_enum;

-- Crear enum para grupo étnico
CREATE TYPE grupo_etnico_enum AS ENUM (
  'Indígena',
  'Gitano(a) o Rrom',
  'Raizal de Archipiélago de San Andrés, providencia y Santa Catalina',
  'Palenquero(a) de San Basilio',
  'Negro(a), mulato(a), afrodescendiente, afrocolombiano(a).',
  'Ningún grupo étnico'
);

-- Actualizar la columna grupo_etnico para usar el enum
ALTER TABLE public.solicitudes 
ALTER COLUMN grupo_etnico TYPE grupo_etnico_enum 
USING CASE 
  WHEN grupo_etnico IS NULL THEN NULL
  ELSE grupo_etnico::grupo_etnico_enum
END;