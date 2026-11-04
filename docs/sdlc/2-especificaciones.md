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

## HU-22 · Interruptor de modo claro y modo oscuro de la web

Como dueño quiero elegir desde el panel si la web pública se ve en modo claro o en modo oscuro, para cambiar la apariencia según la temporada o la campaña sin tocar código.

| Modo | Interruptor «Modo oscuro» | Cómo se ve (guía visual) |
|---|---|---|
| **Claro** (por defecto) | Apagado | v1.1: encabezado y pie azul pantalla con la constelación; contenido en blanco |
| **Oscuro** | Encendido | v1.0: toda la web en azul pantalla; tarjetas azul superficie con la foto en recuadro claro y precios en amarillo |

- Dado `/admin/configuracion`, entonces hay una sección **Apariencia** con el interruptor **Modo oscuro** (encendido o apagado, como «Mostrar precios»), con una explicación y una muestra pequeña de cada modo.
- Dado que lo cambio y pulso **Guardar cambios**, entonces la web pública pasa a ese modo en todas sus páginas (Inicio, Categorías, Productos y ficha). El cambio se ve al recargar, a más tardar en un minuto (las páginas se refrescan cada 60 s).
- Dado que nunca se tocó el interruptor, entonces la web está en **modo claro**.
- Dados los dos modos, entonces ambos cumplen la guía visual y los contrastes WCAG AA; el encabezado con la constelación, los banners, el panel de portátiles y el pie se ven igual en los dos.
- Dado el panel `/admin`, entonces **no cambia** con el interruptor: siempre es claro.
- Se guarda junto con la configuración del catálogo (sin tablas nuevas) y lo puede cambiar solo quien entra al panel.

---

## HU-24 · Cinta en movimiento «Ventas Virtual Colombia»

Como dueño quiero una cinta con un mensaje que se desplaza en la parte superior de la web, para destacar a qué nos dedicamos o una promoción sin tocar código.

**Decisiones (26 oct):** va en la **parte de arriba, sobre el encabezado** (franja delgada, la primera cosa que se ve); el mensaje se **edita desde `/admin/configuracion`** y tiene **interruptor de apagado**; se mueve de **derecha a izquierda**.

- Dado cualquier página pública (Inicio, Categorías, Productos y ficha), entonces la cinta se ve encima del encabezado, de borde a borde.
- Dado el mensaje, entonces se desplaza de derecha a izquierda en bucle continuo, sin saltos (el texto se repite hasta llenar el ancho).
- Dado el puntero (o el foco con teclado) sobre la cinta, entonces el movimiento se **pausa**.
- Dado que el sistema pide «reducir movimiento», entonces la cinta **no se mueve**: queda el mensaje fijo y centrado.
- Dado `/admin/configuracion`, entonces hay una sección **Cinta** con: interruptor **Mostrar cinta**, caja de **Mensaje** (hasta 200 caracteres, con contador) y una vista previa.
- Dado que pulso **Guardar cambios**, entonces la web se actualiza al recargar, a más tardar en un minuto (igual que HU-22).
- Dado que **nunca se configuró**, entonces la cinta se ve **encendida** con el mensaje base «Ventas Virtual Colombia · Equipos portátiles corporativos» (el dueño puede completar la frase).
- Dado el interruptor apagado o el mensaje vacío, entonces la cinta **no se muestra** y no deja espacio.
- Dados modo claro y modo oscuro, entonces la cinta cumple la guía visual y el contraste WCAG AA (texto amarillo sobre azul superficie) en ambos.
- Dado el panel `/admin`, entonces **no muestra** la cinta.
- Se guarda en la clave `catalogo` de `configuracion` (`cinta_visible`, `cinta_texto`), sin tablas nuevas; solo lo cambia quien entra al panel.

**Plan de tareas (SDD: especificar → build por orden del dueño → prueba en 3001 → OK → push):**

| # | Tarea | Dónde |
|---|---|---|
| 1 | Valores base `cinta_visible: true` y `cinta_texto` | `lib/configuracion.js` (`CATALOGO_BASE`) |
| 2 | Componente `Cinta` (CSS puro, pausa al pasar el puntero, `prefers-reduced-motion`) | `app/components/Cinta.js`, `app/(web)/tema-pantalla.css` |
| 3 | Insertarla sobre el encabezado leyendo `getConfig()` | `app/(web)/layout.js` |
| 4 | Sección **Cinta** en el panel con interruptor, mensaje y contador | `app/admin/configuracion/page.js` |
| 5 | Prueba en navegador (Playwright): mueve, pausa, apaga, vacío, claro/oscuro, celular; restaurar la configuración real al final | `docs/sdlc/4-pruebas.md` |

---

## HU-25 · Categorías en un menú desplegable de «Productos»

> **Reemplazada por HU-31 (26 oct):** el desplegable se retiró; las categorías van directamente en la barra del menú.

Como cliente quiero que al elegir «Productos» se despliegue la lista de categorías, para llegar rápido al tipo de equipo que busco sin recorrer todo el catálogo.

**Decisiones (26 oct):** las categorías van en un **menú desplegable** del ítem «Productos» del menú superior (no en una fila fija). Las categorías salen de `/admin/categorias`. *Sin número de productos por categoría* por ahora (el dueño no lo pidió; se puede agregar después).

- Dado el menú superior en computador, cuando el cliente pasa el puntero o pulsa **Productos**, entonces se despliega una lista: **Todos los productos** y cada categoría (Portátiles usados, Portátiles nuevos, Impresoras, Accesorios, Partes).
- Dado que pulsa **Productos** (el texto, no una opción), entonces va a `/productos` con todo el catálogo; el desplegable no impide entrar.
- Dada una categoría de la lista, cuando la pulsa, entonces va a `/productos?categoria=<categoría>` y el listado muestra solo esos productos; el enlace se puede compartir.
- Dada la página `/productos`, entonces la categoría activa se ve marcada también en el desplegable.
- Dado el celular, entonces «Productos» abre sus categorías como una lista que se expande dentro del menú móvil (sin pasar el puntero), con botones grandes.
- Dado el teclado y el lector de pantalla, entonces el desplegable se abre con Enter o Espacio, se recorre con las flechas, se cierra con Escape y al hacer clic fuera, y anuncia si está abierto o cerrado.
- Dado que el dueño crea, renombra, quita u oculta una categoría en `/admin/categorias`, entonces el desplegable se actualiza al recargar, a más tardar en un minuto.
- Dado que no hay categorías, entonces «Productos» es un enlace simple sin desplegable.
- Dados modo claro y modo oscuro, entonces el desplegable cumple la guía visual y el contraste WCAG AA.

