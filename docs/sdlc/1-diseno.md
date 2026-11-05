# Fase 1 · Diseño

**Estado:** 🟡 En curso · **Abierta:** 12 oct 2026

> Define **qué** se construye, **para quién** y **cómo** está armado. El código v1 ya existe:
> esta fase lo documenta, lo valida con el dueño y deja escritas las reglas.

## Criterio de cierre

- [x] Brief escrito: problema, usuarios, alcance, métricas y riesgos — [00-BRIEF.md](../00-BRIEF.md)
- [x] Reglas del negocio escritas — [REGLAS_DEL_NEGOCIO.md](../REGLAS_DEL_NEGOCIO.md)
- [x] Modelo de datos documentado — [notion_modelado_datos.md](../notion_modelado_datos.md)
- [x] Método de trabajo: git manda, Notion es el espejo (decisión 0001)
- [x] División en dos caminos: landing ahora, tienda completa después (decisión 0005)
- [x] Hosting decidido: Hostinger Web Apps (decisión 0006)
- [ ] Preguntas abiertas del Camino 1 respondidas por el dueño (dominio, quién actualiza Baserow, admin)
- [ ] Rediseño del frontend aprobado por el dueño
- [ ] Reglas del negocio validadas por el dueño
- [x] La API pública solo expone columnas de venta (RN-04, lista blanca)

---

## Arquitectura

```
┌──────────────┐     ┌───────────────────────────┐     ┌──────────────────┐
│  Navegador   │────►│  Next.js 14 (servidor)    │────►│  Baserow API     │
│  cliente     │     │  · páginas (SSR)          │     │  tabla InventarIA│
│  admin       │     │  · /api/products          │     └──────────────────┘
└──────┬───────┘     │  · /api/admin  (clave)    │
       │             └───────────────────────────┘
       └──► wa.me/<línea de ventas>?text=<producto>
```

- **Sin base propia**: Baserow es la fuente de verdad (decisión 0003).
- **El token de Baserow solo vive en el servidor**: el navegador nunca lo ve.
- **Modo demo**: sin credenciales la app arranca con tres productos de ejemplo, para desarrollo.
- **Escrituras solo por `/api/admin`** con la clave en el header `x-admin-password`.

## Estructura del código

| Ruta | Qué es |
|---|---|
| `app/page.js` | Inicio: hero y catálogo con filtros |
| `app/producto/[codigo]/page.js` | Detalle: galería, especificaciones, botón WhatsApp |
| `app/admin/` | Panel de administración: `AdminShell.js` (acceso y panel lateral), `layout.js` y una carpeta por módulo (`productos/`, `banners/`…) |
| `app/(web)/` | Páginas públicas con el encabezado y pie de la web (`layout.js`); `/admin` no lo usa |
| `app/api/products/route.js` | Catálogo en JSON |
| `app/api/admin/route.js` | Escrituras protegidas |
| `app/components/` | Catalog, Gallery, Brand |
| `lib/inventory.js` · `lib/images.js` · `lib/site.js` | Datos, imágenes, datos de la empresa |

> El contenido de marca (Quiénes somos, políticas) y el diseño de la tienda completa pertenecen al
> **Camino 2** y se trabajan en su propia planificación.
