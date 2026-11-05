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
8. **[docs/FLUJO_DESARROLLO.md](docs/FLUJO_DESARROLLO.md)** — cómo se trabaja cada mejora o bug, qué es «Hecho» y cómo se usan `tareas.csv`, Notion y la EDT.

## Al terminar un bloque de trabajo

- **Commit descriptivo en español y `git push` por bloque terminado.**
- Si se tomó una decisión de arquitectura: nuevo archivo en `docs/decisiones/`.
- Si cambió el estado de una fase o el alcance: actualizar `docs/00-BRIEF.md`,
  `docs/PENDIENTES.md` y `docs/CHANGELOG.md`. **Subir la versión del brief solo si el dueño lo
  autoriza.**
- Nada se programa sin su historia y criterios de aceptación (Fase 2); toda funcionalidad nueva
  trae su prueba (Fase 4).

## Flujo de desarrollo y control

Detalle en [docs/FLUJO_DESARROLLO.md](docs/FLUJO_DESARROLLO.md). Se trabaja con **tres herramientas y una sola
fuente de verdad (git)**: `docs/notion/tareas.csv`, Notion (tablero) y la **EDT** en Google Sheets
(mapa de solo lectura, pestaña «EDT detallada»).

- **Ciclo:** registrar → documentar → implementar → probar → aprobar → cerrar. Un bug primero se
  reproduce con una prueba y después se arregla.
- **Todo defecto se registra** como fila `BUG-n` en `tareas.csv` (nivel Crítico, Alto, Medio o Bajo en
  las Notas), aunque se arregle en minutos. Un bug Crítico o Alto abierto bloquea la salida en línea.
- **Una historia no está «Hecha»** sin `npm run build`, su prueba, la aprobación del dueño y los
  documentos al día.
- **Al cerrar un bloque:** actualizar `tareas.csv`, correr `python3 docs/notion/sincronizar.py --tareas`
  (solo cambian las filas que cambiaron) y, si el dueño pide «refresca la EDT»,
  `python3 docs/notion/edt_generar.py` y escribir el resultado en la pestaña. **La EDT nunca se edita a
  mano.**
- Un bug o historia nueva que no esté en el mapa de `edt_generar.py` cae en 7.1 «Bugs abiertos» o 7.2
  «Mejoras nuevas»; si pertenece a un entregable existente, agregarla a ese mapa.

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
- Datos de la empresa: los edita el dueño en `/admin/configuracion` (tabla `configuracion`, leída
  con `lib/configuracion.js`); `lib/site.js` es solo el respaldo. Usar `getSite()`, no `SITE`, en la
  web pública.
- Tras cambiar código: `npm run build` debe compilar.
