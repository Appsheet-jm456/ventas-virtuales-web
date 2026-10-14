# 📌 Dónde retomar

> **Última sesión:** 13 de octubre de 2026 · Brief `v1.3` · **Camino 1 (landing)** · nuevo diseño publicado en Vercel (PR #1 fusionado) · modelo v2 con Cloudinary propuesto
> Entorno: [ENTORNO_LOCAL.md](./ENTORNO_LOCAL.md) · Fases: [sdlc/](./sdlc/) · Tareas: [notion/tareas.csv](./notion/tareas.csv)

---

## ✅ Hecho

| Pieza | Dónde |
|---|---|
| Brief v1.2 (dos caminos: landing y tienda completa) | `docs/00-BRIEF.md` |
| Reglas del negocio RN-01 a RN-18 | `docs/REGLAS_DEL_NEGOCIO.md` |
| Modelo de datos (tabla de Baserow) | `docs/notion_modelado_datos.md` |
| Decisiones 0001 a 0008 | `docs/decisiones/` |
| Espejo en Notion: script y CSV | `docs/notion/` |
| Rediseño del frontend de la landing | `app/`, `app/globals.css` |
| Lista blanca de columnas públicas (RN-04) | `lib/inventory.js` |
| Guía de despliegue en Hostinger | `docs/sdlc/5-despliegue.md` |
| Nuevo diseño: Inicio, Categorías, Productos (HU-01 a HU-06), publicado en Vercel | PR #1 |
| Modelo v2 propuesto y plantillas de Baserow | `docs/notion_modelado_datos.md`, `docs/baserow/` |

## ⏭️ Siguiente (Camino 1 · landing)

0. **PRIORITARIA · Notion:** crear la página «Página Web landing Ventas Virtual» con un brief
   nuevo (desde el v1.3 de git + Supabase, decisión 0009) y la misma estructura SDLC (Brief, Fases,
   Tareas, Decisiones). Notion hoy tiene brief v1.0 y 13 de 30 tareas. Antes: decidir qué hacer con
   las 5 tareas que solo existen en Notion. La copia del brief requiere autorización del dueño.

1. **Seguridad:** revocar en Baserow el token que se compartió en la conversación del 13 oct y
   crear uno nuevo (Leer, Crear, Actualizar, Eliminar). Cargarlo en Vercel, Hostinger y `.env.local`.
2. **Aprobar el modelo v2** (Categorías, Banners, imágenes en Cloudinary — decisión 0007) y crear
   las dos tablas importando `docs/baserow/*.csv` (guía en `docs/baserow/COMO_IMPORTAR.md`).
   Pasar los ID de las tablas.
3. Programar: lectura de Categorías y Banners desde Baserow y subida firmada a Cloudinary desde `/admin`.
4. Imágenes reales: 2 banners y una por categoría (ver `docs/sdlc/2-especificaciones.md`).
5. Revisar por qué los productos reales salen sin foto (columna `Foto` vacía o Drive sin compartir).
6. Renombrar la rama por defecto `claude/github-upload-iteration-cgbvq9` a `main` (o usar ese nombre
   en Hostinger) y corregir la guía de despliegue.
7. Desplegar en Hostinger Web Apps y asociar el dominio ([sdlc/5-despliegue.md](./sdlc/5-despliegue.md)); apagar Vercel.
8. **Supabase Cloud (decisión 0009):** ✅ proyecto creado y migraciones aplicadas por el MCP el
   14 oct (`supabase/migrations/`): `productos`, `categorias`, `banners`, `configuracion` con RLS
   (anon lee solo lo activo/visible; escribe solo `authenticated`), 4 categorías, 2 banners y los
   datos de la empresa. **Falta:** desactivar el registro público en Supabase Auth y crear el
   usuario del dueño (con RLS actual, cualquier usuario autenticado escribe); exportar el CSV de
   productos de Baserow para la carga inicial; `/admin` con panel lateral y carga CSV; pasar
   `lib/inventory.js` a Supabase. Web e InventarIA quedan separadas.
9. Opcional: traer `.env.example` y `.nvmrc` de la rama `claude/nice-edison-vreamn`.

## 🗺️ Camino 2 · Tienda completa → repo `ventas-virtual-eccomer-web` (decisión 0008)

Administración, inventarios, categorías, configuración, pedidos y marca (Quiénes somos,
políticas). El ecommerce con pago en línea queda **por ahora fuera**. No se programa hasta
terminar el Camino 1.