**Plan de tareas:**

| # | Tarea | Dónde |
|---|---|---|
| 1 | Leer las categorías en el encabezado de la web | `app/(web)/layout.js`, `lib/categorias.js` |
| 2 | Componente del desplegable accesible (hover/clic, teclado, Escape, móvil) | `app/components/` y `app/(web)/tema-pantalla.css` |
| 3 | Que `/productos` filtre por `?categoria=` y marque la activa | `app/(web)/productos/`, `app/components/Catalog.js` |
| 4 | Prueba en navegador (Playwright): abrir, elegir, enlace compartido, teclado, celular, categoría nueva/oculta; restaurar datos reales | `docs/sdlc/4-pruebas.md` |

---

## HU-26 · Páginas de políticas editables desde el panel (garantía, devolución, envíos, términos y privacidad)

Como dueño quiero crear, modificar y quitar desde `/admin` las páginas de políticas, para mantener la garantía, las devoluciones, los envíos, los términos y la privacidad al día sin pedir cambios de código; y como cliente quiero encontrar rápido un título o subtítulo dentro de cada política.

**Páginas iniciales (se crean con borradores «por revisar»):** Garantía · Política de devolución · Política de envíos · Términos y condiciones · Política de privacidad (Ley 1581). El dueño o su asesor legal valida el texto antes de publicar; Claude no da el texto como definitivo.

### Modelos de diseño evaluados

| Modelo | Cómo se ve | Para quién |
|---|---|---|
| **A · Índice a la izquierda + secciones tipo «+» (acordeón)** | Índice fijo con «01, 02…»; a la derecha, cada sección se abre y se cierra | Políticas largas con muchos bloques; la lectura es corta y ordenada |
| **B · Índice a la izquierda + texto corrido** | Índice fijo que marca la sección que se está leyendo; a la derecha todo el texto seguido | Textos legales que se leen completos (privacidad, términos) y se imprimen mejor |
| **C · Solo texto** | Una columna de texto con títulos | Páginas cortas; sin ayuda para saltar entre títulos |

**Decisión del dueño (26 oct):** le gusta el **índice al lado izquierdo** para que el cliente llegue rápido al título. Se implementan **A y B con el mismo índice** y el dueño elige el estilo **por página** (por defecto, **A · acordeón**). C queda como la forma que toma una página con una sola sección.

### Criterios

- **Pública.** Dado `/politicas/<nombre>` (p. ej. `/politicas/garantia`), entonces se ve el título, la fecha de última actualización, el **índice a la izquierda** (sticky al hacer scroll) y las secciones a la derecha en el estilo elegido.
- **Índice.** Dado el índice, cuando el cliente pulsa un título, entonces la página baja a esa sección (y en acordeón la abre); en texto corrido el índice marca la sección visible. Cada sección tiene enlace propio (`#duracion-de-la-garantia`) que se puede compartir.
- **Buscar en la página.** Dado el campo «Buscar en esta política» sobre el índice, cuando el cliente escribe, entonces el índice y las secciones se filtran por título y texto, y las coincidencias quedan resaltadas.
- **Celular.** Dado un celular, entonces el índice pasa a un desplegable «Contenido» arriba de las secciones. El botón flotante de WhatsApp **no tapa** el índice ni el texto (ver imagen de referencia).
- **Pie de página.** Dado el pie, entonces una columna **Soporte** lista las políticas visibles (p. ej. «Política de envíos», «Términos y Condiciones», «Política de Privacidad») con enlace a cada una, y se actualiza sola al agregar o quitar páginas.
- **Panel.** Dado `/admin/politicas` (nuevo módulo del panel), entonces el dueño ve la lista de páginas y puede **crear, editar, ocultar y quitar** (pidiendo confirmación) y **ordenar** cuál sale primero.
- **Editor.** Dada una página en edición, entonces el dueño cambia: título, dirección (se propone desde el título y se puede ajustar), estilo (acordeón o texto corrido), visible sí/no y la **lista de secciones**: agregar, renombrar, borrar, **subir y bajar**, cada una con su texto.
- **Texto.** Dado el texto de una sección, entonces admite párrafos, listas con «- » y **negrita** con `**así**`. No se acepta HTML (seguridad); se escapa todo lo que escriba el dueño.
- **Vista previa y guardado.** Dado que pulsa **Guardar cambios**, entonces la web se actualiza al recargar, a más tardar en un minuto. Se puede ver una **vista previa** antes de guardar y el panel avisa si hay cambios sin guardar.
- **Borrador.** Dada una página oculta, entonces no aparece en el pie ni en la web (responde «no encontrada»), pero el dueño la sigue viendo en el panel.
- **Sin páginas.** Dado que no hay ninguna visible, entonces la columna Soporte no se muestra.
- **Accesibilidad.** Dado teclado y lector de pantalla, entonces el índice y el acordeón se manejan con Tab, Enter/Espacio y Escape, con foco visible y estado «abierto/cerrado» anunciado; contraste WCAG AA en modo claro y oscuro.
- **Permisos.** Solo quien entra al panel puede cambiarlas; el público solo lee las visibles.

### Datos y plan de tareas

Tabla nueva `paginas` (única tabla nueva de esta mejora, con RLS: lectura pública solo de las visibles; escritura solo de usuarios autenticados): `slug`, `titulo`, `estilo` (`acordeon` | `texto`), `orden`, `visible`, `secciones` (JSON: lista de `{titulo, texto}`), `actualizado`. Decisión técnica nueva: **0011 · Páginas de contenido en Supabase**.

| # | Tarea | Dónde |
|---|---|---|
| 1 | Decisión 0011 y migración `paginas` con RLS y 5 borradores iniciales | `docs/decisiones/`, `supabase/migrations/` |
| 2 | Capa de datos: leer visibles, CRUD del panel, límites (título, secciones, texto) | `lib/paginas.js` |
| 3 | Texto seguro: párrafos, listas y negrita sin HTML | `lib/texto-seguro.js` |
| 4 | Página pública con índice, acordeón o texto corrido, buscador y enlaces por sección | `app/(web)/politicas/[slug]/`, `tema-pantalla.css`, `tema-oscuro.css` |
| 5 | Columna **Soporte** en el pie leyendo las páginas visibles | `app/(web)/layout.js` |
| 6 | Módulo `/admin/politicas`: lista, crear, editar secciones, ocultar, ordenar, quitar, vista previa | `app/admin/politicas/`, `AdminShell.js` |
| 7 | Prueba en navegador (Playwright) con datos `QA-*`: crear, editar, ocultar, quitar, buscar, celular, teclado, claro/oscuro; borrar al final | `docs/sdlc/4-pruebas.md` |

