# Historial del proyecto

> Versiones del brief y cambios que las motivaron.
> El detalle técnico está en `git log`; aquí va lo que le importa a alguien que no lee código.

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
