# 📌 Dónde retomar

> **Última sesión:** 12 de octubre de 2026 · Brief `v1.0` · **Fase 1 — Diseño**
> Entorno: [ENTORNO_LOCAL.md](./ENTORNO_LOCAL.md) · Fases: [sdlc/](./sdlc/) · Tareas: [notion/tareas.csv](./notion/tareas.csv)

---

## ✅ Hecho

| Pieza | Dónde |
|---|---|
| Brief v1.0 | `docs/00-BRIEF.md` |
| Reglas del negocio RN-01 a RN-10 | `docs/REGLAS_DEL_NEGOCIO.md` |
| Modelo de datos (tabla de Baserow) | `docs/notion_modelado_datos.md` |
| Decisiones 0001 a 0004 | `docs/decisiones/` |
| Espejo en Notion: script y CSV | `docs/notion/` |

## ⏭️ Siguiente

1. El dueño responde las preguntas abiertas del brief.
2. Revisar las columnas reales de Baserow y qué expone `/api/products` (RN-04).
3. Decidir el hosting destino → decisión 0005.
4. Validar las reglas del negocio y cerrar la Fase 1.

## ⚠️ Riesgo abierto

`/api/products` devuelve **todas** las columnas de la tabla de Baserow. Si InventarIA guarda
costo o proveedor, se ven desde internet. Se corrige con una lista blanca de columnas (Fase 3),
pero primero hay que ver qué columnas tiene la tabla real.
