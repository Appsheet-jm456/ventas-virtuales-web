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
| HU-13 · Banners e imágenes | 19 oct 2026 | Con Cloudinary real: proporción y tamaño rechazados con el motivo; subida de escritorio y celular; enlace inválido rechazado; crear, editar cambiando la imagen (la vieja se borra), ordenar con flechas y arrastre, desactivar y activar, quitar con confirmación; Guardar espera mientras sube; cancelar y descartar borran lo subido; la portada usa la imagen optimizada con su enlace y la de celular; imagen de categoría y vuelta a la de respaldo; logo subido se ve en el encabezado y se revierte. Tablas respaldadas y restauradas; Cloudinary quedó vacío |
| HU-17 · Fotos de productos | 21 oct 2026 | Con Cloudinary real y contra el código nuevo: la firma exige el código y fija la carpeta `ventas-virtual/productos/<código>/` (el código se sanea); subida por URL a esa carpeta y borrado posterior; una foto ilegible da error y no deja nada; `/api/admin/cloudinary` sin sesión responde 401; `npm run build` compila. **Pendiente en navegador:** subir fotos desde el formulario, portada, quitar y cancelar, y la migración de un producto con fotos de Drive (hoy `productos` está vacía). |
| HU-18 · Producto en página completa | 21 oct 2026 | Playwright con usuario QA temporal y producto `QA-HU18` oculto (borrados al terminar): Nuevo producto abre `/admin/productos/nuevo` con título «Nuevo producto»; precio se muestra como $1.250.000; crear vuelve al listado con aviso; Editar abre `/admin/productos/<id>` con los datos cargados y Guardar deshabilitado sin cambios; cambiar precio y Agotado guarda y persiste; Cancelar con cambios pide confirmación; id inexistente muestra «Producto no encontrado»; en celular (390 px) una columna sin scroll horizontal. Sin errores de JavaScript. Aprobada por el dueño el 21 oct. |
| HU-19 · Columna Código y filtros | 21 oct 2026 | Playwright con usuario QA temporal y 4 productos `QA-F*` ocultos (borrados al terminar): la tabla empieza por Código; «8GB» y «8 GB» salen como una sola opción con conteo (2); al elegir RAM 8GB, Modelo y Generación solo ofrecen lo que queda; RAM + Modelo deja 1 fila y marca 2 filtros activos; precio 1.000.000–1.600.000 deja QA-F1 y QA-F2; mínimo mayor que máximo avisa y ofrece Limpiar filtros; al ir a Editar y volver se conservan búsqueda y filtros; en celular el panel se abre con el botón Filtros, sin scroll horizontal. Sin errores de JavaScript. Aprobada por el dueño el 21 oct. |
| HU-20 · Tamaño de tabla y paginación | 21 oct 2026 | Playwright con usuario QA temporal y 121 productos `QA-P*` ocultos (borrados al terminar): por defecto 20 filas y «Mostrando 1–20 de 121 (filtrados de 122)»; barra 1 2 3 4 … 7; en la página 4 muestra 1 … 3 4 5 … 7 y empieza en QA-P061; Ver 50 da 50 filas y 3 páginas; Ver Todos muestra las 121 sin paginación; Siguiente sube al inicio de la tabla; al editar y volver sigue en la página 3; un filtro de precio vuelve a la página 1; eliminar el único producto de la última página pasa a la anterior; con una sola página no hay barra pero sí el selector; en celular sin scroll horizontal. Corregido en la prueba: el número de la página actual se perdía con el mouse encima. Aprobada por el dueño el 21 oct. |
| HU-21 · Modo pantalla | 22 oct 2026 | Capturas antes y después con Playwright (Inicio, Productos, Categorías y ficha, a 1366 y 390 px): fondo azul pantalla en todas, encabezado oscuro con el logo nuevo y línea cian, banners temporales con constelación y monitor, tarjetas con la foto en recuadro claro y precio amarillo, «Agotado» en rojo con texto blanco, pie con logo vertical y constelación; sin scroll horizontal ni errores de JavaScript. Fuentes Montserrat e Inter servidas por la web. Ícono de pestaña `/marca/icono.png` e imagen para compartir `/marca/og.png`. El panel `/admin` sigue claro (fondo blanco, sin la clase del tema, también tras navegar desde la web). Pendiente: visto bueno del dueño. |
