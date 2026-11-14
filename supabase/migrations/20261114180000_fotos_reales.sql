-- HU-36 · Botón «📷 Más fotos»: enlace a la carpeta de Drive con las fotos reales del equipo.
-- Vacío = sin botón. Se pone, cambia o quita en /admin/productos y en el CSV. Solo se aceptan
-- enlaces https de Google Drive / Google Fotos (la validación está en lib/inventory.js).

alter table public.productos
  add column fotos_reales_url text not null default ''
  check (char_length(fotos_reales_url) <= 300);

comment on column public.productos.fotos_reales_url is 'Enlace de Drive con fotos reales del equipo (HU-36). Vacío = sin botón «Más fotos».';
