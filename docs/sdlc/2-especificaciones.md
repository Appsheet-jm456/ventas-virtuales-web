# Fase 2 · Especificaciones

**Estado:** 🟡 En curso (Camino 1 · landing) · **Abierta:** 13 oct 2026

> Define **qué tiene que pasar** en cada funcionalidad, de forma que se pueda probar. Nada se
> programa sin su historia y sus criterios de aceptación.

## Criterio de cierre

- [x] Estructura de la web para clientes definida: Inicio, Categorías, Productos (13 oct 2026)
- [ ] Historias validadas por el dueño
- [ ] Imágenes reunidas: 2 banners y una imagen por categoría
- [ ] Cada criterio enlazado a la prueba que lo comprueba (Fase 4)

---

## Referencia de diseño

Estilo de tienda tecnológica: encabezado con buscador al centro, banner que rota, categorías con
imagen y filas de productos por línea. Referencia de **estructura** (no de contenido ni marca):
sitecsas.com. Colores, logo, textos e imágenes son de Ventas Virtual.

## Páginas para clientes

| Página | Ruta | Qué muestra |
|---|---|---|
| **Inicio** | `/` | Encabezado · banner rotativo · categorías · línea Portátiles corporativos · franja de confianza · pie |
| **Categorías** | `/categorias` | Todas las categorías con su imagen; cada una abre Productos filtrado |
| **Productos** | `/productos` | Catálogo completo con buscador y filtros (categoría, marca, precio, disponibles) |
| Producto | `/producto/<código>` | Ya existe: fotos, video, especificaciones, botón WhatsApp |

## Estructura del Inicio

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [LOGO]   [ 🔍 Buscar productos…            ]   (🟢) WhatsApp   (🚚) Envíos  │  HU-01
│                                                    317 559 1252   a todo el país│
│   Inicio · Categorías · Productos · Contacto                              │
├──────────────────────────────────────────────────────────────────────────┤
│  ◀            BANNER 1  ⇄  BANNER 2   (rota solo cada 5 s)            ▶  │  HU-02
│                              ● ○                                         │
├──────────────────────────────────────────────────────────────────────────┤
│  Categorías                                              ◀ ▶             │  HU-03
│  [img Portátiles] [img Torres tiny] [img Partes] [img Accesorios] …      │
├──────────────────────────────────────────────────────────────────────────┤
│  Portátiles corporativos                          [ Más portátiles › ]  │  HU-04
│  [BANNER  ] [producto] [producto] [producto] [producto]  ◀ ▶  (una fila) │
├──────────────────────────────────────────────────────────────────────────┤
│  🛡️ Garantía · 🚚 Envíos nacionales · 📍 Tienda física · 💬 Asesoría       │
├──────────────────────────────────────────────────────────────────────────┤
│  MARCA            CONTACTO             ATENCIÓN            REDES         │  HU-05
│  Logo + lema      Dirección, WhatsApp  Horario             IG · FB · TikTok│
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Historias

### HU-01 · Encabezado con buscador y WhatsApp
Como cliente quiero buscar un producto y ver el WhatsApp desde cualquier página para encontrar
rápido lo que necesito o escribir a un asesor.

- Dado cualquier página, cuando la abro, entonces veo de izquierda a derecha: **logo**,
  **buscador**, **ícono de WhatsApp con el número** y **Envíos a todo el país**.
- Dado el buscador, cuando escribo "thinkpad" y presiono Enter, entonces voy a `/productos`
  con los resultados de esa búsqueda.
- Dado el número de WhatsApp, cuando hago clic, entonces se abre el chat de ventas.
- Dado un celular, cuando abro la web, entonces el logo y el WhatsApp quedan arriba y el
  buscador ocupa todo el ancho debajo.

### HU-02 · Banner rotativo
Como dueño quiero un banner con dos imágenes que se muevan solas para destacar promociones.

- Dado el Inicio, cuando lo abro, entonces el banner muestra la imagen 1 y a los 5 segundos
  pasa sola a la imagen 2, y vuelve a empezar.