**Decisiones (26 oct):** Claude redacta los cinco **borradores base** (marcados «por revisar», con los datos a confirmar entre corchetes) y se cargan **ocultos**: el dueño o su asesor los revisa y los publica desde el panel. «Preguntas frecuentes» queda para una **HU aparte** (puede reutilizar la tabla `paginas`). Una página de **una sola sección** se muestra sin buscador y con el texto abierto; no se puede **publicar** una página sin secciones.

---

## HU-27 · Ficha técnica completa del producto, editable desde el panel

Como cliente quiero ver en la página de cada equipo (p. ej. «HP EliteBook») una ficha técnica completa, para saber exactamente qué compro; y como dueño quiero cargar esos datos desde `/admin/productos`, sin tocar código.

**Referencia (imágenes del 26 oct):** tabla «Ficha técnica completa» de dos columnas (Marca / Modelo, Procesador, Memoria RAM, Almacenamiento, Pantalla, Gráficos, Conectividad, Ethernet…) con filas alternadas.

- **Dónde.** Dada la ficha `/producto/<código>`, entonces la ficha técnica aparece **debajo de las fotos** y del botón «Estoy interesado · WhatsApp», con el título **Ficha técnica completa**. En celular va en una sola columna, sin desbordar.
- **Qué muestra.** Dada la ficha, entonces es una tabla de **Característica → Valor** con filas alternadas y los datos que el dueño cargó, en el orden que los puso. Si el producto no tiene ficha, entonces **no se muestra** el bloque ni deja espacio.
- **Datos que ya existen.** Dado un producto sin ficha cargada, entonces la web **no inventa** filas; solo mantiene lo actual (marca, modelo, procesador, RAM, almacenamiento, estado).
- **Panel.** Dado `/admin/productos/<id>` (edición en página completa, HU-18) y **Nuevo producto**, entonces hay una sección **Ficha técnica** con filas de dos campos (Característica y Valor) donde puedo **agregar, editar, quitar y reordenar** (subir/bajar) filas.
- **Sugerencias.** Dada una fila nueva, entonces el campo Característica propone nombres habituales (Pantalla, Gráficos, Conectividad, Puertos, Batería, Sistema operativo, Peso, Teclado, Cámara, Garantía…) pero admite cualquier texto.
- **Plantilla.** Dado el botón **Usar plantilla de portátil**, entonces carga las filas típicas vacías para rellenar; no pisa lo ya escrito.
- **Copiar.** Dado el botón **Copiar ficha de otro producto**, entonces busco por código o modelo y se copian sus filas para ajustarlas (útil con lotes iguales).
- **Límites.** Hasta **40 filas** por producto; Característica hasta 60 caracteres y Valor hasta 300. Las filas **sin valor** (p. ej. las de la plantilla que no se llenaron) se descartan al guardar y el panel lo avisa; un valor sin característica da error.
- **Seguridad.** Todo es **texto plano**: no se acepta HTML y la web lo escapa.
- **Carga CSV.** Dada la carga CSV, entonces una columna opcional **Ficha** acepta `Pantalla=14" HD; Gráficos=Intel UHD 620` (pares separados por `;`); sin la columna, la ficha existente **no se borra**.
- **Vista previa y avisos.** Dado el panel, entonces ve cómo queda la ficha antes de guardar y avisa si salgo con cambios sin guardar.
- **Pública y privacidad.** Dada la API pública, entonces la ficha se agrega a la **lista blanca de columnas** (RN-04); nada interno se expone.
- Se ve igual en modo claro y oscuro con contraste WCAG AA.

**Datos:** columna nueva `ficha jsonb not null default '[]'` en `productos` (lista de `{campo, valor}`), con migración; sin tablas nuevas.

**Plan de tareas:**

| # | Tarea | Dónde |
|---|---|---|
| 1 | Migración `ficha` y lista blanca pública (RN-04) | `supabase/migrations/`, `lib/inventory.js` |
| 2 | Validación y límites de la ficha | `lib/productos.js` o `lib/ficha.js` |
| 3 | Sección **Ficha técnica** del formulario (filas, reordenar, sugerencias, plantilla, copiar) | `app/admin/productos/ProductoForm.js`, `campos.js` |
| 4 | Columna `Ficha` en la carga CSV (opcional, sin borrar) | `app/admin/productos/`, `lib/csv.js` |
| 5 | Bloque público bajo fotos y WhatsApp, en claro y oscuro | `app/(web)/producto/[codigo]/page.js`, `tema-pantalla.css`, `tema-oscuro.css` |
| 6 | Prueba en navegador con producto `QA-*`: crear, editar, reordenar, vacío, celular, CSV; borrar al final | `docs/sdlc/4-pruebas.md` |

**Decisión (26 oct):** la ficha se muestra **siempre abierta** (también en celular, en una columna). La descripción larga con título de las otras imágenes es **HU-29**.

---

## HU-28 · Filtro dinámico para el cliente en Productos

Como cliente quiero filtrar los productos por sus características desde un panel al lado, para encontrar rápido el equipo que busco.

