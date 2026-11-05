-- HU-34 · Usuarios, roles y permisos del panel (decisión 0012).
-- El Superadmin crea roles y define qué puede cada uno, por módulo. Cada persona del panel tiene un
-- perfil con un rol. Las tablas del panel dejan de aceptar «cualquier autenticado».
-- Escribir en estas tres tablas solo se hace desde el servidor con la clave secreta: sin políticas
-- de escritura, nadie puede subirse el rol desde el navegador.

create table public.roles (
  id             uuid primary key default gen_random_uuid(),
  nombre         text not null unique check (char_length(nombre) between 1 and 40),
  descripcion    text not null default '' check (char_length(descripcion) <= 200),
  es_super       boolean not null default false,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create unique index roles_un_super on public.roles (es_super) where es_super;

create table public.rol_permisos (
  rol_id uuid not null references public.roles (id) on delete cascade,
  modulo text not null check (modulo in ('bandeja', 'productos', 'banners', 'categorias', 'politicas', 'configuracion', 'usuarios')),
  nivel  text not null check (nivel in ('ver', 'editar')),
  primary key (rol_id, modulo)
);

create table public.perfiles (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  nombre         text not null check (char_length(nombre) between 1 and 80),
  rol_id         uuid not null references public.roles (id) on delete restrict,
  activo         boolean not null default true,
  historial      jsonb not null default '[]',
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create index perfiles_rol_idx on public.perfiles (rol_id);

-- Roles iniciales. El Superadmin los puede cambiar desde el panel, salvo el suyo.
insert into public.roles (nombre, descripcion, es_super) values
  ('Superadmin', 'Acceso total. Único que crea roles y define permisos.', true),
  ('Dueño', 'Todo el panel y los usuarios; no cambia los permisos de los roles.', false),
  ('Encargado', 'Actualiza productos, banners y categorías.', false),
  ('Vendedor', 'Consulta productos y la bandeja.', false),
  ('Consulta', 'Solo consulta productos.', false);

insert into public.rol_permisos (rol_id, modulo, nivel)
select r.id, p.modulo, p.nivel
from public.roles r
join (values
  ('Dueño', 'bandeja', 'ver'), ('Dueño', 'productos', 'editar'), ('Dueño', 'banners', 'editar'),
  ('Dueño', 'categorias', 'editar'), ('Dueño', 'politicas', 'editar'), ('Dueño', 'configuracion', 'editar'),
  ('Dueño', 'usuarios', 'editar'),
  ('Encargado', 'productos', 'editar'), ('Encargado', 'banners', 'editar'), ('Encargado', 'categorias', 'editar'),
  ('Vendedor', 'bandeja', 'ver'), ('Vendedor', 'productos', 'ver'),
  ('Consulta', 'productos', 'ver')
) as p (rol, modulo, nivel) on p.rol = r.nombre;

-- Quien ya usa el panel sigue entrando: la cuenta de desarrollo queda como Superadmin.
insert into public.perfiles (user_id, nombre, rol_id)
select u.id, 'Superadmin', (select id from public.roles where es_super)
from auth.users u
where u.email = 'appsheetjm@gmail.com';

-- Nunca quedarse sin un Superadmin activo.
create function public.proteger_ultimo_superadmin()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  era_super boolean;
  quedan integer;
begin
  select r.es_super into era_super from public.roles r where r.id = old.rol_id;
  if not coalesce(era_super, false) or not old.activo then
    return coalesce(new, old);
  end if;
  if tg_op = 'UPDATE' and new.activo and new.rol_id = old.rol_id then
    return new;
  end if;
  select count(*) into quedan
  from public.perfiles p join public.roles r on r.id = p.rol_id
  where r.es_super and p.activo and p.user_id <> old.user_id;
  if quedan = 0 then
    raise exception 'ULTIMO_SUPERADMIN';
  end if;
  return coalesce(new, old);
end;
$$;
create trigger perfiles_ultimo_superadmin before update or delete on public.perfiles
  for each row execute function public.proteger_ultimo_superadmin();

-- ¿El usuario de la sesión está activo? ¿Tiene este permiso? `editar` incluye `ver`.
create function public.panel_activo()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.perfiles p where p.user_id = auth.uid() and p.activo);
$$;

create function public.panel_puede(p_modulo text, p_nivel text default 'ver')
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.perfiles p
    join public.roles r on r.id = p.rol_id
    left join public.rol_permisos rp on rp.rol_id = r.id and rp.modulo = p_modulo
    where p.user_id = auth.uid() and p.activo
      and (r.es_super or rp.nivel = 'editar' or (p_nivel = 'ver' and rp.nivel = 'ver'))
  );
