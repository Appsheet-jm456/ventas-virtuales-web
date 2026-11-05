-- HU-11 · Métricas de la Bandeja de entrada: visitas a páginas y clics en WhatsApp.
-- Sin datos personales (Ley 1581): no se guarda IP, cookie, navegador ni nada que identifique a
-- quien visita. Solo qué pasó, en qué página y cuándo.

create table public.eventos (
  id         bigint generated always as identity primary key,
  tipo       text not null check (tipo in ('visita', 'whatsapp')),
  ruta       text not null default '' check (char_length(ruta) <= 300),
  producto   text not null default '' check (char_length(producto) <= 100),  -- código del producto en clics de «Estoy interesado»
  creado_en  timestamptz not null default now()
);

create index eventos_creado_idx on public.eventos (creado_en);
create index eventos_producto_idx on public.eventos (producto, creado_en) where tipo = 'whatsapp' and producto <> '';

-- RLS: el público solo registra eventos (con la hora del servidor); no los lee ni los cambia.
-- El administrador autenticado los lee.
alter table public.eventos enable row level security;

create policy eventos_registrar on public.eventos for insert to anon
  with check (creado_en between now() - interval '1 minute' and now() + interval '1 minute');
create policy eventos_admin on public.eventos for select to authenticated using (true);

-- Resúmenes para la Bandeja. security invoker: respetan la RLS, así que solo el administrador
-- obtiene datos. Los días se cuentan en la hora de Colombia.
create function public.metricas_por_dia(desde timestamptz, hasta timestamptz)
returns table (dia date, visitas bigint, whatsapp bigint)
language sql stable security invoker set search_path = '' as $$
  select (e.creado_en at time zone 'America/Bogota')::date as dia,
         count(*) filter (where e.tipo = 'visita') as visitas,
         count(*) filter (where e.tipo = 'whatsapp') as whatsapp
  from public.eventos e
  where e.creado_en >= desde and e.creado_en < hasta
  group by 1
  order by 1;
$$;

create function public.productos_mas_consultados(desde timestamptz, hasta timestamptz, limite integer default 5)
returns table (producto text, clics bigint)
language sql stable security invoker set search_path = '' as $$
  select e.producto, count(*) as clics
  from public.eventos e
  where e.tipo = 'whatsapp' and e.producto <> '' and e.creado_en >= desde and e.creado_en < hasta
  group by e.producto
  order by clics desc, e.producto
  limit least(greatest(limite, 1), 20);
$$;

revoke execute on function public.metricas_por_dia(timestamptz, timestamptz) from public, anon;
revoke execute on function public.productos_mas_consultados(timestamptz, timestamptz, integer) from public, anon;
grant execute on function public.metricas_por_dia(timestamptz, timestamptz) to authenticated;
grant execute on function public.productos_mas_consultados(timestamptz, timestamptz, integer) to authenticated;