- **Dónde.** Dada la página `/productos`, entonces el panel de filtros está en **forma vertical a la izquierda** del listado (como en HU-19 del panel); en celular se abre con un botón **Filtros** encima del listado, a pantalla completa.
- **Filtros.** Dado el panel, entonces ofrece: **Marca**, **Modelo**, **Procesador**, **Tipo**, **Precio mínimo**, **Precio máximo** y **Táctil** (Sí / No / Todos).
- **Dinámico.** Dadas las listas, entonces las opciones salen de los productos publicados (no de una lista fija), muestran **cuántos productos** tiene cada una, y al elegir una, las otras solo ofrecen lo que aún tiene resultados; «8GB» y «8 GB» cuentan como uno. Solo salen las opciones que existen.
- **Aplicar.** Dado el botón **Aplicar**, entonces el listado se actualiza con los filtros elegidos (no antes); junto a él hay **Limpiar** y se ve cuántos filtros hay activos y cuántos productos coinciden.
- **Enlace.** Dados los filtros aplicados, entonces quedan en la dirección (`/productos?marca=HP&procesador=…&tactil=si&min=…&max=…`) y se pueden compartir; al volver atrás de una ficha, siguen como estaban.
- **Combina.** Dados los filtros, entonces se combinan entre sí, con la **búsqueda** y con la **categoría** del menú desplegable (HU-25): elegir una categoría en el menú marca ese **Tipo** en el panel y viceversa.
- **Precios.** Dado un mínimo mayor que el máximo, entonces avisa y no deja el listado en blanco sin explicación. Con **Mostrar precios** apagado en la configuración, entonces **no se ofrecen** los filtros de precio.
- **Sin resultados.** Dado que nada coincide, entonces dice «No encontramos equipos con esos filtros» y ofrece **Limpiar filtros** y escribir por WhatsApp.
- **Agotados.** Dado el ajuste de agotados de `/admin/configuracion`, entonces los filtros respetan lo que la web ya muestra u oculta.
- **Teclado y lector.** Dado el panel, entonces se maneja con Tab y Enter, tiene etiquetas y anuncia el número de resultados; contraste WCAG AA en claro y oscuro.
- **Rendimiento.** Dado el catálogo, entonces el filtro se calcula en el navegador con los datos públicos ya cargados, sin consultas nuevas por cada clic.

- **Botones de categoría.** Dado el panel, entonces el **Tipo** reemplaza la fila de botones de categoría que había sobre el listado (HU-25): una sola forma de elegir categoría en la página, que se aplica con **Aplicar** como los demás filtros. El menú desplegable de «Productos» sigue llevando directo a cada categoría.
- **Solo disponibles.** Se conserva la casilla que ya tenía el catálogo, dentro del panel.

**Campo nuevo — Táctil:** hoy no existe en el producto. Se agrega `tactil boolean` (por defecto «No») en `productos`, editable en `/admin/productos` (casilla «Pantalla táctil») y opcional en el CSV; entra en la lista blanca pública. «Tipo» se toma de la **Categoría** del producto (confirmado).

**Plan de tareas:**

| # | Tarea | Dónde |
|---|---|---|
| 1 | Migración `tactil`, casilla en el formulario y columna opcional del CSV; lista blanca pública | `supabase/migrations/`, `campos.js`, `lib/inventory.js` |
| 2 | Lógica de filtros dinámicos con conteos (reutilizar la de HU-19) | `lib/filtros.js` |
| 3 | Panel vertical con **Aplicar**, **Limpiar** y botón Filtros en celular | `app/components/Catalog.js`, `FiltrosCatalogo.js`, `tema-pantalla.css` |
| 4 | Filtros en la dirección y unión con búsqueda y categoría (HU-25) | `app/(web)/productos/page.js` |
| 5 | Prueba en navegador con productos `QA-*`: cada filtro, combinación, vacío, enlace, celular, precios ocultos; borrar al final | `docs/sdlc/4-pruebas.md` |

**Decisiones (26 oct):** **Tipo = Categoría** del producto (Portátil usado, Impresora…). Los filtros se aplican **solo con el botón Aplicar** (el cliente elige y pulsa; no se filtra al instante), también en computador.

---

## HU-29 · Descripción ampliada del producto (insignia, resumen y descripción larga)

Como cliente quiero leer, en la ficha del equipo, un resumen destacado y una descripción larga con título, para entender por qué me conviene; y como dueño quiero escribirlos desde `/admin/productos`.

**Referencia (imágenes del 26 oct):** insignia «Usado en buen estado», título del producto, **resumen destacado** con barra azul a la izquierda y fila de datos con íconos (procesador, RAM, SSD, pantalla), y más abajo un bloque **Descripción** con título propio, párrafos y **negritas**.

**Decisión sobre HTML (26 oct):** la descripción **no acepta HTML**. Usa el mismo texto seguro de HU-26: párrafos, `**negrita**`, listas con «- » y subtítulos con «## ». Se ve igual que la referencia y el panel ofrece botones **Negrita**, **Lista** y **Subtítulo**; se evita que un pegado con scripts o estilos dañe la web (seguridad, RN-04).

- Dada la ficha `/producto/<código>`, entonces arriba muestra la **insignia** con el campo **Estado** del producto (ya existe), el nombre, el **resumen destacado** y la fila de datos clave con íconos tomados de procesador, RAM, almacenamiento y pantalla (los que existan).
- Dado el bloque **Descripción**, entonces muestra el **título** y el **texto largo** cargados; va **antes** de la Ficha técnica (HU-27).
- Dado que un producto no tiene resumen, título o texto largo, entonces ese bloque **no se muestra** y no deja espacio.
- Dado `/admin/productos/<id>` y **Nuevo producto**, entonces hay una sección **Descripción ampliada** con: **Resumen** (hasta 400 caracteres, con contador), **Título de la descripción** (hasta 120) y **Texto** (hasta 5000) con los botones de formato y **vista previa**.
- Dada la carga CSV, entonces las columnas opcionales **Resumen**, **Título descripción** y **Descripción larga** se leen; sin ellas **no se borra** lo existente.
- Modo claro y oscuro con contraste WCAG AA; celular en una columna.

**Ajuste de diseño (26 oct, pedido del dueño con referencia):**

- Dada la ficha con descripción y ficha técnica, entonces debajo de la galería la página se divide en **dos columnas proporcionales**: a la **izquierda la Descripción ampliada** (≈ 60 %) y a la **derecha las Especificaciones** (≈ 40 %), en una tarjeta que acompaña el scroll (sticky) mientras se lee la descripción.
- Dado el **Título de la descripción**, entonces se ve **grande, en mayúsculas**, en Montserrat con buen espaciado entre letras y una línea de acento, debajo de la etiqueta «Descripción».
- Dada la tarjeta **Especificaciones** (los datos de la Ficha técnica, HU-27), entonces cada fila muestra un ícono según la característica (procesador, memoria, almacenamiento, pantalla, gráficos, conectividad, puertos, batería, sistema…; uno genérico para las demás), la característica en negrita a la izquierda y el valor a la derecha.
- Dado que el producto solo tiene uno de los dos, entonces ese bloque ocupa el ancho completo (la ficha técnica como tabla «Ficha técnica completa», igual que antes).
- Dado el celular o una pantalla angosta (< 960 px), entonces las columnas se apilan: primero Descripción y luego Especificaciones, sin sticky ni scroll horizontal.
- Dado el **resumen destacado** y la fila de **datos clave con íconos**, entonces van en una caja **debajo de las fotos** (columna izquierda, mismo ancho de la galería), para llenar ese espacio y aligerar la columna derecha (nombre, precio, datos y WhatsApp). En celular la caja va **después** del botón de WhatsApp, para no separar las fotos del nombre.

