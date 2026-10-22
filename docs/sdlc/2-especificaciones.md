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
Orden de construcción: HU-10, HU-12, HU-14, HU-15, HU-11 y HU-13 (todas hechas el 19 oct), HU-15, HU-13 y al final HU-11.

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
- Dado el encabezado, entonces muestra el nombre del módulo y un enlace **Ver la web** (pestaña
  nueva). **Cerrar sesión** está al pie del panel. El tema oscuro de la maqueta queda para después:
  los estilos actuales de la web son solo claros.
- Todo módulo se puede usar con teclado y los iconos tienen nombre accesible.

### HU-11 · Bandeja de entrada con métricas
Como dueño quiero ver cómo va la web al entrar al panel para saber qué atender hoy.

- Dado el módulo, entonces veo cuatro indicadores: visitas (páginas vistas), clics en WhatsApp,
  productos publicados (con cuántos ocultos) y agotados (con su porcentaje). Visitas y clics dicen
  su variación frente al periodo anterior de la misma duración. El periodo se elige entre 7, 14 y
  30 días y el mes en curso, en hora de Colombia.
- Dado el periodo, entonces veo una gráfica con las visitas por día (barras, eje izquierdo) y los
  clics en WhatsApp (línea, eje derecho), y el ranking de los 5 productos con más clics en
  **Estoy interesado**.
- Dado el catálogo, entonces la sección **Para revisar** lista lo accionable, cada ítem con un
  botón al módulo: no hay productos publicados, publicados sin foto, agotados hace más de 30 días
  (por su última actualización) y banners desactivados o ninguno activo. Si no hay nada: «Todo en
  orden». (El resultado de la última carga CSV no se guarda; se quitó de esta lista.)
- Las visitas y los clics se registran en la tabla `eventos` sin cookies ni datos personales
  (decisión 0010). Los robots no cuentan, el panel no se mide y la misma página repetida en menos
  de 2 segundos cuenta una vez. Sin eventos en el periodo, la gráfica dice que aún no hay visitas;
  nunca muestra cifras inventadas.

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

> Ajuste del 19 oct: cada banner es una **imagen ya diseñada** (con su texto y corte diagonal),
> como los de hoy; el panel no superpone texto. Así la portada se ve igual a lo que se sube.

- Dado el módulo, entonces veo una vista previa de la portada con el carrusel real, usando solo
  los banners activos con imagen. Sin ninguno, la portada usa los banners de respaldo de
  `lib/site.js` y la vista previa lo dice.
- Dado **Nuevo banner**, subo la imagen de escritorio (1600×500, proporción 16:5, al menos
  1200 px de ancho) y, opcional, la de celular (cuadrada, al menos 600 px). Se rechazan, con el
  motivo, formatos distintos de JPG, PNG o WebP, archivos de más de 2 MB y tamaños que no cumplen.
  Mientras sube, **Guardar** espera.
