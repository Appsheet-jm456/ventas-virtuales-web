# Modelo de datos

> La web no tiene base propia: lee y escribe la tabla de Baserow que comparte con InventarIA
> (decisión 0003). Este documento describe las columnas que usa. Reglas que implementa:
> [REGLAS_DEL_NEGOCIO.md](./REGLAS_DEL_NEGOCIO.md).

---

## Tabla de productos (Baserow)

| Columna | Tipo en Baserow | Uso en la web | Público |
|---|---|---|---|
| `Código` | Texto | Identifica el producto; va en la URL y en el mensaje de WhatsApp (RN-09) | Sí |
| `Categoría` | Texto | Filtro del catálogo | Sí |
| `Descripción` | Texto largo | Detalle del producto | Sí |
| `Marca` | Texto | Filtro y título | Sí |
| `Modelo` | Texto | Título | Sí |
| `Procesador` | Texto | Especificación | Sí |
| `Generación` | Texto | Especificación | Sí |
| `RAM` | Texto | Especificación | Sí |
| `Almacenamiento` | Texto | Especificación | Sí |
| `Estado` | Texto | Nuevo, Grado A, Grado B… | Sí |
| `Precio` | Número | Precio publicado (RN-07) | Sí |
| `Stock` | Número | 0 muestra **Equipo agotado** (RN-02) | Sí |
| `Foto` | Texto largo o archivo | URLs separadas por coma; Drive se convierte a enlace directo | Sí |
| `Video` | Texto largo | Enlace de Drive o YouTube | Sí |
| `Oculto` | Texto de una línea, opcional | `Sí` / `1` / `true` / `x` lo quita de la tienda (RN-03) | No |

**Columnas que no son de la web.** La tabla puede tener otras columnas de InventarIA (costo,
proveedor…). `publicRow()` en `lib/inventory.js` deja pasar **solo** las marcadas *Público* arriba
(RN-04); el resto nunca sale en `/api/products` ni en las páginas. El panel admin, con clave, sí
ve la fila completa. Si se agrega una columna nueva que el cliente deba ver, hay que sumarla a
`PUBLIC_FIELDS`.

## Flujo de datos

```
Cliente ──► Next.js (servidor) ──► Baserow API  (lectura; el token nunca llega al navegador)
Admin  ──► /api/admin + clave ──► Baserow API  (crear / editar / eliminar)
Cliente ──► botón ──► wa.me/<línea de ventas>?text=<producto>
```

## Archivos que tocan los datos

| Archivo | Qué hace |
|---|---|
| `lib/inventory.js` | Lee, crea, actualiza y borra filas; modo demo; `isHidden()`; lista blanca `publicRow()` |
| `lib/images.js` | Saca las URLs de foto y video de una fila y convierte enlaces de Drive |
| `app/api/products/route.js` | Catálogo en JSON: público sin ocultos; admin con todo |
| `app/api/admin/route.js` | Escrituras con clave; solo deja pasar columnas conocidas |

---

# Modelo v2 — Inventario, Categorías y Banners con imágenes en Cloudinary (propuesta)

> **Estado:** propuesta del 13 oct 2026, pendiente de aprobación del dueño (decisión 0007).
> Objetivo: que desde `/admin` se suban las imágenes y se administren categorías y banners sin
> tocar código. Hoy los banners y las imágenes de categoría están en `lib/site.js` y `public/`.

## Dónde vive cada cosa

```
Baserow (datos)                          Cloudinary (imágenes)
┌──────────────────────┐                 ┌──────────────────────────────────┐
│ Productos (InventarIA)│── Foto (URLs) ─►│ ventasvirtual/productos/<código>/ │
│ Categorías (nueva)    │── Imagen (URL) ►│ ventasvirtual/categorias/         │
│ Banners (nueva)       │── Imágenes ────►│ ventasvirtual/banners/            │
└──────────────────────┘                 └──────────────────────────────────┘
          ▲                                          ▲
          │ guarda la URL                            │ sube el archivo (firmado)
          └──────────────── /admin ──────────────────┘
```

**Baserow guarda datos y la URL de cada imagen; Cloudinary guarda el archivo.** La web pide la
imagen a Cloudinary ya optimizada (formato y calidad automáticos, tamaño justo).

## Tabla 1 · Productos (la de InventarIA, sin romperla)

Se conservan todas las columnas actuales. Solo cambia **qué** se guarda en `Foto`: URLs de
Cloudinary en vez de enlaces de Drive (los de Drive siguen funcionando mientras se migra).