**Datos:** columnas nuevas `resumen text`, `detalle_titulo text` y `detalle text` (vacías por defecto) en `productos`, con migración y lista blanca pública.

**Plan de tareas:**

| # | Tarea | Dónde |
|---|---|---|
| 1 | Migración de las tres columnas y lista blanca (RN-04) | `supabase/migrations/`, `lib/inventory.js` |
| 2 | Texto seguro compartido con HU-26 | `lib/texto-seguro.js` |
| 3 | Sección del formulario con contadores, botones de formato y vista previa | `app/admin/productos/ProductoForm.js`, `campos.js` |
| 4 | Encabezado y bloque Descripción en la ficha pública | `app/(web)/producto/[codigo]/page.js`, `tema-pantalla.css`, `tema-oscuro.css` |
| 5 | Columnas opcionales del CSV | `app/admin/productos/`, `lib/csv.js` |
| 6 | Prueba en navegador con producto `QA-*`: texto con HTML intentado (debe verse como texto), vacío, celular; borrar al final | `docs/sdlc/4-pruebas.md` |

---

## HU-30 · Productos sugeridos y vistos recientemente

Como cliente quiero ver, al final de la página de un equipo, otros portátiles parecidos y los que ya revisé, para comparar sin volver al catálogo y no perder de vista lo que me gustó.

**Dónde (26 oct, pedido del dueño):** al **final de la página del producto**, justo antes del pie de página («Contacto»), debajo de la descripción y las especificaciones.

**Decisiones del dueño (26 oct):** las **dos filas**, **«Te pueden interesar»** primero y **«Vistos recientemente»** debajo; **4 productos visibles por fila**, con un **botón a la derecha (y a la izquierda) para ver los demás** cuando hay más; **solo en la ficha del producto** (el catálogo queda como está).

- **Te pueden interesar.** Dada la ficha `/producto/<código>`, entonces se muestran hasta **12 equipos parecidos** (4 visibles a la vez, el resto con las flechas), elegidos por reglas simples en este orden: misma **categoría**, misma **marca**, **precio** dentro de ±30 % y procesador de generación cercana; primero los **disponibles**. Nunca aparece el mismo equipo que se está viendo. Si faltan, se completan con otros disponibles de la categoría. Los más parecidos van primero, así los 4 visibles son los mejores.
- **Vistos recientemente.** Dado un visitante que ya abrió otros productos, entonces se muestran hasta **8** de los últimos que vio, del más reciente al más antiguo, sin incluir el actual. Si es su primera visita o no vio otros, la fila **no aparece**.
- **Privacidad (decisión 0010).** El historial se guarda **solo en el navegador del visitante** (almacenamiento local), con **solo los códigos de producto**: no se envía al servidor, no usa cookies, no se asocia a una persona y **no requiere aviso de cookies**. Un enlace **«Borrar historial»** junto al título de la fila lo limpia.
- **Siempre al día.** Dado que un producto visto se oculta, se elimina o ya no se publica, entonces desaparece de «Vistos»; los precios, el estado y las fotos salen siempre del catálogo actual, no de lo guardado.
- **Tarjetas.** Dadas las filas, entonces usan las **mismas tarjetas del catálogo** (foto, nombre, procesador, precio, «Disponible» o «Agotado»), con enlace a su ficha. Con **«Mostrar precios»** apagado en `/admin/configuracion`, no muestran precio; con **«Mostrar agotados»** apagado, no incluyen agotados.
- **Flechas.** Dada una fila con más de 4 productos (escritorio), entonces se ven **4 tarjetas** y un botón **›** a la derecha que avanza de a una página; al avanzar aparece el botón **‹** para volver. Cada botón se **desactiva o desaparece** en el extremo y tiene nombre para lector de pantalla («Ver más productos», «Ver anteriores»). Con 4 o menos, no hay flechas.
- **Celular.** Dado el celular, entonces la fila se **desliza con el dedo** (se ve parte de la siguiente tarjeta para que se note que hay más), con tarjetas de buen tamaño y **sin scroll horizontal de la página**; las flechas no se muestran.
- **Teclado.** Dado el teclado, entonces las flechas son botones alcanzables con Tab y la fila también se recorre con Tab entre tarjetas, mostrando la tarjeta enfocada.
- **Sin datos.** Dado que no hay equipos parecidos (catálogo muy pequeño), entonces **no se muestra el bloque** y no deja espacio.
- **Accesibilidad.** Dados teclado y lector de pantalla, entonces cada fila es una región con su título, las tarjetas son enlaces con foco visible y el botón «Borrar historial» tiene nombre claro; contraste WCAG AA en modo claro y oscuro.
- **Sin cambios de datos:** no lleva migración, tablas ni columnas nuevas; usa el catálogo público que la página ya carga.

**Plan de tareas:**

| # | Tarea | Dónde |
|---|---|---|
| 1 | Reglas de «Te pueden interesar» (categoría, marca, precio, generación, disponibilidad) | `lib/sugeridos.js` |
| 2 | Fila deslizable con flechas y 4 visibles (compartida por las dos filas), con las tarjetas del catálogo | `app/components/FilaProductos.js` |
| 2b | Bloque «Te pueden interesar» en la ficha | `app/(web)/producto/[codigo]/page.js` |
| 3 | Historial de vistos en el navegador, con control de límite, validación contra el catálogo y «Borrar historial» | `app/components/VistosRecientemente.js` |
| 4 | Estilos de la fila, flechas y celular, en claro y oscuro | `tema-pantalla.css`, `tema-oscuro.css` |
| 5 | Prueba en navegador (Playwright) con productos `QA-*`: sugeridos correctos y sin repetir, 4 visibles y flechas que avanzan y retroceden, vistos en orden y sin el actual, ocultar un producto lo quita, borrar historial, precios y agotados ocultos, celular (deslizar), teclado; borrar al final | `docs/sdlc/4-pruebas.md` |

---

## HU-31 · Barra de categorías en el menú principal (reemplaza «Productos ▾»)

