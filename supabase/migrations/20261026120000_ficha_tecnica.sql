-- HU-27 · Ficha técnica completa del producto: lista ordenada de pares {campo, valor} que el dueño
-- carga en /admin/productos. Vacía por defecto (el bloque no se muestra en la web).
-- Los límites también se validan en lib/ficha.js con mensajes en español; aquí son la red de
-- seguridad: siempre una lista JSON y como mucho 40 filas.

alter table public.productos
  add column ficha jsonb not null default '[]'::jsonb
  check (jsonb_typeof(ficha) = 'array' and jsonb_array_length(ficha) <= 40);

comment on column public.productos.ficha is
  'Ficha técnica (HU-27): [{"campo": "Pantalla", "valor": "14\" Full HD"}, …] en el orden en que se muestra.';
