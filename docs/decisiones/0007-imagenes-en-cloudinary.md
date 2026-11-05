# 0007 · Imágenes en Cloudinary, administradas desde /admin

**Estado:** Aceptada · 19 oct 2026 (propuesta el 13 oct) · Ajustada por la 0009: la URL se guarda en Supabase, no en Baserow

## Contexto

Las fotos de los productos son enlaces de Google Drive: hay que compartirlas una por una, cargan
lento y a veces no cargan. Los banners y las imágenes de categoría viven en el código
(`public/` y `lib/site.js`): cambiarlos exige un despliegue. El dueño quiere subirlas desde
`/admin` y tiene una cuenta de Cloudinary.

## Decisión propuesta

- Las imágenes (productos, categorías y banners) se guardan en **Cloudinary**; Baserow guarda
  solo la URL (modelo v2 en `notion_modelado_datos.md`).
- Dos tablas nuevas en Baserow: **Categorías** y **Banners**. La tabla de productos de
  InventarIA no cambia de estructura.
- Subida **firmada** desde `/admin`: el secreto de Cloudinary solo vive en el servidor
  (decisión 0002).
- La web pide las imágenes con optimización automática de formato y calidad.

## Alternativas descartadas

**Seguir con Google Drive** — lento, sin optimización y depende de compartir cada archivo.

**Campo de archivos de Baserow** — no optimiza las imágenes y el espacio cuenta contra el plan
de Baserow.

**Subida sin firma (preset abierto)** — cualquiera que lo descubra podría subir archivos a la
cuenta.

## Consecuencias

- El plan gratuito de Cloudinary reparte sus créditos mensuales entre almacenamiento, tráfico y
  transformaciones: no son 25 GB solo de almacenamiento. Hay que vigilar el consumo en su panel.
- Migrar las fotos de Drive a Cloudinary es un trabajo aparte; mientras tanto conviven las dos.

## Cómo quedó (19 oct 2026, HU-13)

- Cuenta del dueño, plan Free, con una llave propia para la web (**ApiWeb**), no la *Root*.
- El panel sube banners, imágenes de categoría y el logo a la carpeta `ventas-virtual/` con una
  **firma** que da `/api/admin/cloudinary` (`lib/cloudinary.js`); el API Secret solo vive en el
  servidor. La firma fija la carpeta y los formatos aceptados.
- Antes de subir, el navegador revisa formato, peso y tamaño (banners 16:5 y al menos 1200 px).
- Las imágenes reemplazadas, quitadas o subidas y no guardadas se **borran de Cloudinary**; el
  servidor nunca borra una que esté en uso.
- La web las pide con formato y calidad automáticos y su tamaño (`lib/cdn.js`); las categorías se
  recortan cuadradas centrando lo importante.
- Las fotos de productos siguen en Google Drive: migrarlas es otra tarea.