Como cliente quiero ver las categorías directamente en la barra del menú, para entrar con un clic a «Portátiles usados», «Portátiles nuevos», «Torres tiny» o «Escritorios» sin abrir primero «Productos»; y como dueño quiero que esa barra salga de las categorías que manejo en `/admin/categorias`.

**Motivo (26 oct, dueño):** el desplegable de «Productos» (HU-25) repite lo mismo que las categorías. La barra pasa a ser como la referencia (sitecsas.com) pero con el diseño de la web ya implementado (guía visual «modo pantalla»).

**Cómo queda la barra (de izquierda a derecha):** botón **«☰ Todas las categorías»** · cada **categoría visible** como enlace (en mayúsculas, en el orden del panel) · **«Todos»** al final (todo el catálogo). Se **quitan** «Productos ▾» y «Contacto» (Contacto pasa a la barra superior, HU-32).

### Web pública (frontend)

- Dada cualquier página pública, entonces la barra oscura del encabezado muestra **«☰ Todas las categorías»**, las categorías visibles y **«Todos»**, con la tipografía y colores actuales (Montserrat, texto claro, resaltado amarillo al pasar el puntero).
- Dada una categoría de la barra, cuando el cliente la pulsa, entonces va a `/productos?categoria=<palabra>` (mismo filtro y mismo Tipo del panel de filtros de HU-28) y **la categoría queda marcada** en la barra.
- Dado **«Todos»**, entonces va a `/productos` con todo el catálogo y queda marcado cuando no hay categoría elegida.
- Dado **«☰ Todas las categorías»**, cuando se pulsa o se pasa el puntero, entonces se despliega la **lista completa** de categorías (con su imagen pequeña y el número de productos), más **«Ver todos los productos»** y **«Ver categorías con fotos»** (`/categorias`). Se cierra con Escape, al hacer clic fuera o al elegir.
- Dado que las categorías no caben en la barra (pantalla mediana), entonces las que sobran pasan a un enlace **«Más ▾»** al final, sin partir la barra en dos líneas.
- Dado el celular, entonces la barra muestra **«☰ Categorías»** y **«Todos»**; las categorías se deslizan de lado con el dedo y «☰» abre la lista completa a pantalla completa, con botones grandes.
- **Inicio:** se llega con el **logo** (como en la referencia); el enlace «Inicio» sale de la barra.
- Teclado y lector de pantalla: la barra es un menú de navegación con enlaces, el desplegable se abre con Enter o Espacio, se recorre con las flechas y anuncia abierto o cerrado; contraste WCAG AA en claro y oscuro.
- Dado que no hay categorías (modo demo o Supabase caído), entonces la barra muestra solo **«Todos»**.

### Panel y datos (backend)

- La barra sale de la tabla **`categorias`** que ya existe (HU-14): **visibles**, en su **orden**; crear, renombrar, ocultar o reordenar en `/admin/categorias` cambia la barra sola en un minuto.
- **Decisión del dueño (26 oct):** van **todas las categorías visibles**, sin casilla extra; **no hay migración**.
- El conteo de productos por categoría del desplegable sale del catálogo público (sin consultas nuevas por clic).

### Cambios a lo ya hecho

- Reemplaza el desplegable de **HU-25** (`MenuProductos`); se conservan las direcciones `/productos?categoria=…` y la sincronía con el **Tipo** de los filtros (HU-28). Las pruebas de HU-25 se actualizan.
- **Contacto** sale de la barra; mientras no exista la barra superior (HU-32) sigue en el pie de página y en el botón de WhatsApp. **Recomendación:** construir HU-32 antes o junto con HU-31.

**Plan de tareas:**

| # | Tarea | Dónde |
|---|---|---|
| 1 | Barra de categorías con «☰ Todas las categorías», «Más ▾» y «Todos»; categoría activa | `app/components/BarraCategorias.js`, `app/(web)/layout.js` |
| 2 | Desplegable completo con imagen y conteo; versión celular a pantalla completa | `app/components/`, `tema-pantalla.css`, `tema-oscuro.css` |
| 3 | Quitar «Inicio», «Productos ▾» y «Contacto» de la barra; retirar `MenuProductos` | `app/(web)/layout.js` |
| 4 | Pruebas en navegador (escritorio, «Más», celular, teclado, claro/oscuro) y actualizar las de HU-25 | `docs/sdlc/4-pruebas.md` |

**Decisiones del dueño (26 oct):** todas las categorías visibles van en la barra; al dar clic en **«☰ Todas las categorías»** se despliega la lista de categorías. Las categorías se muestran en **mayúsculas**, como la referencia.

---

## HU-32 · Barra superior con redes sociales, ubicación de la tienda, Nosotros y Contacto

Como cliente quiero ver arriba de la página las redes sociales de la tienda, dónde queda y cómo contactarla, para confiar y llegar rápido a esa información; y como dueño quiero manejar esos datos desde el panel.

**Referencia (26 oct):** franja delgada arriba de todo en sitecsas.com: íconos de redes a la izquierda y enlaces «Tiendas ▾», «Nosotros» y «Contacto» a la derecha. Se hace **con la paleta de colores de la web** (guía visual), no con el azul de la referencia.

### Web pública (frontend)

- Dada cualquier página pública, entonces hay una **franja delgada** sobre el encabezado con fondo **azul de la guía** (`#183FA5`), texto blanco y resaltado amarillo al pasar el puntero (contraste WCAG AA).
- **Izquierda — redes:** íconos redondos de **Facebook, Instagram y TikTok** (los de `/admin/configuracion › Redes sociales`), que abren en otra pestaña; una red sin enlace **no se muestra**. Cada ícono tiene nombre para lector de pantalla («Facebook de Ventas Virtual»).
- **Derecha — enlaces:**
  - **📍 Ubicación de la tienda**: muestra la dirección corta (p. ej. «Cali · CC Pasarela, local 2-107»); al pulsar abre **Google Maps** con la tienda, o despliega la dirección completa y el horario («Tiendas ▾» de la referencia).
  - **Nosotros**: lleva a `/nosotros` (HU-33); **solo aparece si esa página está publicada**.
  - **Contacto**: lleva a la sección de contacto del **pie de página** (`#contacto`), con dirección, WhatsApp y horario (decisión del dueño).
- **Orden con la cinta en movimiento (HU-24):** arriba de todo la **cinta**, debajo esta **franja**, luego el encabezado con el logo. Las dos se van con el scroll y el encabezado queda pegado arriba como hoy.
- Dado el celular, entonces la franja muestra solo los **íconos de redes**, el **📍** y **Contacto**, en una sola línea, sin scroll horizontal; «Nosotros» pasa al pie.
- Dado que la franja está apagada en el panel, entonces no se muestra y no deja espacio.
- El panel `/admin` **no** muestra la franja.

