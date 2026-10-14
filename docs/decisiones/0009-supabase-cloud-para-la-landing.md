# 0009 · Supabase Cloud como fuente de datos de la landing

**Estado:** Aceptada · 14 oct 2026 · Reemplaza a la [0003](./0003-baserow-como-unica-fuente.md)

## Contexto

La landing leía el inventario de la tabla de Baserow compartida con InventarIA. El dueño quiere
gestionar productos, categorías, banners y configuración desde un `/admin` propio, con carga por
CSV e imágenes en Cloudinary (0007). Compartir la tabla con InventarIA acopla la web a otro
sistema y obliga a un panel encima de otro. La web corre en Hostinger, no en el servidor del
negocio, así que la base debe estar siempre en línea.

## Decisión

- La fuente de datos de la landing es **Supabase Cloud** (plan gratuito): tablas `productos`,
  `categorias`, `banners` y `configuracion`.
- El público solo lee lo activo y de venta, mediante RLS: costo, proveedor y notas internas no
  existen en estas tablas (RN-04).
- El esquema vive en git, en `supabase/migrations/`, una migración por cambio; no se cambian
  tablas a mano en el panel. El MCP de Supabase, limitado a este proyecto, aplica las migraciones.
- `/admin` con panel lateral plegable (Productos, Categorías, Banners, Configuración), login con
  Supabase Auth, carga de productos por **CSV** y subida de imágenes a Cloudinary.
- **La web y InventarIA quedan separadas** (confirmado por el dueño el 14 oct 2026): no hay
  sincronización automática. Todo se hace desde `/admin`: crear, editar, desactivar o eliminar
  productos uno a uno, y **cargar un CSV** cuando hay inventario nuevo o modificaciones.
- **Reglas de la carga CSV:** se identifica cada producto por su código; si existe se
  actualiza y si no, se crea. Los productos que no vienen en el archivo **no se tocan ni se
  borran**. Antes de aplicar, `/admin` muestra una vista previa (nuevos, modificados, con
  errores). La carga inicial sale de un CSV exportado de Baserow.

## Alternativas descartadas

**Seguir con Baserow** — acopla la web a InventarIA y no ofrece login ni permisos propios.

**Supabase propio en el servidor** — la web en Hostinger dependería de que el servidor y su
internet estén arriba, y habría que exponerlo.

## Consecuencias

- El plan gratuito pausa el proyecto tras 7 días sin actividad y no incluye copias automáticas:
  exportar copias periódicas y revisar la pausa antes de publicar.
- Si más adelante repetir la carga pesa demasiado, se puede agregar una sincronización con
  Baserow sin cambiar el modelo.
- El ecommerce decide su propia base (decisión 0003 de su repo).
