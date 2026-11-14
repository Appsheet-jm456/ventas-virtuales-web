-- HU-39 · Ofertas y descuentos: «Precio antes» del producto. Si es mayor que el precio, la web
-- muestra la etiqueta «−X %», el precio anterior tachado y el producto entra en «Ofertas del mes».
-- Vacío (null) = sin oferta. Se edita en /admin/productos y en el CSV.

alter table public.productos
  add column precio_antes numeric(12,0) check (precio_antes is null or precio_antes >= 0);

comment on column public.productos.precio_antes is 'Precio anterior para mostrar el descuento (HU-39). Null = sin oferta.';
