-- Decisión 0009 · Esquema inicial de la landing en Supabase Cloud.
-- Cuatro tablas. Costo, proveedor y notas internas NO existen aquí (RN-04).
-- El público (anon) solo lee lo activo; escribe únicamente el admin autenticado.

create table public.categorias (
  id                uuid primary key default gen_random_uuid(),
  nombre            text not null,
  coincide_con      text not null,           -- palabra que agrupa productos.categoria
  imagen            text,                    -- URL de Cloudinary
  orden             integer not null default 0,
  visible           boolean not null default true,
  linea_inicio      boolean not null default false,
  titulo_linea      text,
  texto_boton       text,
  creado_en         timestamptz not null default now(),
  actualizado_en    timestamptz not null default now()
);

create table public.banners (
  id                uuid primary key default gen_random_uuid(),
  titulo            text not null,           -- nombre interno
  imagen_escritorio text,                    -- 1600×500
  imagen_celular    text,                    -- 800×800, opcional
  texto_alternativo text,
  enlace            text,                    -- ruta, URL o "wa:<mensaje>"
  orden             integer not null default 0,
  activo            boolean not null default true,
  desde             date,
  hasta             date,
  creado_en         timestamptz not null default now(),
  actualizado_en    timestamptz not null default now()
);

create table public.productos (
  id                uuid primary key default gen_random_uuid(),
  codigo            text not null unique,    -- RN-09; clave de la carga CSV
  categoria         text not null default '',
  marca             text not null default '',
  modelo            text not null default '',
  procesador        text not null default '',
  generacion        text not null default '',
  ram               text not null default '',
  almacenamiento    text not null default '',
  estado            text not null default '',  -- Nuevo, Grado A, Grado B…
  descripcion       text not null default '',
  precio            numeric(12,0) not null default 0 check (precio >= 0),
  stock             integer not null default 0 check (stock >= 0),  -- 0 = agotado, sigue visible (RN-02)
  fotos             text[] not null default '{}',  -- la primera es la portada
  video             text not null default '',
  activo            boolean not null default true,  -- false = oculto de la tienda (RN-03)
  destacado         boolean not null default false,
  creado_en         timestamptz not null default now(),
  actualizado_en    timestamptz not null default now()
);

create table public.configuracion (
  clave             text primary key,
  valor             jsonb not null,
  actualizado_en    timestamptz not null default now()
);

create index productos_categoria_idx on public.productos (categoria) where activo;
create index banners_orden_idx on public.banners (orden) where activo;
create index categorias_orden_idx on public.categorias (orden) where visible;

create function public.tocar_actualizado_en() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.actualizado_en := now();
  return new;
end $$;

create trigger categorias_touch    before update on public.categorias    for each row execute function public.tocar_actualizado_en();
create trigger banners_touch       before update on public.banners       for each row execute function public.tocar_actualizado_en();
create trigger productos_touch     before update on public.productos     for each row execute function public.tocar_actualizado_en();
create trigger configuracion_touch before update on public.configuracion for each row execute function public.tocar_actualizado_en();

-- RLS: público lee solo lo publicable; admin autenticado lee y escribe todo.
alter table public.categorias    enable row level security;
alter table public.banners       enable row level security;
alter table public.productos     enable row level security;
alter table public.configuracion enable row level security;

create policy categorias_publico on public.categorias for select to anon using (visible);
create policy banners_publico    on public.banners    for select to anon
  using (activo and (desde is null or desde <= current_date) and (hasta is null or hasta >= current_date));
create policy productos_publico  on public.productos  for select to anon using (activo);
create policy configuracion_publico on public.configuracion for select to anon using (true);

create policy categorias_admin    on public.categorias    for all to authenticated using (true) with check (true);
create policy banners_admin       on public.banners       for all to authenticated using (true) with check (true);
create policy productos_admin     on public.productos     for all to authenticated using (true) with check (true);
create policy configuracion_admin on public.configuracion for all to authenticated using (true) with check (true);
