# 📌 Dónde retomar

> **Última sesión:** 12 de octubre de 2026 · Brief `v1.2` · **Camino 1 (landing) · Fase 5 — Despliegue**
> Entorno: [ENTORNO_LOCAL.md](./ENTORNO_LOCAL.md) · Fases: [sdlc/](./sdlc/) · Tareas: [notion/tareas.csv](./notion/tareas.csv)

---

## ✅ Hecho

| Pieza | Dónde |
|---|---|
| Brief v1.2 (dos caminos: landing y tienda completa) | `docs/00-BRIEF.md` |
| Reglas del negocio RN-01 a RN-18 | `docs/REGLAS_DEL_NEGOCIO.md` |
| Modelo de datos (tabla de Baserow) | `docs/notion_modelado_datos.md` |
| Decisiones 0001 a 0006 | `docs/decisiones/` |
| Espejo en Notion: script y CSV | `docs/notion/` |
| Rediseño del frontend de la landing | `app/`, `app/globals.css` |
| Lista blanca de columnas públicas (RN-04) | `lib/inventory.js` |
| Guía de despliegue en Hostinger | `docs/sdlc/5-despliegue.md` |

## ⏭️ Siguiente (Camino 1 · landing)

1. El dueño revisa el demo del nuevo diseño (Inicio, Categorías, Productos — HU-01 a HU-06) y envía las imágenes reales (2 banners y una por categoría, ver `docs/sdlc/2-especificaciones.md`).
2. Fusionar el [PR #1](https://github.com/Appsheet-jm456/ventas-virtuales-web/pull/1).
3. El dueño **actualiza los productos en Baserow** (están desactualizados).
4. Desplegar en Hostinger Web Apps siguiendo [sdlc/5-despliegue.md](./sdlc/5-despliegue.md).
5. Asociar el dominio y apagar Vercel.

## 🗺️ Camino 2 · Tienda completa (se planifica en Notion)

Administración, inventarios, categorías, configuración, pedidos y marca (Quiénes somos,
políticas). El ecommerce con pago en línea queda **por ahora fuera**. No se programa hasta
terminar el Camino 1.
