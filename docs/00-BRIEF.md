# Ventas Virtual — Tienda Web · Brief del proyecto

`v1.0` · 12 oct 2026 · **Fase actual: 1 de 5 — Diseño** · Responsable: dueño de Ventas Virtual Colombia

---

## Qué es

Tienda web tipo ecommerce de **Ventas Virtual Colombia** (Cali), distribuidor de computadores
corporativos nuevos y usados: portátiles, torres tiny, partes y accesorios. Muestra el
inventario real y lleva el cierre de la venta a **WhatsApp**. No cobra en línea.

| Módulo | Qué hace | Estado |
|---|---|---|
| Catálogo | Búsqueda y filtros por categoría, marca y precio | Existe (v1) |
| Página de producto | Galería de fotos y video (Drive / YouTube) y especificaciones | Existe (v1) |
| Botón WhatsApp | Abre la línea de ventas con un mensaje ya escrito con el producto | Existe (v1) |
| Agotado / oculto | Cinta **Equipo agotado** con Stock 0; columna `Oculto` lo quita de la tienda | Existe (v1) |
| Panel `/admin` | Crear, editar, eliminar, agotar y ocultar productos, con clave | Existe (v1) |

**El código v1 ya existe y se hizo sin estructura.** La Fase 1 documenta y valida lo que hay;
desde aquí todo cambio entra por el ciclo de cinco fases.

## Problema que resuelve

El inventario vive en Baserow (la misma tabla de InventarIA) y el cliente depende de que un
asesor le mande fotos y precios por WhatsApp. No hay un catálogo propio, siempre al día, que el
cliente consulte y comparta solo.

## Objetivo

Que un cliente encuentre el equipo que busca, vea fotos reales y disponibilidad, y escriba a
ventas por WhatsApp **con el producto ya identificado**, sin que nadie le mande el catálogo a mano.

## Usuarios

| Usuario | Rol | Necesidad principal |
|---|---|---|
| Cliente final / empresa | Compra | Filtrar por precio, marca, procesador o RAM; ver fotos y si hay stock |
| Dueño / vendedor | Administra | Publicar, editar, agotar u ocultar un producto en minutos, sin entrar a Baserow |

## Alcance v1

**Dentro:**

- Catálogo público con búsqueda y filtros.
- Página de producto con galería y botón WhatsApp.
- Agotado con Stock 0 y ocultar con la columna `Oculto`.
- Panel `/admin` protegido con clave.
- Datos de la empresa en un solo archivo (`lib/site.js`).
- Migrar el alojamiento desde Vercel (plan previo en Notion: *Plan de acción pagina Web*).

**Fuera, por ahora:** pasarela de pagos, carrito y cuentas de cliente, chatbot o CRM.

## Stack

**Frontend** Next.js 14 (App Router) · React 18 · JavaScript

**Datos** Baserow por API — la misma tabla de InventarIA, sin base propia (decisión 0003)

**Contacto** WhatsApp (`wa.me`) con mensaje prellenado

**Alojamiento** Hoy Vercel; destino por decidir (ver preguntas abiertas)

## Fases

| Fase | Estado | Documento |
|---|---|---|
| 1 · Diseño | En curso | `docs/sdlc/1-diseno.md` |
| 2 · Especificaciones | Pendiente | `docs/sdlc/2-especificaciones.md` |
| 3 · Implementación | Pendiente | `docs/sdlc/3-implementacion.md` |
| 4 · Pruebas | Pendiente | `docs/sdlc/4-pruebas.md` |
| 5 · Despliegue | Pendiente | `docs/sdlc/5-despliegue.md` |

## Métricas de éxito

- Todo producto con Stock mayor a 0 se ve en la web con al menos una foto.
- Los clics en **Estoy interesado — WhatsApp** se pueden contar por producto.
- El dueño publica un producto nuevo en menos de 3 minutos.
- La página carga en menos de 3 s en celular con 4G.

## Riesgos

| Riesgo | Qué se hace |
|---|---|
| La API pública `/api/products` devuelve **todas** las columnas de Baserow: si la tabla tiene costo o proveedor, se ven desde internet | Revisar columnas y filtrar a una lista blanca (tarea en Fase 1) |
| La clave de `/admin` es una sola y se compara en texto plano | Decidir si basta o se necesitan usuarios (pregunta abierta) |
| Fotos en Drive sin compartir públicamente no cargan | Regla RN-05 y validación al publicar |
| El hosting destino no soporta Node.js | Elegir hosting con Node 18+ o un VPS (decisión pendiente) |

## Preguntas abiertas

- [ ] ¿A qué hosting se migra desde Vercel? ¿Soporta Node.js 18+?
- [ ] ¿Dominio propio? ¿Cuál?
- [ ] ¿Se mantiene el diseño visual actual o se rediseña (colores, logo)?
- [ ] ¿Cuántos productos activos hay hoy en Baserow? ¿Qué columnas tiene la tabla real?
- [ ] ¿Quién usa el panel admin? ¿Una sola clave basta?
- [ ] ¿Se miden visitas (Google Analytics o Meta Pixel)?

## Próximo paso

Responder las preguntas abiertas y revisar qué columnas de Baserow expone la API pública. Con eso
se cierra la Fase 1 y se pasa a escribir las historias de usuario (Fase 2).
