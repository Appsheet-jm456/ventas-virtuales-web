# 📌 Dónde retomar

> **Última sesión:** 21 de octubre de 2026 · Brief `v1.3` · **Camino 1 (landing)** · panel nuevo completo (HU-07 a HU-15) en la rama `claude/determined-ramanujan-i61gup`, probado y visible en el Preview de Vercel
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

## ⏭️ Siguiente (Camino 1 · landing): llevarla a Hostinger

Guía completa en [sdlc/5-despliegue.md](./sdlc/5-despliegue.md). En orden:

1. **Cargar los productos reales** (dueño): exportar el CSV del inventario y subirlo en
   `/admin/productos › Carga CSV`. Hoy la tabla `productos` de Supabase está vacía.
2. **Subir banners e imágenes reales** en `/admin/banners` (opcional: hay respaldo).
3. **Cambiar la contraseña de pruebas** (`Admin123*`) en `/admin/configuracion › Cuenta`.
4. **Publicar en `main`**: Pull Request de `claude/determined-ramanujan-i61gup` hacia
   `claude/github-upload-iteration-cgbvq9` (la rama por defecto) y renombrar esta a `main`.
5. **Hostinger Web Apps**: conectar GitHub (`main`), Node 20, las seis variables, desplegar y
   verificar en la URL temporal.
6. **Dominio y SSL**; `NEXT_PUBLIC_SITE_URL` con el dominio (falta saber cuál es) y redesplegar.
7. **Apagar Vercel** y **revocar el token de Baserow** que quedó guardado allá.

Después del despliegue:
- Recuperación de contraseña por correo (tarea en Notion).
- **HU-17 Fotos de productos en Cloudinary**: hecha y probada por el dueño el 21 oct; falta migrar las fotos reales cuando se cargue el CSV.
- **HU-18 Editar producto en pantalla completa**: hecha y aprobada por el dueño el 21 oct.
- **HU-19 Columna Código y filtros del listado**: construida y probada en navegador el 21 oct; falta el visto bueno del dueño.
- **HU-20 Tamaño de la tabla y paginación**: construida y probada en navegador el 21 oct; falta el visto bueno del dueño.
- **HU-16 Mejoras de frontend y estilo**: el dueño entrega las mejoras y se documentan como
  HU-16, HU-17, HU-18... en el orden en que deban ejecutarse (historia y criterios antes del código).
- Pruebas automáticas (Fase 4): hoy hay pruebas en navegador documentadas en `sdlc/4-pruebas.md`.
- Opcional: traer `.env.example` y `.nvmrc` de la rama `claude/nice-edison-vreamn`.

## ✅ Hecho el 19 oct (panel nuevo)

| Historia | Qué | Dónde |
|---|---|---|
| HU-10 | Panel lateral plegable, cinco módulos con dirección propia | `app/admin/AdminShell.js` |
| HU-11 | Bandeja: visitas, clics a WhatsApp, más consultados, para revisar (decisión 0010) | `app/admin/page.js`, tabla `eventos` |
| HU-12 | Productos: pestañas Listado y Carga CSV, filtros, menú Acciones | `app/admin/productos/` |
| HU-13 | Banners, imagen por categoría y logo en Cloudinary (decisión 0007) | `app/admin/banners/` |
| HU-14 | Categorías por palabra que agrupa; la web las lee de Supabase | `app/admin/categorias/` |
| HU-15 | Configuración de la tienda y cambio de contraseña | `app/admin/configuracion/` |

Vercel tiene las variables de Supabase y Cloudinary. Notion al día con git.

## 🗺️ Camino 2 · Tienda completa → repo `ventas-virtual-eccomer-web` (decisión 0008)

Administración, inventarios, categorías, configuración, pedidos y marca (Quiénes somos,
políticas). El ecommerce con pago en línea queda **por ahora fuera**. No se programa hasta
terminar el Camino 1.
