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

## Lo que aporta el dueño

| Qué | Formato | Dónde se pone |
|---|---|---|
| Banner 1 y Banner 2 | Escritorio 1600×500 px · celular 800×800 px (opcional), JPG o WebP | `public/banners/` |
| Enlace de cada banner | Un producto, una categoría o WhatsApp | `lib/site.js` |
| Imagen por categoría | Cuadrada, 600×600 px, fondo claro | `public/categorias/` |
| Horario de atención | Texto, p. ej. "Lun a Sáb 9:00 a 6:00" | `lib/site.js` |