- Dado el banner, cuando uso las flechas o los puntos, entonces cambio de imagen a mano.
- Dado un banner con enlace, cuando hago clic, entonces voy a ese producto, categoría o WhatsApp.
- Dado un celular, cuando lo abro, entonces se ve la versión móvil de la imagen si existe.
- Las imágenes y sus enlaces se cambian en un solo lugar (`lib/site.js`) sin tocar el diseño.

### HU-03 · Categorías con imagen
Como cliente quiero ver las categorías con una imagen para entrar directo a lo que busco.

- Dado el Inicio, cuando bajo del banner, entonces veo una fila de categorías con imagen y
  nombre que se desplaza con flechas o deslizando.
- Dada una categoría, cuando hago clic, entonces voy a `/productos` filtrado por ella.
- Las categorías salen de la columna `Categoría` de Baserow; una categoría sin imagen muestra
  un ícono en su lugar.
- `/categorias` muestra todas en cuadrícula.

### HU-04 · Línea Portátiles corporativos
Como cliente quiero ver algunos portátiles disponibles en el Inicio sin tener que buscar.

- Dado el Inicio, entonces veo **una sola fila** de portátiles **disponibles** (Stock mayor a 0),
  hasta 12, que se desplaza con flechas o deslizando. **No** es un catálogo: el catálogo con
  filtros vive en Productos (HU-06).
- A la izquierda de la fila hay un banner de la línea ("Portátiles corporativos") con el precio
  **desde** el más barato disponible.
- Arriba a la derecha está el botón **Más portátiles ›**, que lleva a `/productos` filtrado por
  portátiles.
- Si no hay portátiles disponibles, la sección no aparece.
- En el celular el banner queda arriba, en franja, y la fila se desliza con el dedo.

### HU-05 · Pie de página de marca
Como cliente quiero saber quién vende, cómo contactar y dónde seguirlos.

- Dado cualquier página, entonces el pie muestra cuatro bloques: **Marca** (logo y lema),
  **Contacto** (dirección y WhatsApp), **Atención** (horario) y **Redes** (Instagram, Facebook,
  TikTok).

### HU-06 · Página Productos
Como cliente quiero ver todo el catálogo con filtros.

- Dado `/productos`, entonces veo el catálogo con buscador y filtros de categoría, marca,
  precio y solo disponibles (los que existen hoy en el Inicio).
- Dado un enlace con `?q=` o `?categoria=`, cuando abro la página, entonces los filtros ya
  vienen aplicados.

---

## Administración con Supabase (decisión 0009)

Alcance de este bloque: acceso, productos y carga CSV. Categorías, banners y configuración en
`/admin` (panel lateral) son un bloque aparte.

### HU-07 · Acceso al panel con correo y contraseña
Como dueño quiero entrar a `/admin` con mi correo y contraseña para que nadie más cambie el catálogo.

- Dado `/admin` sin sesión, entonces veo solo el formulario de correo y contraseña.
- Dado un correo y contraseña válidos, cuando entro, entonces veo el panel y la sesión sigue
  abierta al recargar hasta que presione **Salir**.
- Dado un correo o contraseña incorrectos, entonces veo "Correo o contraseña incorrectos" y no entro.
- Dado que alguien llama a la API de administración sin sesión válida, entonces recibe 401 y
  nada cambia.
- El registro público de Supabase Auth está desactivado: solo existe el usuario que crea el
  dueño. Las claves secretas nunca llegan al navegador.

### HU-08 · Catálogo leído de Supabase
Como cliente quiero ver el mismo catálogo de siempre, ahora desde la base de la web.

- Dado el catálogo público, entonces muestra solo productos **activos** con las columnas de
  venta (RN-04); costo, proveedor y notas no existen en la base.
- Dado un producto con stock 0, entonces sigue visible como "Agotado" (RN-02).
- Dado un producto desactivado (**Quitar de la tienda**), entonces no aparece al público pero el
  panel lo muestra para republicarlo (RN-03).
- Dado que Supabase no está configurado, entonces la web funciona en modo demo con el inventario
  de ejemplo.
- Dado el panel, el dueño puede crear, editar, agotar/disponible, quitar/publicar y eliminar
  productos uno a uno; los cambios se ven en la tienda al recargar.

