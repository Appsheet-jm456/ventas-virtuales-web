# Historial del proyecto

> Versiones del brief y cambios que las motivaron.
> El detalle técnico está en `git log`; aquí va lo que le importa a alguien que no lee código.

---

## Brief v1.0 — 12 oct 2026 · El proyecto toma estructura

**La tienda ya funcionaba, pero sin documentación.** Se adopta el método de Futur Green: brief,
reglas del negocio, modelo de datos, decisiones y cinco fases (Diseño, Especificaciones,
Implementación, Pruebas y Despliegue). Git guarda la versión buena y Notion es el espejo para
leer, comentar y llevar el tablero de tareas.

Al documentar salió un riesgo: la API pública del catálogo devuelve todas las columnas de
Baserow, incluidas las que podrían ser internas de InventarIA.
