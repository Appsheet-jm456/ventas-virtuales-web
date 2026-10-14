-- Datos iniciales: categorías y banners de docs/baserow/*.csv y datos de la empresa de lib/site.js.
-- Los productos reales entran por la carga CSV de /admin (exportado de Baserow).

insert into public.categorias (nombre, coincide_con, orden, visible, linea_inicio, titulo_linea, texto_boton) values
  ('Portátiles',  'portatil',  1, true, true,  'Portátiles corporativos', 'Más portátiles'),
  ('Torres tiny', 'torre',     2, true, false, null, null),
  ('Partes',      'parte',     3, true, false, null, null),
  ('Accesorios',  'accesorio', 4, true, false, null, null);

insert into public.banners (titulo, texto_alternativo, enlace, orden, activo) values
  ('Portátiles corporativos', 'Portátiles corporativos con garantía', '/productos?categoria=portatil', 1, true),
  ('Envíos a todo el país',   'Envíos a todo el país — escríbenos por WhatsApp', 'wa:Hola 👋, quiero información sobre envíos a mi ciudad.', 2, true);

insert into public.configuracion (clave, valor) values
  ('empresa', jsonb_build_object(
    'nombre', 'Ventas Virtual Colombia',
    'lema', 'Distribuidores de computadores corporativos nuevos y usados',
    'direccion', 'Av. Estación #23dn-68 local 2-107, San Vicente, Cali, Valle del Cauca (CC Pasarela, local 2-107, segundo piso)',
    'ciudad', 'Cali, Colombia',
    'whatsapp', '573175591252',
    'whatsapp_visible', '317 559 1252',
    'instagram', 'https://www.instagram.com/ventasvirtualcol/',
    'facebook', 'https://www.facebook.com/p/Ventas-Virtual-Colombia-100092489010584/',
    'tiktok', 'https://www.tiktok.com/@ventasvirtualcol',
    'horario', ''
  ));
