# Fase 4 · Pruebas

**Estado:** ⚪ Pendiente

> Comprueba que cada criterio de aceptación se cumple, de forma repetible.

## Criterio de cierre

- [ ] `npm test` corre pruebas unitarias de `lib/` (inventario, imágenes, ocultos)
- [ ] Prueba de punta a punta del catálogo, el detalle y el botón WhatsApp en modo demo
- [ ] Checklist manual en celular y escritorio
- [ ] La API pública no devuelve columnas internas (RN-04) — con prueba

---

## Plan

Se escribe al cerrar la Fase 2, a partir de los criterios de aceptación.

---

## Pruebas en navegador ya hechas

Corridas con un navegador sin interfaz (Playwright) contra Supabase, con un usuario QA temporal y
productos `QA-*` ocultos que se borran al terminar. Sirven de guion para las pruebas automáticas.

| Historia | Fecha | Qué se comprobó |
|---|---|---|
| HU-10 · Panel lateral | 19 oct 2026 | Login; cinco módulos con icono; plegar y abrir; estado recordado al recargar; módulo activo resaltado; rutas directas (`/admin/categorias`); en 390 px riel fijo, panel superpuesto y sin desborde; la web pública conserva encabezado y pie |
| HU-12 · Productos | 19 oct 2026 | Estado vacío con enlace a Carga CSV; descarga de la plantilla; vista previa (2 nuevos, 1 error con fila y motivo); confirmar carga; filtros con conteo (Agotados, Ocultos, Sin foto); búsqueda; menú Acciones (abre, cierra con Escape, Marcar agotado); Eliminar con confirmación en la página; sin desborde a 390 px |
| HU-14 · Categorías | 19 oct 2026 | Conteo por palabra; aviso «no entra en ninguna categoría»; palabra sugerida y vista en vivo (0 y 1 coincidencias); crear; nombre repetido rechazado; editar en la fila; subir y bajar; ocultar; la web pública solo muestra la visible con productos publicados y enlaza por la palabra; quitar con confirmación (singular); sin desborde a 390 px |
| HU-15 · Configuración | 19 oct 2026 | Carga de valores guardados; barra «sin cambios» y Guardar deshabilitado; WhatsApp inválido y red sin https rechazados; Descartar; vista previa del mensaje; guardar normaliza el número; la web muestra número, horario y redes nuevos, oculta TikTok vacío, oculta agotados y precios, título con el nombre nuevo y botón WhatsApp con la plantilla; cambio de contraseña (corta rechazada, válida entra en Supabase); sin desborde a 390 px. La configuración real se respaldó y restauró |
| HU-11 · Bandeja | 19 oct 2026 | RLS de `eventos`: el público inserta pero no lee, no borra, no falsea la fecha ni llama los resúmenes; tipo inválido rechazado. Visitas en Inicio, Productos, Categorías y producto, también con navegación interna; clic en «Estoy interesado» con el código; navegador sin interfaz descartado como robot; cada página cuenta una vez. Bandeja: indicadores, 14/30 barras y el mes, ranking, alerta «sin foto», sin desborde a 390 px |