### Panel y datos (backend)

- Nueva sección **«Barra superior»** en `/admin/configuracion`: interruptor **«Mostrar barra superior»**; **texto corto de la ubicación**; **enlace de Google Maps** (opcional; si falta, se arma con la dirección registrada); casillas para mostrar **Ubicación**, **Nosotros** y **Contacto**; vista previa.
- Las redes se siguen editando en **Redes sociales** (ya existe): solo **Facebook, Instagram y TikTok** (sin YouTube ni LinkedIn, decisión del dueño).
- Se guarda en la configuración existente (`configuracion › catalogo`/`empresa`: `barra_visible`, `ubicacion_texto`, `ubicacion_mapa`), **sin tablas ni migraciones**; se valida que el enlace del mapa empiece por `https://`.

**Plan de tareas:**

| # | Tarea | Dónde |
|---|---|---|
| 1 | Campos de la barra superior con valores base y validación | `lib/configuracion.js` |
| 2 | Sección «Barra superior» del panel con vista previa | `app/admin/configuracion/page.js` |
| 3 | Componente de la franja (redes, ubicación con mapa, Nosotros, Contacto) | `app/components/BarraSuperior.js`, `app/(web)/layout.js` |
| 4 | Estilos claro/oscuro y celular; orden con la cinta | `tema-pantalla.css`, `tema-oscuro.css` |
| 5 | Pruebas en navegador (redes vacías, mapa, Nosotros oculto/visible, apagada, celular) restaurando la configuración real | `docs/sdlc/4-pruebas.md` |

**Decisiones del dueño (26 oct):** sin YouTube ni LinkedIn; «Contacto» lleva al pie de página. Orden: cinta → franja → encabezado.

---

## HU-33 · Página «Nosotros» editable desde el panel

Como dueño quiero crear y mantener desde `/admin` la página **«Nosotros»** (quiénes somos, cuántos años llevamos en el mercado, qué nos diferencia, nuestro equipo), agregando, editando y quitando sus bloques; y como cliente quiero conocer la empresa para comprar con confianza.

**Referencia (26 oct):** sitecsas.com/nosotros: título «Nosotros | Empresa», bloques de **texto a un lado y foto al otro** (p. ej. la foto del equipo), listas de preguntas que la empresa resuelve, y cifras de confianza.

### Web pública (frontend)

- Dada la dirección **`/nosotros`**, entonces se ve el **título** de la página y sus **bloques** en orden (p. ej. **biografía de la empresa** y **tiempo en el mercado**); cada bloque tiene **título**, **texto** (texto seguro: párrafos, **negrita**, listas, subtítulos) y, si tiene, una **foto** al lado, a la **izquierda o a la derecha según elija el dueño en cada bloque**.
- Dada una franja de **cifras** («+10 años en el mercado», «+5.000 equipos entregados», «Garantía en todos los equipos»), entonces se muestran como tarjetas destacadas con número grande.
- Dado el celular, entonces cada bloque va en una columna: foto arriba y texto debajo, sin scroll horizontal.
- Dada la página oculta, entonces `/nosotros` responde «no encontrada» y el enlace «Nosotros» no aparece en la barra superior (HU-32) ni en el pie.
- Fotos optimizadas desde Cloudinary (tamaño según la pantalla, carga diferida, texto alternativo obligatorio). Modo claro y oscuro con contraste WCAG AA. No se acepta HTML en los textos.

### Panel y datos (backend)

**Decisión del dueño (26 oct, al construir):** el editor va en **`/admin/configuracion › Nosotros`** (página propia `/admin/configuracion/nosotros`, con acceso desde la sección «Nosotros» de Configuración). Por eso se guarda en la tabla **`configuracion`** (clave `nosotros`), **sin tablas nuevas ni migraciones**, en lugar de reutilizar las páginas de políticas.

- En el editor: **título** de la página, interruptor **«Publicar en la web»**, y la lista de **bloques**: cada uno con **título**, **texto**, **foto** (subida a Cloudinary, carpeta `ventas-virtual/nosotros`), **texto alternativo** de la foto (obligatorio si hay foto) y **posición** (izquierda/derecha); **agregar, editar, subir, bajar y quitar** bloques (hasta 12); **vista previa** igual a la web; aviso de cambios sin guardar.
- **Cifras:** lista editable de pares *número + texto* (hasta 6), p. ej. «+10 años · en el mercado».
- Si no hay nada guardado, el editor arranca con una **plantilla sugerida** (Quiénes somos · Historia y años en el mercado · Por qué elegirnos · Nuestro equipo) **sin publicar**; nada sale a la web hasta que el dueño la publique.
- Al quitar o cambiar una foto y guardar, la anterior se **borra de Cloudinary**; las fotos subidas y no guardadas se borran al salir. La limpieza automática **no borra** fotos que use la página Nosotros.
- Límites: título 120, título de bloque 150, texto 5.000, texto alternativo 150, cifra 20 y su texto 60 caracteres. Las fotos deben ser del panel (no enlaces externos). Solo el usuario autenticado guarda (RLS).

**Decisiones del dueño (26 oct):** **solo «Nosotros»** (sin Blog); cada bloque puede llevar **foto a la izquierda o a la derecha**, elegida por el dueño, para la biografía de la empresa y el tiempo en el mercado.

---

## HU-34 · Usuarios, roles y permisos del panel

Como Superadmin quiero crear roles y definir qué puede hacer cada uno; y como quien administra el panel quiero agregar, modificar y desactivar a las personas desde `/admin/configuracion/usuarios`, para que cada quien vea y cambie solo lo suyo.

**Origen (4 nov 2026):** el panel lo usarán Dueños, Encargados de actualizar listas y catálogos, Vendedores y otros asignados. Antes las cuentas se creaban a mano en Supabase y **cualquier usuario autenticado podía escribir en todo**.

**Estado:** construida y probada; falta la aprobación del dueño. Decisión técnica: **0012**.

### Decisiones del dueño (4 nov)