$$;

revoke execute on function public.panel_activo() from public, anon;
revoke execute on function public.panel_puede(text, text) from public, anon;
revoke execute on function public.proteger_ultimo_superadmin() from public, anon, authenticated;
grant execute on function public.panel_activo() to authenticated;
grant execute on function public.panel_puede(text, text) to authenticated;

alter table public.roles        enable row level security;
alter table public.rol_permisos enable row level security;
alter table public.perfiles     enable row level security;

create policy roles_leer        on public.roles        for select to authenticated using ((select public.panel_activo()));
create policy rol_permisos_leer on public.rol_permisos for select to authenticated using ((select public.panel_activo()));
create policy perfiles_leer     on public.perfiles     for select to authenticated
  using (user_id = (select auth.uid()) or (select public.panel_puede('usuarios', 'ver')));

-- Las seis tablas del panel: las reglas públicas (rol anon) no cambian.
drop policy categorias_admin    on public.categorias;
drop policy banners_admin       on public.banners;
drop policy productos_admin     on public.productos;
drop policy configuracion_admin on public.configuracion;
drop policy paginas_admin       on public.paginas;
drop policy eventos_admin       on public.eventos;

create policy productos_leer     on public.productos for select to authenticated using ((select public.panel_puede('productos', 'ver')));
create policy productos_crear    on public.productos for insert to authenticated with check ((select public.panel_puede('productos', 'editar')));
create policy productos_cambiar  on public.productos for update to authenticated using ((select public.panel_puede('productos', 'editar'))) with check ((select public.panel_puede('productos', 'editar')));
create policy productos_borrar   on public.productos for delete to authenticated using ((select public.panel_puede('productos', 'editar')));

create policy banners_leer       on public.banners for select to authenticated using ((select public.panel_activo()));
create policy banners_crear      on public.banners for insert to authenticated with check ((select public.panel_puede('banners', 'editar')));
create policy banners_cambiar    on public.banners for update to authenticated using ((select public.panel_puede('banners', 'editar'))) with check ((select public.panel_puede('banners', 'editar')));
create policy banners_borrar     on public.banners for delete to authenticated using ((select public.panel_puede('banners', 'editar')));

create policy categorias_leer    on public.categorias for select to authenticated using ((select public.panel_activo()));
create policy categorias_crear   on public.categorias for insert to authenticated with check ((select public.panel_puede('categorias', 'editar')));
create policy categorias_cambiar on public.categorias for update to authenticated using ((select public.panel_puede('categorias', 'editar'))) with check ((select public.panel_puede('categorias', 'editar')));
create policy categorias_borrar  on public.categorias for delete to authenticated using ((select public.panel_puede('categorias', 'editar')));

create policy paginas_leer       on public.paginas for select to authenticated using ((select public.panel_puede('politicas', 'ver')));
create policy paginas_crear      on public.paginas for insert to authenticated with check ((select public.panel_puede('politicas', 'editar')));
create policy paginas_cambiar    on public.paginas for update to authenticated using ((select public.panel_puede('politicas', 'editar'))) with check ((select public.panel_puede('politicas', 'editar')));
create policy paginas_borrar     on public.paginas for delete to authenticated using ((select public.panel_puede('politicas', 'editar')));

-- «Nosotros» se guarda en configuracion pero se administra con el permiso de Políticas y Nosotros.
create policy configuracion_leer    on public.configuracion for select to authenticated using ((select public.panel_activo()));
create policy configuracion_crear   on public.configuracion for insert to authenticated
  with check (case when clave = 'nosotros' then (select public.panel_puede('politicas', 'editar')) else (select public.panel_puede('configuracion', 'editar')) end);
create policy configuracion_cambiar on public.configuracion for update to authenticated
  using (case when clave = 'nosotros' then (select public.panel_puede('politicas', 'editar')) else (select public.panel_puede('configuracion', 'editar')) end)
  with check (case when clave = 'nosotros' then (select public.panel_puede('politicas', 'editar')) else (select public.panel_puede('configuracion', 'editar')) end);
create policy configuracion_borrar  on public.configuracion for delete to authenticated
  using (case when clave = 'nosotros' then (select public.panel_puede('politicas', 'editar')) else (select public.panel_puede('configuracion', 'editar')) end);

create policy eventos_leer on public.eventos for select to authenticated using ((select public.panel_puede('bandeja', 'ver')));
