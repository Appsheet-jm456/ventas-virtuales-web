-- Reversa de HU-34: vuelve a «cualquier autenticado» y borra perfiles, roles y permisos.
-- No toca auth.users. Las personas agregadas después conservarán su cuenta y volverán a tener acceso
-- total: desactívalas antes de revertir.
drop policy if exists productos_leer on public.productos;
drop policy if exists productos_crear on public.productos;
drop policy if exists productos_cambiar on public.productos;
drop policy if exists productos_borrar on public.productos;
drop policy if exists banners_leer on public.banners;
drop policy if exists banners_crear on public.banners;
drop policy if exists banners_cambiar on public.banners;
drop policy if exists banners_borrar on public.banners;
drop policy if exists categorias_leer on public.categorias;
drop policy if exists categorias_crear on public.categorias;
drop policy if exists categorias_cambiar on public.categorias;
drop policy if exists categorias_borrar on public.categorias;
drop policy if exists paginas_leer on public.paginas;
drop policy if exists paginas_crear on public.paginas;
drop policy if exists paginas_cambiar on public.paginas;
drop policy if exists paginas_borrar on public.paginas;
drop policy if exists configuracion_leer on public.configuracion;
drop policy if exists configuracion_crear on public.configuracion;
drop policy if exists configuracion_cambiar on public.configuracion;
drop policy if exists configuracion_borrar on public.configuracion;
drop policy if exists eventos_leer on public.eventos;

create policy categorias_admin    on public.categorias    for all to authenticated using (true) with check (true);
create policy banners_admin       on public.banners       for all to authenticated using (true) with check (true);
create policy productos_admin     on public.productos     for all to authenticated using (true) with check (true);
create policy configuracion_admin on public.configuracion for all to authenticated using (true) with check (true);
create policy paginas_admin       on public.paginas       for all to authenticated using (true) with check (true);
create policy eventos_admin       on public.eventos       for select to authenticated using (true);

drop trigger if exists perfiles_ultimo_superadmin on public.perfiles;
drop table if exists public.perfiles;
drop table if exists public.rol_permisos;
drop table if exists public.roles;
drop function if exists public.panel_puede(text, text);
drop function if exists public.panel_activo();
drop function if exists public.proteger_ultimo_superadmin();
