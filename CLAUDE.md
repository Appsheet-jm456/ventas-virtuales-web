# Ventas Virtual — Tienda Web

Tienda web de Ventas Virtual Colombia (Cali): catálogo de computadores corporativos nuevos y
usados con cierre de venta por WhatsApp y panel de administración. Lee el inventario de la
tabla de Baserow que comparte con InventarIA. Next.js 14 + React 18, JavaScript.

## Antes de empezar

1. **[docs/00-BRIEF.md](docs/00-BRIEF.md)** — one-pager: qué es, estado y próximo paso.
2. **[docs/REGLAS_DEL_NEGOCIO.md](docs/REGLAS_DEL_NEGOCIO.md)** — cómo opera la tienda. El
   código las cumple; si una cambia, cambia primero ahí.
3. [docs/notion_modelado_datos.md](docs/notion_modelado_datos.md) — columnas de Baserow.
4. [docs/PENDIENTES.md](docs/PENDIENTES.md) — dónde se quedó el trabajo.
5. [docs/sdlc/](docs/sdlc/) — las cinco fases (Diseño, Especificaciones, Implementación,
   Pruebas, Despliegue) con su criterio de cierre. **No se pasa de fase sin cerrar la actual.**
6. [docs/decisiones/](docs/decisiones/) — decisiones ya tomadas. Consultarlas antes de proponer
   un cambio de arquitectura.
7. [docs/ENTORNO_LOCAL.md](docs/ENTORNO_LOCAL.md) — cómo arrancar la app.

## Al terminar un bloque de trabajo

- **Commit descriptivo en español y `git push` por bloque terminado.**
- Si se tomó una decisión de arquitectura: nuevo archivo en `docs/decisiones/`.
- Si cambió el estado de una fase o el alcance: actualizar `docs/00-BRIEF.md`,
  `docs/PENDIENTES.md` y `docs/CHANGELOG.md`. **Subir la versión del brief solo si el dueño lo
  autoriza.**
- Nada se programa sin su historia y criterios de aceptación (Fase 2); toda funcionalidad nueva
  trae su prueba (Fase 4).

## Notion

- **Git manda, Notion es el espejo** (decisión 0001), salvo el tablero de **Tareas**, que editan
  los dos: antes de sincronizar, comparar la base de Tareas con `docs/notion/tareas.csv` y traer
  a git lo que el dueño cambió allá, sin pisarlo.
- **Solo se modifican los bloques que cambiaron. Nunca reescribir un documento completo en
  Notion** (regla del dueño). `sincronizar.py --todo` ya compara bloque a bloque; `--revisar`
  ensaya sin escribir. `--version` crea la copia del brief: solo con autorización.
- `tareas.csv` se genera con el módulo `csv` de Python, nunca a mano: una coma sin comillas
  corre las columnas.
- Token en `.env.notion` (la integración de Futur Green, cuenta appsheetjm@gmail.com). **No usar
  el conector de Notion de claude.ai**: está en otra cuenta.

## Reglas del proyecto

- **Nunca commitear secretos** (decisión 0002): el repositorio es público. `.env.local` y
  `.env.notion` no se versionan.
- **Baserow es la única fuente del inventario** (decisión 0003). Sin base propia.
- **El cliente solo ve datos de venta** (RN-04): nada de costo, proveedor ni notas internas en
  la API pública.
- **El modo demo debe seguir funcionando** sin credenciales.
- Datos de la empresa solo en `lib/site.js`.
- Tras cambiar código: `npm run build` debe compilar.