- Dado un banner, puedo editar su nombre interno, texto alternativo y enlace (ruta de la web, URL
  con https:// o `wa:<mensaje>`), cambiar o quitar sus imágenes, activarlo o desactivarlo y
  quitarlo con confirmación.
- Dada la lista, cambio el orden arrastrando o con las flechas; el orden se guarda y la web lo
  respeta.
- Dadas las categorías, cada una muestra su imagen y **Subir imagen / Cambiar**; si no es
  cuadrada, la web la recorta centrada. **Usar la de respaldo** vuelve a la ilustración.
- Dado **Configuración › Empresa**, puedo subir el logo (PNG, SVG, WebP o JPG, hasta 1 MB) o volver
  al archivo `public/logo.png`.
- Las imágenes van a Cloudinary con subida firmada (decisión 0007). Las que se reemplazan, se
  quitan o se suben sin guardar se borran de Cloudinary.

### HU-14 · Categorías: crear, actualizar y quitar
Como dueño quiero administrar las categorías del catálogo.

> Ajuste del 19 oct al modelo real (tabla `categorias`, 0009): los productos no se enlazan a una
> categoría por id. Cada categoría tiene una **palabra que agrupa** (`coincide_con`) y entran los
> productos cuya columna Categoría la contiene, sin tildes ni mayúsculas («portatil» agrupa
> «Portátil usado» y «Portátil nuevo»). Esa palabra es también el enlace `/productos?categoria=`.

- Dado **Agregar categoría** con un nombre, entonces se sugiere la palabra que agrupa (el nombre
  sin tildes, editable) y se ve en vivo cuántos productos agrupa y con qué textos; si no agrupa
  ninguno, se avisa. Al guardar queda visible y al final del orden.
- Dada una categoría, puedo editar nombre y palabra en la misma fila, mostrarla u ocultarla,
  subirla o bajarla en el orden y quitarla.
- Dado un nombre o una palabra que ya usa otra categoría (sin tildes ni mayúsculas), entonces veo
  el motivo y no se guarda.
- Dada una categoría con productos, al quitarla los productos **no se tocan**: conservan su texto
  y siguen en el catálogo y la búsqueda; solo dejan de agruparse ahí. La confirmación, dentro de
  la página, dice cuántos son.
- La tabla muestra orden, nombre, palabra con su enlace, número de productos y estado, y al pie
  cuántos productos no entran en ninguna categoría.
- La web (Inicio y `/categorias`) lee las categorías visibles de la tabla, en su orden, y las
  muestra aunque no agrupen productos, con «0 disponibles» (decidido por el dueño el 19 oct). Sin
  Supabase (modo demo) o con la tabla vacía se arman desde los productos, como antes.

### HU-15 · Configuración de la tienda
Como dueño quiero cambiar los datos de la empresa sin tocar código.

- Dado el módulo, entonces veo seis secciones con navegación interna: Empresa, Contacto y
  WhatsApp, Redes sociales, Horario, Catálogo y Cuenta.
- Dados los datos de `lib/site.js` (nombre, lema, ciudad, dirección, WhatsApp, redes, horario),
  entonces el panel los lee de la tabla `configuracion` (claves `empresa` y `catalogo`) y la web
  los usa desde ahí: encabezado, pie, títulos de pestaña y todos los enlaces de WhatsApp.
  `lib/site.js` queda como respaldo (modo demo, tabla vacía o Supabase caído).
- Dado el mensaje del botón «Estoy interesado», entonces `{producto}` se reemplaza por el nombre
  del equipo y `{codigo}` por su código, y veo una vista previa del enlace de WhatsApp.
- Dado el WhatsApp, entonces solo acepta números con indicativo (10 a 15 dígitos); espacios, `+`
  y guiones se limpian solos. Las redes deben empezar por `https://`; vacías no se muestran.
- Dado **Mostrar agotados** apagado, los agotados desaparecen de la web; dado **Mostrar precios**
  apagado, los productos dicen «Precio: consultar». El panel sigue viendo todo.
- Dados cambios sin guardar, la barra inferior lo avisa y ofrece **Guardar cambios** y
  **Descartar**; el navegador avisa si se sale de la página con cambios pendientes.
- Dada la sección **Cuenta**, puedo cambiar la contraseña del panel (mínimo 8 caracteres,
  repetida dos veces). Agregado el 19 oct tras perderse la contraseña del dueño.
- Cambiar el **logo** desde el panel queda para HU-13, porque necesita la subida de imágenes a
  Cloudinary; por ahora se usa `public/logo.png`.

---

## HU-17 · Fotos de productos en Cloudinary

Como dueño quiero subir las fotos de un producto desde mi computador y pasar a Cloudinary las que hoy están en Drive, para que la web cargue rápido y no dependa de compartir cada archivo (decisión 0007). Solo fotos: los videos siguen como enlaces.

- Dado el formulario de producto, entonces veo las fotos como miniaturas y el botón **Subir fotos** (varias a la vez; JPG, PNG o WebP; al menos 400 px de ancho, mejor 800 o más; hasta 2 MB cada una; máximo 8 por producto). Puedo quitar una y marcar otra como **portada** (la primera). Como respaldo puedo pegar una URL.
- Dado que no escribí el Código, entonces no puedo subir: las fotos se guardan en `ventas-virtual/productos/<código>/` y en la base va solo la URL.
- Dada una foto subida que no se guarda (cancelo el formulario o la quito antes de guardar), o una foto guardada que quito, entonces se borra de Cloudinary; nunca se borra una que esté en uso por un producto, banner, categoría o el logo.
- Dada la pestaña **Migrar fotos**, entonces veo cuántos productos tienen fotos fuera de Cloudinary; al migrar se copian en tandas de 3 productos con barra de avance y se reemplaza el enlace en el producto.
- Dada una foto que no se puede leer (Drive sin compartir), entonces queda como estaba y aparece en la lista de problemas con el código del producto. Repetir la migración salta lo ya migrado.
- Dada la web pública y el listado del panel, entonces siguen mostrando las fotos de Drive y de Cloudinary; las de Cloudinary salen con formato y calidad automáticos.

---

## HU-18 · Editar producto en pantalla completa

Como dueño quiero que al editar o crear un producto se abra una página completa, con los datos organizados por secciones, para trabajar con comodidad y que se vea profesional. Reemplaza el modal angosto de Productos.

- Dado el listado, entonces **Editar** (menú de la fila) y **Nuevo producto** llevan a páginas propias, `/admin/productos/<id>` y `/admin/productos/nuevo`, con enlace directo y el botón «Atrás» del navegador funcionando. Productos sigue resaltado en el panel lateral y el título del encabezado dice «Editar producto» o «Nuevo producto».
- Dada la página, entonces veo el enlace «← Productos», el nombre del producto con su Código y una barra inferior fija con **Guardar** y **Cancelar**.
- Dadas las secciones en dos columnas (una sola en celular):
  - Columna principal: **Información general** (Código, Categoría, Descripción, Marca, Modelo), **Especificaciones** (Procesador, Generación, RAM, Almacenamiento, Estado) y **Fotos y video** (la galería de HU-17 y el enlace del video).
  - Columna lateral: **Estado en la tienda** (Disponible o Agotado/Vendido, y Ocultar de la web) y **Precio e inventario** (Precio en pesos y Stock).
- Dado un producto que no existe o un enlace viejo, entonces veo «Producto no encontrado» con el enlace de regreso al listado.
- Dado guardar, entonces vuelvo al listado con el aviso «Producto actualizado» o «creado», y las fotos que ya no se usan se borran de Cloudinary (igual que en HU-17).
- Dado cancelar o salir sin guardar, entonces las fotos subidas y no guardadas se borran de Cloudinary y, si hay cambios, el navegador avisa antes de salir.
- Se conserva todo lo anterior: el Código es obligatorio, la carga CSV, la migración de fotos y las acciones rápidas del menú (agotado, ocultar, eliminar).

---

## HU-19 · Listado de productos: columna Código y filtros por características

Como dueño quiero ver el Código de cada producto en su propia columna y filtrar el listado por sus características, para encontrar rápido el equipo que voy a editar, marcar agotado o volver a poner disponible. Este listado es donde se administra lo que se ve en la web.

- Dada la tabla, entonces la primera columna es **Código** y la siguiente **Producto** (foto, nombre y especificaciones, ya sin el código repetido).
- Dado el listado, entonces los filtros van en un **panel a la izquierda de la tabla**, a lo alto (como en Mercado Libre); en celular el panel se abre y se cierra con un botón **Filtros** encima de la tabla.
- Dado el panel de filtros, entonces puedo filtrar por **Modelo**, **RAM**, **Procesador** y **Generación** con listas desplegables, y por **Precio mínimo** y **Precio máximo** en pesos.
- Dados los filtros, entonces son **dinámicos**: las opciones salen de los productos cargados (no de una lista fija), cada opción dice cuántos productos tiene, y al elegir un filtro las demás listas solo muestran lo que todavía tiene resultados. Valores escritos distinto («8GB» y «8 GB») cuentan como uno.
- Dados varios filtros, entonces se combinan entre sí, con la búsqueda y con los botones Todos, Agotados, Ocultos y Sin foto. Veo cuántos filtros hay activos y un botón **Limpiar filtros**.
- Dado un precio mínimo mayor que el máximo, entonces el panel lo avisa y no oculta todo sin explicación.
- Dado que entro a editar un producto y vuelvo, entonces la búsqueda y los filtros siguen como los dejé (se recuerdan en esta pestaña del navegador).
- Dado el celular, entonces los filtros se acomodan en una columna sin desbordar la pantalla.

---

## HU-20 · Tamaño de la tabla de productos y paginación

Como dueño quiero que el listado muestre los productos por páginas numeradas y poder elegir cuántos ver a la vez, para que la tabla cargue y se lea bien cuando el inventario crezca.

**Tamaño de la tabla:**

| Opción «Ver» | Productos por página | Uso |
|---|---|---|
| **20** (por defecto) | 20 | Lo normal al entrar |
| 25 | 25 | Un poco más por página |
| 50 | 50 | Revisión rápida de muchos equipos |
| 100 | 100 | Ampliado |
| Todos | Todo lo filtrado | Ampliado al máximo, sin páginas |

- Dado el listado, entonces muestra **20 productos** por página y debajo de la tabla una paginación numerada **1, 2, 3, 4…** con **Anterior** y **Siguiente**. La página actual está resaltada; Anterior se desactiva en la primera y Siguiente en la última.
- Dadas muchas páginas, entonces se muestran la primera, la última y las vecinas de la actual, con «…» en los saltos (por ejemplo 1 … 4 5 6 … 12), para que la barra no desborde.
- Dado el selector **Ver**, entonces puedo elegir 20, 25, 50, 100 o Todos. Al cambiarlo vuelvo a la página 1.
- Dada la tabla, entonces debajo dice qué estoy viendo: «Mostrando 21–40 de 134 productos» (y «filtrados de N» si hay búsqueda o filtros).
- Dados la búsqueda, los botones de arriba o los filtros del panel (HU-19), entonces la paginación cuenta solo lo filtrado y vuelve a la página 1 al cambiarlos.
- Dado que marco agotado, oculto o elimino un producto y la página queda vacía, entonces paso a la última página que tenga productos.
- Dado que entro a editar y vuelvo, entonces sigo en la misma página y con el mismo tamaño (se recuerdan en la pestaña junto con los filtros).
- Con una sola página, la paginación no se muestra; el selector Ver sí.
- Dado que cambio de página desde abajo, entonces la vista sube al inicio de la tabla para empezar a leer desde el primer producto.

---

## HU-21 · Diseño y branding: la web pública en «modo pantalla»

Como dueño quiero que la web pública se vea con la identidad de Ventas Virtual (la pantalla y el marco del monitor del logo), para que la marca se reconozca y la tienda se vea profesional y distinta. Aplica la guía visual aprobada: [docs/diseno/guia-visual.md](../diseno/guia-visual.md).

**Alcance:** Inicio, Categorías, Productos, ficha de producto, encabezado, pie y botón flotante de WhatsApp. El panel `/admin` **no cambia** (se queda claro).

- Dada cualquier página pública, entonces el **encabezado y el pie** son azul pantalla con la constelación y el **contenido del medio es blanco** (ajuste del dueño del 22 oct, guía v1.1). Los colores salen solo de la guía visual.
- Dado el encabezado (logo, buscador, WhatsApp y envíos), entonces es azul pantalla **con la constelación**, con el **logo para fondo oscuro** (texto en blanco), el buscador en tono superficie, el menú y una **línea cian** debajo. El ícono de la pestaña es el monitor del logo.
- Dada la portada, entonces los banners temporales (mientras el dueño no suba los suyos) usan el fondo azul pantalla con la **constelación** y el amarillo para la cifra. La constelación también aparece en el panel de «Portátiles corporativos» y en el pie de página, dibujada con SVG ligero.
- Dadas las tarjetas de producto, entonces son **blancas** con borde gris, nombre y **precio en azul noche** y especificaciones en gris. «Agotado» va en **rojo con texto blanco**. El botón «Estoy interesado» sigue verde WhatsApp.
- Dados los botones principales (Ver más, Más portátiles, Buscar), entonces son **amarillos con texto azul noche**; los enlaces son cian enlace (`#0072A8`). El amarillo nunca va como letra sobre blanco.
- Dadas las categorías, la franja de confianza, la banda de contacto, los filtros del catálogo y la ficha de producto con su galería, entonces siguen la misma paleta y se leen sin esfuerzo.
- Dada la tipografía, entonces títulos, precios y botones usan **Montserrat** y los textos **Inter**, cargadas por la propia web (sin depender de que el visitante las tenga).
- Dados los contrastes, entonces todo texto cumple **WCAG AA (4,5:1)** según la tabla de la guía; el rojo nunca va como letra sobre el fondo oscuro.
- Dado el celular, entonces todo se ve bien a 390 px de ancho, sin scroll horizontal, y la constelación es más liviana.
- El logo que el dueño suba en `/admin/configuracion` sigue mandando sobre el de respaldo; debe ser una versión para fondo oscuro.

---

## Lo que aporta el dueño

| Qué | Formato | Dónde se pone |
|---|---|---|
| Banner 1 y Banner 2 | Escritorio 1600×500 px · celular 800×800 px (opcional), JPG o WebP | `public/banners/` |
| Enlace de cada banner | Un producto, una categoría o WhatsApp | `lib/site.js` |
| Imagen por categoría | Cuadrada, 600×600 px, fondo claro | `public/categorias/` |
| Horario de atención | Texto, p. ej. "Lun a Sáb 9:00 a 6:00" | `lib/site.js` |
