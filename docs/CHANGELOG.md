# Historial del proyecto

> Versiones del brief y cambios que las motivaron.
> El detalle técnico está en `git log`; aquí va lo que le importa a alguien que no lee código.

---

## 4 nov 2026 · Usuarios, roles y permisos del panel (HU-34)

El panel ahora tiene usuarios con rol. El Superadmin crea roles y define qué puede cada uno; se agregan personas con un enlace de activación por WhatsApp, y cada quien ve solo sus módulos. Se cierra el hueco por el que cualquier cuenta del panel podía cambiar todo. La copia diaria ahora incluye las políticas y los usuarios (BUG-1). Aprobada por el dueño el 4 nov.

---

## 27 oct 2026 · Flujo de desarrollo y EDT

Se documenta cómo se trabaja cada mejora o bug: registrar, documentar, implementar, probar, aprobar y cerrar, con `tareas.csv` como fuente de verdad, Notion como tablero y una EDT en Google Sheets como mapa del proyecto (6 fases, 77 tareas, con avance por fase). Los bugs se registran como `BUG-n` con su nivel, y uno Crítico o Alto abierto bloquea la salida en línea. Nuevo `docs/FLUJO_DESARROLLO.md`, regla en `CLAUDE.md` y el generador `docs/notion/edt_generar.py`. Sin cambio de versión del brief.

---

## 26 oct 2026 · Página «Nosotros» editable (HU-33)

Nueva página `/nosotros` con la biografía de la empresa, los años en el mercado y lo que la diferencia: bloques de texto con foto a la izquierda o a la derecha y una franja de cifras destacadas. Se edita en `/admin/configuracion › Nosotros` (agregar, editar, reordenar y quitar bloques, subir fotos, cifras y vista previa) y arranca con una estructura sugerida sin publicar. Al publicarla aparece «Nosotros» en la barra superior y en el pie. Se guarda en la configuración existente: sin tablas nuevas ni migraciones. Sin cambio de versión del brief.

---

## 26 oct 2026 · Barra de categorías en el menú (HU-31)

El menú oscuro ahora muestra directamente las categorías: «☰ Todas las categorías» (abre la lista completa con foto y cuántos productos tiene cada una), cada categoría visible de `/admin/categorias` en mayúsculas, «Más ▾» con las que no caben y «Todos». Reemplaza el desplegable de «Productos» (HU-25); «Inicio» se alcanza con el logo y «Contacto» quedó en la barra superior. En el celular las categorías se deslizan y «☰ Categorías» abre la lista a pantalla completa. Sin migraciones ni cambio de versión del brief.

---

## 26 oct 2026 · Barra superior con redes, ubicación y Contacto (HU-32)

Debajo de la cinta en movimiento aparece una franja delgada en el azul de la guía: a la izquierda los íconos de Facebook, Instagram y TikTok; a la derecha «📍 ubicación de la tienda» (abre Google Maps), «Nosotros» (cuando exista esa página) y «Contacto» (lleva al pie). Se maneja en `/admin/configuracion › Barra superior` con vista previa; las redes, en «Redes sociales». En el celular cabe en una línea. Sin migraciones ni cambio de versión del brief.

---

## 26 oct 2026 · Productos sugeridos y vistos recientemente (HU-30)

Al final de la página de cada equipo, antes del pie, aparece la fila **«Te pueden interesar»** con hasta 12 equipos parecidos (misma categoría, marca, precio y generación cercanos; los disponibles primero) y, si el visitante ya revisó otros, la fila **«Vistos recientemente»**. Se ven 4 tarjetas con flechas para ver más (en el celular se deslizan con el dedo). El historial de vistos se guarda solo en el navegador del visitante, sin cookies ni datos personales, y se puede borrar. Las flechas de las filas de la web ahora solo aparecen cuando hay algo que ver. Sin migraciones ni cambio de versión del brief.

---

## 26 oct 2026 · Páginas de políticas editables (HU-26)