### HU-09 · Carga de productos por CSV
Como dueño quiero subir un CSV cuando hay inventario nuevo para no digitar producto por producto.

- Dado un CSV con las columnas de Baserow (`Código, Categoría, Descripción, Marca, Modelo,
  Procesador, Generación, RAM, Almacenamiento, Estado, Precio, Stock, Foto, Video, Oculto`),
  cuando lo selecciono, entonces veo una **vista previa** con cuántos productos son nuevos,
  cuántos se modifican y cuáles tienen errores (con la fila y el motivo). Nada se guarda aún.
- Dada la vista previa sin errores bloqueantes, cuando confirmo, entonces los nuevos se crean y
  los existentes (mismo `Código`) se actualizan.
- Dados productos que no vienen en el archivo, entonces **no se tocan ni se borran**.
- Dada una fila sin `Código`, o con `Precio`/`Stock` que no son números, entonces se marca como
  error y se omite; las demás filas se cargan.
- Dado un `Código` repetido dentro del mismo archivo, entonces se marca error en la repetida.
- Columnas que no son de venta (costo, proveedor, notas) se ignoran aunque vengan en el archivo.
- `Foto` acepta varias URL separadas por coma o salto de línea (la primera es la portada);
  `Oculto` con "Sí" deja el producto desactivado.
- Solo una sesión de administrador puede cargar.

---

## Rediseño de /admin: panel lateral y cinco módulos

Maqueta aprobada para revisión: [docs/diseno/admin-maqueta.html](../diseno/admin-maqueta.html)
(abrir en el navegador). Alcance: reemplazar la página única de `/admin` por un shell con panel
lateral izquierdo y cinco módulos. Se reutiliza el acceso (HU-07) y la carga CSV (HU-09).
Orden de construcción: HU-10, HU-12, HU-14, HU-15, HU-13 y al final HU-11.

### HU-10 · Panel lateral plegable
Como dueño quiero un menú a la izquierda que se abra y se pliegue a iconos para moverme entre módulos sin perder espacio.

- Dado `/admin` con sesión, entonces veo el panel lateral con cinco módulos, cada uno con icono y
  nombre: Bandeja de entrada, Productos, Banners e imágenes, Categorías y Configuración.
- Dado el botón de menú, cuando lo presiono, entonces el panel alterna entre abierto (icono y
  nombre) y plegado (solo iconos); con el panel plegado, al pasar sobre un icono veo su nombre.
- Dado que recargo la página, entonces el panel conserva su estado y el módulo activo se
  resalta; cada módulo tiene su propia dirección (`/admin/productos`, etc.).
- Dado un celular, entonces el panel arranca plegado, queda fijo como riel de iconos y al abrirlo
  se superpone al contenido, con un fondo que lo cierra al tocarlo.
- Dado el encabezado, entonces muestra el nombre del módulo, el cambio de tema claro/oscuro y un
  enlace **Ver la web**. **Cerrar sesión** está al pie del panel.
- Todo módulo se puede usar con teclado y los iconos tienen nombre accesible.

### HU-11 · Bandeja de entrada con métricas
Como dueño quiero ver cómo va la web al entrar al panel para saber qué atender hoy.

- Dado el módulo, entonces veo cuatro indicadores (visitas, clics en WhatsApp, productos
  publicados y agotados) con su variación frente al periodo anterior; el periodo se elige entre
  14 días, 30 días y el mes.
- Dado el periodo, entonces veo una gráfica de visitas por día y clics en WhatsApp, y el ranking
  de productos con más clics en **Estoy interesado**.
- Dado el catálogo, entonces la sección **Para revisar** lista lo accionable, cada ítem con un
  botón que lleva al módulo: productos publicados sin foto, agotados hace más de 30 días,
  banners desactivados y el resultado de la última carga CSV.
- Los indicadores de catálogo salen de las tablas actuales. Las visitas y los clics necesitan
  registrar eventos (tabla `eventos` en Supabase, sin datos personales): hasta que exista, esas
  tarjetas muestran «Sin datos todavía» y no cifras inventadas.