1. **Superadmin** (`appsheetjm@gmail.com`, la cuenta de desarrollo): acceso total y único que crea roles y define permisos.
2. **Roles editables** con permisos por módulo. Se arranca con los de la tabla.
3. **Despacho** no se crea todavía: el Superadmin lo creará cuando exista el módulo de pedidos (Camino 2).
4. **Acceso de personas nuevas:** enlace para copiar y enviar por WhatsApp (Supabase no tiene correo configurado).
5. **Quitar acceso:** se desactiva, para conservar el historial. Solo se elimina a quien nunca entró.

### Roles iniciales (el Superadmin los puede cambiar, salvo el suyo)

| Módulo | Superadmin | Dueño | Encargado | Vendedor | Consulta |
|---|---|---|---|---|---|
| Bandeja (visitas, clics) | ✅ | ✅ | ❌ | ver | ❌ |
| Productos (listado, editar, Carga CSV) | ✅ | ✅ | ✅ | ver | ver |
| Banners | ✅ | ✅ | ✅ | ❌ | ❌ |
| Categorías | ✅ | ✅ | ✅ | ❌ | ❌ |
| Políticas y Nosotros | ✅ | ✅ | ❌ | ❌ | ❌ |
| Configuración de la tienda | ✅ | ✅ | ❌ | ❌ | ❌ |
| Usuarios | ✅ | ✅ | ❌ | ❌ | ❌ |
| Roles y permisos | ✅ | ❌ | ❌ | ❌ | ❌ |

### Panel (frontend)

- Dado quien tiene el permiso **Usuarios**, cuando entra a `/admin/configuracion/usuarios`, entonces ve la lista: nombre, correo, rol, estado (Activo, Pendiente de activar, Desactivado) y último acceso.
- Dado **Agregar usuario**, cuando escribe nombre, correo y rol, entonces se crea la cuenta sin contraseña y aparece un **enlace de acceso** para copiar o enviar por WhatsApp. Vence en 1 hora y sirve una vez.
- Dado el enlace, cuando la persona lo abre en `/activar` y escribe su contraseña dos veces (mínimo 8 caracteres), entonces entra al panel. Un enlace vencido o usado lo avisa. La vista previa de WhatsApp no lo gasta.
- Dado un usuario, entonces se puede **editar** su nombre y rol, ver su **historial**, generar otro **enlace de acceso** (también sirve si olvidó la contraseña), **desactivarlo** o **reactivarlo**, y **eliminarlo** solo si nunca entró.
- Dado el **Superadmin**, entonces ve además la pestaña **Roles y permisos**: crear, renombrar y eliminar roles (si no tienen usuarios), y elegir por módulo Sin acceso, Ver o Ver y editar. El rol Superadmin no se cambia.
- Dado el menú lateral, entonces cada rol ve **solo sus módulos**; quien no tiene Bandeja entra a su primer módulo. Una dirección no permitida muestra «Sin permiso».
- Dado un módulo con permiso **Ver**, entonces aparece el aviso «Solo consulta» y los formularios quedan deshabilitados. En Productos se conservan búsqueda y filtros, sin Nuevo producto, Carga CSV ni Migrar fotos, y el menú de cada producto solo ofrece **Ver**.
- Dado **Mi cuenta** (`/admin/cuenta`), entonces cualquier usuario activo ve su rol y cambia su contraseña. Esta opción pasó de Configuración a Mi cuenta porque todos los roles la necesitan.
- Dado un cambio de permisos, entonces rige en la siguiente acción de la persona, sin volver a entrar. Dado un usuario desactivado, entonces pierde el acceso al instante y no puede volver a entrar.
- Celular sin scroll horizontal; foco visible y etiquetas en los campos.

### Datos y seguridad (backend)

- Tablas nuevas `roles`, `rol_permisos` y `perfiles` (migración `20261104120000_usuarios_roles`, con reversa en `supabase/reversas/`).
- **RLS por permiso** en `productos`, `banners`, `categorias`, `paginas`, `configuracion` y `eventos`, con la función `panel_puede(módulo, nivel)`. Lo público (rol anon) no cambia.
- **Verificación doble:** cada ruta de `/api/admin/*` y la firma de Cloudinary (por destino) exigen el permiso; la RLS lo repite.
- **Nadie se sube el rol:** `perfiles`, `roles` y `rol_permisos` no tienen reglas de escritura; se cambian solo en el servidor con la clave secreta.
- **Reglas:** solo un Superadmin toca o asigna Superadmin; nadie cambia su propio rol ni se desactiva o elimina a sí mismo; un disparador en la base impide quedarse sin Superadmin activo.
- **Historial:** cada alta, cambio, desactivación, reactivación y enlace guarda quién, qué y cuándo (últimos 50, en `perfiles.historial`).
- **Límites:** nombre hasta 80 caracteres, rol hasta 40, descripción hasta 200; correo válido y único.
- **Copia diaria:** incluye `perfiles`, `roles`, `rol_permisos` (y `paginas`, ver BUG-1).

### Variables

`SUPABASE_SECRET_KEY` debe estar en Vercel y Hostinger, marcada como secreto. Sin ella, el módulo Usuarios avisa que falta; el resto del panel funciona.

### Plan de tareas

| # | Tarea | Dónde |
|---|---|---|
| 1 | Decisión 0012 | `docs/decisiones/` |
| 2 | Migración, reversa y usuario actual como Superadmin (OK del dueño, 4 nov) | `supabase/` |
| 3 | Permisos en el servidor y en todas las rutas | `lib/permisos.js`, `lib/modulos.js`, `lib/supabase-admin.js`, `app/api/` |
| 4 | Usuarios y roles | `lib/usuarios.js`, `app/admin/configuracion/usuarios/`, `app/api/admin/usuarios`, `app/api/admin/roles` |
| 5 | Activación y Mi cuenta | `app/activar/`, `app/admin/cuenta/` |
| 6 | Menú y modo solo consulta | `app/admin/AdminShell.js`, `app/admin/productos/page.js` |
| 7 | Prueba con usuarios QA por rol | `docs/sdlc/4-pruebas.md` |

---

## Lo que aporta el dueño

| Qué | Formato | Dónde se pone |
|---|---|---|
| Banner 1 y Banner 2 | Escritorio 1600×500 px · celular 800×800 px (opcional), JPG o WebP | `public/banners/` |
| Enlace de cada banner | Un producto, una categoría o WhatsApp | `lib/site.js` |
| Imagen por categoría | Cuadrada, 600×600 px, fondo claro | `public/categorias/` |
| Horario de atención | Texto, p. ej. "Lun a Sáb 9:00 a 6:00" | `lib/site.js` |
