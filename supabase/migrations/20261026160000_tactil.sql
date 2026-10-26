-- HU-28 · Filtro dinámico para el cliente: «Táctil» como característica del producto, para
-- filtrar por pantalla táctil. Por defecto «No». Se edita en /admin/productos y en el CSV.

alter table public.productos
  add column tactil boolean not null default false;

comment on column public.productos.tactil is 'Pantalla táctil (HU-28): filtro «Táctil» de la web.';