| Columna | Tipo | Nota |
|---|---|---|
| `Código` | Texto | Identificador. Carpeta de sus fotos en Cloudinary |
| `Categoría` | Texto | **Igual que hoy**: se agrupa con *Categorías* por la palabra de `Coincide con` |
| `Marca`, `Modelo`, `Procesador`, `Generación`, `RAM`, `Almacenamiento`, `Estado`, `Descripción` | Texto | Sin cambios |
| `Precio`, `Stock` | Número | Sin cambios |
| `Foto` | Texto largo | URLs de Cloudinary separadas por coma. **La primera es la portada** |
| `Video` | Texto largo | Sin cambios (YouTube, Drive o Cloudinary) |
| `Oculto` | Texto | Sin cambios |
| `Destacado` *(nueva, opcional)* | Booleano | Si está marcado, sale primero en las líneas del Inicio |

> `Categoría` se deja como texto y no como enlace a otra tabla porque InventarIA la usa así;
> cambiar su tipo podría romperla.

## Tabla 2 · Categorías (nueva)

| Columna | Tipo | Ejemplo | Para qué |
|---|---|---|---|
| `Nombre` | Texto (principal) | Portátiles | Lo que ve el cliente |
| `Coincide con` | Texto | portatil | Palabra que agrupa las categorías de Productos: "portatil" reúne *Portátil usado* y *Portátil nuevo* |
| `Imagen` | URL | https://res.cloudinary.com/… | Imagen cuadrada 600×600 |
| `Orden` | Número | 1 | Posición en la fila del Inicio |
| `Visible` | Booleano | ✓ | Ocultarla sin borrarla |
| `Línea en el Inicio` | Booleano | ✓ | Si se muestra como fila de productos (como *Portátiles corporativos*) |
| `Título de la línea` | Texto | Portátiles corporativos | Título de esa fila |
| `Texto del botón` | Texto | Más portátiles | Botón de arriba a la derecha |

## Tabla 3 · Banners (nueva)

| Columna | Tipo | Ejemplo | Para qué |
|---|---|---|---|
| `Título` | Texto (principal) | Promo ThinkPad octubre | Nombre interno |
| `Imagen escritorio` | URL | https://res.cloudinary.com/… | 1600×500 |
| `Imagen celular` | URL | https://res.cloudinary.com/… | 800×800 (opcional) |
| `Texto alternativo` | Texto | Portátiles ThinkPad con garantía | Accesibilidad y buscadores |
| `Enlace` | Texto | /productos?categoria=portatil · wa:Hola… | A dónde lleva el clic |
| `Orden` | Número | 1 | Orden en el carrusel |
| `Activo` | Booleano | ✓ | Mostrar u ocultar |
| `Desde` · `Hasta` | Fecha (opcional) | 01/11 · 30/11 | Promos con fecha: se muestran solo en ese rango |

## Cómo sube una imagen el admin (subida firmada)

1. En `/admin` el dueño elige el archivo (foto de producto, categoría o banner).
2. El navegador pide **permiso** a `/api/admin/cloudinary` enviando la clave de admin.
3. El servidor responde con una **firma** hecha con `CLOUDINARY_API_SECRET`, que nunca sale del
   servidor.
4. El navegador sube el archivo **directo a Cloudinary** con esa firma, sin pasar por el hosting.
5. Cloudinary devuelve la URL y el admin la guarda en la fila de Baserow.

Sin la clave de admin no hay firma, y sin firma Cloudinary rechaza la subida: nadie más puede
llenar la cuenta.

## Variables nuevas (hPanel y `.env.local`, nunca en git)

| Variable | Pública | Para qué |
|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | sí | Nombre de la cuenta (va en las URLs) |
| `CLOUDINARY_API_KEY` | sí | Identifica la cuenta al subir |
| `CLOUDINARY_API_SECRET` | **no** | Firma las subidas. Solo en el servidor |
| `BASEROW_TABLE_CATEGORIAS` | no | ID de la tabla Categorías |
| `BASEROW_TABLE_BANNERS` | no | ID de la tabla Banners |

## Si una tabla nueva no existe o falla

La web sigue funcionando: usa los banners y las imágenes de categoría de `lib/site.js`, como hoy.
Así se pueden crear las tablas con calma.

## Tabla eventos (Supabase, HU-11 · decisión 0010)

Métricas de la Bandeja de entrada. El esquema vivo de todas las tablas de Supabase está en
`supabase/migrations/`.

| Columna | Qué guarda |
|---|---|
| `tipo` | `visita` (página vista) o `whatsapp` (clic en un enlace de WhatsApp) |
| `ruta` | La página, sin parámetros |
| `producto` | Código del producto, solo en clics de «Estoy interesado» |
| `creado_en` | Hora del servidor |

Sin IP, cookies ni datos del navegador. El público solo inserta; lee el administrador.