Nuevo módulo **Políticas** en el panel para crear, editar, ordenar, ocultar y quitar páginas como Garantía, Devolución, Envíos, Términos y condiciones y Privacidad, cada una con sus secciones. En la web se ven en `/politicas/<nombre>` con un índice numerado a la izquierda, un buscador dentro de la página y las secciones en acordeón «+» o en texto corrido (se elige por página); en el celular el índice es un desplegable «Contenido». Las páginas visibles aparecen en una columna **Soporte** del pie. Se cargaron cinco **borradores ocultos** para revisar con un asesor antes de publicarlos. Tabla nueva `paginas` (decisión 0011). Sin cambio de versión del brief.

---

## 26 oct 2026 · Filtro dinámico en Productos (HU-28)

El catálogo tiene un panel de filtros a la izquierda: Tipo (categoría), Marca, Modelo, Procesador, Precio mínimo y máximo, Táctil y Solo disponibles. Las opciones salen de los productos publicados y muestran cuántos hay; al elegir una, las demás solo ofrecen lo que todavía tiene resultados. Nada cambia hasta pulsar **Aplicar**, que anticipa cuántos equipos coinciden; los filtros quedan en la dirección para compartirlos. En el celular se abren con el botón «Filtros». Si nada coincide, ofrece limpiar o escribir por WhatsApp. Nuevo dato del producto **Pantalla táctil** (casilla en el panel y columna en el CSV; migración del 26 oct). El Tipo del panel reemplaza los botones de categoría del listado. Sin cambio de versión del brief.

---

## 26 oct 2026 · Descripción ampliada del producto (HU-29)

La página del equipo arranca con una insignia del estado («Grado B», «Usado en buen estado»…), el nombre, un resumen destacado con barra azul y una fila de datos clave con íconos (procesador, RAM, almacenamiento y pantalla). Debajo de las fotos aparece el bloque «Descripción» con su título y un texto largo con párrafos, negritas, subtítulos y listas, antes de la ficha técnica. Se escribe en `/admin/productos` con botones Negrita, Lista y Subtítulo y vista previa, o por CSV. Por seguridad no se acepta HTML: se muestra como texto. Nuevas columnas en Supabase (migración del 26 oct). **Ajuste del mismo día:** debajo de las fotos la Descripción va a la izquierda y la tarjeta «Especificaciones» (la ficha técnica, con un ícono por característica) a la derecha, en proporción 60/40, y el título de la descripción se ve grande y en mayúsculas; en celular se apilan. El resumen y la fila de íconos pasan a una caja debajo de las fotos, para llenar ese espacio y aligerar la columna del precio. Sin cambio de versión del brief.

---

## 26 oct 2026 · Ficha técnica completa del producto (HU-27)

La página de cada equipo muestra, debajo de las fotos y del botón de WhatsApp, una tabla «Ficha técnica completa» (Característica → Valor, filas alternadas) con todos los datos que el dueño quiera. Se carga en `/admin/productos` al crear o editar: agregar, ordenar y quitar filas, plantilla de portátil, copiar la ficha de otro producto y vista previa; también por la carga CSV con la columna opcional **Ficha**. Sin ficha, el bloque no aparece. Nueva columna `ficha` en Supabase (migración del 26 oct). Sin cambio de versión del brief.

---

## 26 oct 2026 · Categorías en el menú «Productos» (HU-25)

Al pasar el puntero sobre «Productos» en el menú (o tocar su flecha en el celular) se despliegan «Todos los productos» y las categorías que el dueño maneja en `/admin/categorias`; al elegir una, el catálogo muestra solo esos equipos, con el nombre de la categoría como título y una dirección que se puede compartir por WhatsApp. Los botones de categoría del listado usan ahora esas mismas categorías. Se maneja también con el teclado. Sin cambio de versión del brief.

---

## 26 oct 2026 · Cinta en movimiento (HU-24)