### HU-12 · Productos: listado, acciones y carga CSV
Como dueño quiero gestionar los productos y subir el CSV desde un solo módulo.

- Dado el módulo, entonces veo dos pestañas: **Listado** y **Carga CSV**.
- Dado el listado, entonces cada fila muestra foto, nombre y especificaciones, categoría, precio,
  stock, si falta la foto y si está visible u oculto.
- Dado el listado, puedo buscar por nombre, marca o categoría y filtrar por Todos, Agotados,
  Ocultos y Sin foto.
- Dada una fila, el menú **Acciones** ofrece Editar, Marcar agotado/Reponer, Ocultar/Mostrar y
  Eliminar; Eliminar pide confirmación dentro de la página.
- Dado **Nuevo producto**, abre el formulario de creación con las columnas de venta (RN-04).
- Dada la pestaña **Carga CSV**, funciona según HU-09 y añade la descarga de una plantilla CSV.

### HU-13 · Banners e imágenes de categorías
Como dueño quiero cambiar los banners de la portada y las imágenes de categorías sin tocar código.

- Dado el módulo, entonces veo una vista previa de la portada con el corte diagonal y la rotación
  reales de Inicio, usando solo los banners activos.
- Dado **Subir banner**, elijo la imagen de escritorio (1600×500) y, opcional, la de celular
  (800×800); se suben a Cloudinary (0007) y se rechazan formatos distintos de JPG, PNG o WebP y
  archivos de más de 2 MB, con el motivo.
- Dado un banner, puedo editar su título, texto, botón y enlace (ruta de la web, URL o
  `wa:<mensaje>`), activarlo o desactivarlo y quitarlo.
- Dada la lista, puedo cambiar el orden arrastrando o con las flechas; el orden se guarda y la
  web lo respeta.
- Dadas las categorías, cada una muestra su imagen (800×600) y un botón **Cambiar**.

### HU-14 · Categorías: crear, actualizar y quitar
Como dueño quiero administrar las categorías del catálogo.

- Dado **Agregar categoría**, con un nombre, entonces se crea con un enlace generado del nombre
  (sin tildes ni espacios) y queda visible.
- Dada una categoría, puedo editar nombre y enlace, mostrarla u ocultarla y quitarla.
- Dado un nombre o enlace repetido, entonces veo el motivo y no se guarda.
- Dada una categoría con productos, al quitarla los productos **no se borran**: pasan a «Sin
  categoría» y la pantalla avisa cuántos.
- La tabla muestra imagen, nombre, enlace, número de productos y estado.

### HU-15 · Configuración de la tienda
Como dueño quiero cambiar los datos de la empresa sin tocar código.

- Dado el módulo, entonces veo cinco secciones: Empresa, Contacto y WhatsApp, Redes sociales,
  Horario y Catálogo, con navegación interna.
- Dados los datos de `lib/site.js` (nombre, lema, ciudad, dirección, WhatsApp, redes, horario),
  entonces el panel los lee de la tabla `configuracion` y la web los usa desde ahí; `lib/site.js`
  queda como valor de respaldo (modo demo).
- Dado el mensaje prellenado, entonces `{producto}` se reemplaza por el nombre del equipo y veo
  una vista previa del enlace de WhatsApp.
- Dado el WhatsApp, entonces solo acepta números con indicativo.
- Dados los interruptores **Mostrar agotados** y **Mostrar precios**, la web los respeta.
- Dados cambios sin guardar, la barra inferior lo avisa y ofrece **Guardar cambios** y
  **Descartar**; al guardar veo la confirmación.
- Dado el logo, puedo cambiarlo por una imagen PNG o SVG.

---

## Lo que aporta el dueño

| Qué | Formato | Dónde se pone |
|---|---|---|
| Banner 1 y Banner 2 | Escritorio 1600×500 px · celular 800×800 px (opcional), JPG o WebP | `public/banners/` |
| Enlace de cada banner | Un producto, una categoría o WhatsApp | `lib/site.js` |
| Imagen por categoría | Cuadrada, 600×600 px, fondo claro | `public/categorias/` |
| Horario de atención | Texto, p. ej. "Lun a Sáb 9:00 a 6:00" | `lib/site.js` |
