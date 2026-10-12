# 📌 Dónde retomar

> **Última sesión:** 12 de octubre de 2026 · Brief `v1.1` · **Fase 1 — Diseño**
> Entorno: [ENTORNO_LOCAL.md](./ENTORNO_LOCAL.md) · Fases: [sdlc/](./sdlc/) · Tareas: [notion/tareas.csv](./notion/tareas.csv)

---

## ✅ Hecho

| Pieza | Dónde |
|---|---|
| Brief v1.1 (marca, políticas y ecommerce en dos etapas) | `docs/00-BRIEF.md` |
| Reglas del negocio RN-01 a RN-18 | `docs/REGLAS_DEL_NEGOCIO.md` |
| Modelo de datos (tabla de Baserow) | `docs/notion_modelado_datos.md` |
| Decisiones 0001 a 0005 (la 0005 es propuesta) | `docs/decisiones/` |
| Espejo en Notion: script y CSV | `docs/notion/` |

## ⏭️ Siguiente (Etapa 1 · Fase 1)

1. El dueño confirma la división en dos etapas (decisión 0005).
2. El dueño responde las preguntas abiertas de la Etapa 1 del brief.
3. Reunir el contenido de **Quiénes somos** y redactar las **cuatro políticas**.
4. Revisar las columnas reales de Baserow y qué expone `/api/products` (RN-04).
5. Decidir el hosting destino → decisión 0006.
6. Validar las reglas del negocio (RN-01 a RN-18) y cerrar la Fase 1.

La Etapa 2 (ecommerce) no se toca hasta tener la Etapa 1 en producción.

## ⚠️ Riesgo abierto

`/api/products` devuelve **todas** las columnas de la tabla de Baserow. Si InventarIA guarda
costo o proveedor, se ven desde internet. Se corrige con una lista blanca de columnas (Fase 3),
pero primero hay que ver qué columnas tiene la tabla real.