Encima del encabezado hay una franja delgada con un mensaje amarillo que se desplaza de derecha a izquierda («Ventas Virtual Colombia · Equipos portátiles corporativos» por defecto). Se detiene al pasar el puntero y queda quieta para quien pidió reducir el movimiento en su equipo. El dueño cambia el mensaje o la apaga en `/admin/configuracion › Cinta`, con vista previa. Sin cambio de versión del brief.

---

## 22 oct 2026 · Interruptor de modo claro y oscuro (HU-22)

En `/admin/configuracion` hay una sección nueva, **Apariencia**, con el interruptor **Modo oscuro**: apagado, la web se ve en modo claro (encabezado y pie azules con la constelación, contenido en blanco); encendido, toda la web en el azul de la pantalla del logo. Muestra una miniatura de cada modo y marca el que está en uso. El panel no cambia. Sin cambio de versión del brief.

---

## 22 oct 2026 · La web pública en «modo pantalla» (HU-21)

La web toma la identidad del logo: el encabezado y el pie son la pantalla del monitor, azul noche con su constelación de luces, y el contenido del medio queda en blanco (ajuste del dueño, guía v1.1); los banners y el panel de portátiles son piezas oscuras con la constelación; el amarillo del marco para los botones, precios en azul noche; letras Montserrat y Inter. Logos nuevos para fondo oscuro (horizontal, vertical, ícono de la pestaña e imagen para compartir en redes) y banners temporales rehechos con la misma línea. El panel de administración no cambia. Guía visual v1.0 en `docs/diseno/guia-visual.md`. Sin cambio de versión del brief.

---

## 21 oct 2026 · Tabla de productos por páginas (HU-20)

El listado muestra 20 productos por página, con páginas numeradas (1, 2, 3, 4…) y botones Anterior y Siguiente. El selector **Ver** permite 20, 25, 50, 100 o Todos. Debajo de la tabla se lee qué se está viendo («Mostrando 21–40 de 134 productos»). La página y el tamaño se conservan al ir a editar y volver. Sin cambio de versión del brief.

---

## 21 oct 2026 · Listado de productos con Código y filtros (HU-19)

La tabla de productos empieza ahora por el Código. A la izquierda hay un panel de filtros por Modelo, RAM, Procesador, Generación y rango de precio; las listas salen de los productos cargados, muestran cuántos hay de cada uno y se van acotando según lo que se elige. Los filtros se conservan al ir a editar y volver. En celular el panel se abre con el botón Filtros. Sin cambio de versión del brief.

---

## 21 oct 2026 · Editar producto en pantalla completa (HU-18)

Crear y editar un producto ya no abre una ventana angosta: abre su propia página, con los datos en secciones (Información general, Especificaciones, Fotos y video) y a la derecha el estado en la tienda, el precio y el stock. Una barra fija abajo muestra si hay cambios sin guardar y los botones Guardar y Cancelar. Sin cambio de versión del brief.

---

## 21 oct 2026 · Fotos de productos en Cloudinary (HU-17)

En el formulario de producto ahora se suben las fotos desde el computador (varias a la vez, con portada y opción de quitar) y se guardan en Cloudinary, en la carpeta del producto. Hay una pestaña nueva, **Migrar fotos**, que copia a Cloudinary las fotos que hoy son enlaces de Drive y avisa cuáles no pudo leer. Los videos siguen igual. Sin cambio de versión del brief.

---

## 21 oct 2026 · Tablero de tareas reordenado

Las tareas del panel nuevo pasan a llamarse «HU-11 ...» a «HU-15 ...» (el código de la historia primero) y siguen como tareas de Implementación. Se quitó «Actualizar la lista de productos en Baserow»; se agregó la migración de fotos de productos a Cloudinary y un marcador HU-16 para las mejoras de frontend y estilo que entregará el dueño. Sin cambio de versión del brief.

---

## 19 oct 2026 · Planeado el nuevo panel de administración

