-- HU-29 · Descripción ampliada del producto: resumen destacado, título y texto largo de la
-- descripción. Texto seguro (párrafos, **negrita**, listas «- » y subtítulos «## »), sin HTML.
-- Vacíos por defecto: sin ellos los bloques no se muestran. Límites también en lib/inventory.js.

alter table public.productos
  add column resumen        text not null default '' check (char_length(resumen) <= 400),
  add column detalle_titulo text not null default '' check (char_length(detalle_titulo) <= 120),
  add column detalle        text not null default '' check (char_length(detalle) <= 5000);

comment on column public.productos.resumen is 'Resumen destacado bajo el nombre en la ficha pública (HU-29).';
comment on column public.productos.detalle_titulo is 'Título del bloque Descripción (HU-29).';
comment on column public.productos.detalle is 'Descripción larga en texto seguro: párrafos, **negrita**, «- » listas, «## » subtítulos (HU-29).';