`/admin` pasará de una sola página a un panel lateral izquierdo que se pliega a iconos, con cinco
módulos: Bandeja de entrada (métricas), Productos (con la carga CSV), Banners e imágenes,
Categorías y Configuración. Quedó la maqueta navegable y las historias HU-10 a HU-15. El mismo día se programó el
panel lateral (HU-10): se abre y se pliega a iconos, y cada módulo tiene su propia dirección.
Después se rehízo Productos (HU-12): pestañas Listado y Carga CSV, filtros por agotados, ocultos
y sin foto, un menú Acciones por fila, confirmación antes de eliminar y una plantilla CSV para
descargar. Luego Categorías (HU-14): se crean, editan, ordenan, ocultan y quitan desde el panel,
y la web ya las toma de ahí; quitar una categoría no toca sus productos. Por último Configuración (HU-15): nombre, lema,
dirección, WhatsApp y su mensaje, redes, horario y si se muestran agotados y precios se cambian
desde el panel, y la web los toma de ahí; también se puede cambiar la contraseña. Y la Bandeja de entrada (HU-11): visitas, clics a
WhatsApp, productos más consultados y lo que conviene revisar, medidos en la propia base sin
cookies ni datos personales (decisión 0010). Cierra Banners e imágenes (HU-13): banners de la
portada, imagen de cada categoría y logo se suben a Cloudinary desde el panel (decisión 0007,
ahora aceptada) y la web los toma de ahí. Con esto el panel nuevo queda completo. En Vercel se agregaron las variables de Supabase. Sin cambio de versión del brief.

---

## 16 oct 2026 · La web lee y se administra desde Supabase

El catálogo ya sale de Supabase en vez de Baserow (decisión 0009). El panel `/admin` pide correo
y contraseña, y permite cargar un CSV con vista previa antes de guardar. El registro público quedó
desactivado: solo entra quien el dueño cree. Sin cambio de versión del brief.

---

## Brief v1.3 — 14 oct 2026 · La tienda completa tiene repo propio

El Camino 2 deja de ser una promesa dentro de este repo: se construye en
`Appsheet-jm456/ventas-virtual-eccomer-web`, que nace con el método completo de Futur Green y el
CRM (decisión 0008). Este repo se concentra en terminar y publicar la landing.

---

## Brief v1.2 — 13 oct 2026 · Dos caminos: la landing ahora, la tienda completa después

**La landing sale primero.** El dueño aclaró el plan: la landing que ya está en Vercel se mejora
y se pasa a **Hostinger con el dominio propio**, mientras la tienda completa (administración,
inventarios, categorías, configuración, pedidos y ecommerce) se sigue planificando. El pago en
línea y el flujo de pedido quedan por ahora fuera (decisión 0005).

En la landing: **nuevo diseño** (portada, franja de confianza con garantía, envíos nacionales,
tienda física y asesoría, tarjetas de producto, banda de contacto y mejor versión celular) y el
público **ya no puede ver columnas internas** de Baserow como costo o proveedor.

---

## Brief v1.1 — 12 oct 2026 · Marca, políticas y ecommerce

**El objetivo creció y ahora está mapeado.** La web deja de ser solo un catálogo: debe posicionar
la marca (quiénes somos, especialidad Tech), publicar las políticas (privacidad, envíos, garantía,
términos y condiciones) y, más adelante, vender y cobrar en línea con un flujo de pedido de siete
pasos hasta el despacho.

Para no abrumar el trabajo se propone dividirlo en **dos etapas**: primero marca y catálogo con
cierre por WhatsApp, después el ecommerce (decisión 0005, por confirmar). El brief trae ahora un
**mapa de la web** con cada página, su etapa y su estado.

---

## Brief v1.0 — 12 oct 2026 · El proyecto toma estructura

**La tienda ya funcionaba, pero sin documentación.** Se adopta el método de Futur Green: brief,
reglas del negocio, modelo de datos, decisiones y cinco fases (Diseño, Especificaciones,
Implementación, Pruebas y Despliegue). Git guarda la versión buena y Notion es el espejo para
leer, comentar y llevar el tablero de tareas.

Al documentar salió un riesgo: la API pública del catálogo devuelve todas las columnas de
Baserow, incluidas las que podrían ser internas de InventarIA.
