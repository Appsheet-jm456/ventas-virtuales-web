# Ventas Virtual — Tienda Web · Brief del proyecto

`v1.1` · 12 oct 2026 · **Fase actual: 1 de 5 — Diseño** · Responsable: dueño de Ventas Virtual Colombia

---

## Qué es

Sitio web de **Ventas Virtual Colombia** (Cali), comercializadora de tecnología (Tech):
computadores corporativos nuevos y usados, portátiles, torres tiny, partes y accesorios. Es a la
vez **vitrina de la marca** y **canal de ventas**, y crece en dos etapas:

| Etapa | Qué es | Cómo se cierra la venta |
|---|---|---|
| **Etapa 1 · Marca y catálogo** | Quiénes somos, catálogo, inventario disponible, políticas y contacto | Por **WhatsApp**, con el producto ya identificado |
| **Etapa 2 · Ecommerce** | Carrito, pago en línea y seguimiento del pedido | El cliente **paga en la web** y el pedido se procesa solo |

> No confundir las **etapas** (qué se entrega al cliente) con las **fases** SDLC (cómo se
> construye). Cada etapa recorre las cinco fases: Diseño, Especificaciones, Implementación,
> Pruebas y Despliegue.

**Estado hoy:** el catálogo, la página de producto, el botón WhatsApp y el panel admin ya existen
(código v1, hecho sin estructura). Faltan el resto de las páginas de marca, las políticas y todo
lo de la Etapa 2.

## Problema que resuelve

Ventas Virtual no tiene una vitrina propia que la posicione como marca. El cliente no encuentra
en un solo lugar quiénes somos, qué experiencia tenemos, qué productos vendemos ni qué equipos
hay disponibles en inventario. Además, la atención depende de que un asesor envíe el catálogo,
las fotos y los precios por WhatsApp, y eso limita las ventas, sobre todo a nivel nacional.

La web resuelve esto de dos maneras:

- **Visibilidad de marca:** muestra quiénes somos, la experiencia, el catálogo y los equipos
  disponibles en inventario.
- **Contacto directo:** el cliente selecciona los productos que le interesan y se comunica con un
  asesor para coordinar envíos a todo el país.

## Objetivo

Que Ventas Virtual tenga una herramienta que **posicione la marca en el mercado** y funcione como
**mecanismo eficaz de ventas**.

**Como marca, la web responde:**

- Quiénes somos y en qué nos especializamos: comercio de tecnología (Tech).
- Qué productos vendemos, con su catálogo.
- Cuáles son nuestras políticas: privacidad, envíos, garantía, y términos y condiciones.

**Como canal de ventas, logra que el cliente:**

- Encuentre el equipo que busca.
- Vea fotos reales y la disponibilidad.
- Escriba a ventas por WhatsApp **con el producto ya identificado**, sin que nadie le envíe el
  catálogo a mano.

**Visión de la Etapa 2:** convertir la página en un **ecommerce** donde el cliente compre y pague
en línea, con este flujo de pedido:

> Elección del producto → Pago por pasarela → Confirmación → Pedido nuevo → Alistamiento →
> Video de soporte → Despacho por transportadora

## Usuarios

| Usuario | Rol | Necesidad principal |
|---|---|---|
| Cliente final / empresa | Compra | Conocer la marca, filtrar por precio, marca, procesador o RAM, ver fotos y stock, y comprar o escribir a un asesor |
| Asesor de ventas | Atiende | Recibir al cliente con el producto ya identificado |
| Dueño / administrador | Administra | Publicar productos y, en la Etapa 2, gestionar pedidos de principio a fin |
| Bodega / alistamiento (Etapa 2) | Prepara | Saber qué pedido alistar y dejar el video de soporte |

## Mapa de la web

Lo que existe y lo que falta, página por página. **Este mapa es la lista de trabajo.**

| Página | Qué muestra | Etapa | Estado |
|---|---|---|---|
| Inicio | Presentación de la marca y accesos al catálogo | 1 | Existe (por ampliar) |
| Quiénes somos | Historia, experiencia y especialidad (Tech) | 1 | Falta |
| Catálogo | Búsqueda y filtros por categoría, marca y precio | 1 | Existe |
| Producto | Fotos, video, especificaciones, disponibilidad, botón WhatsApp | 1 | Existe |
| Política de privacidad | Tratamiento de datos personales | 1 | Falta |
| Política de envíos | Cobertura nacional, tiempos, costos, transportadora | 1 | Falta |
| Política de garantía | Qué cubre, por cuánto tiempo, cómo se reclama | 1 | Falta |
| Términos y condiciones | Reglas de uso y de compra | 1 | Falta |
| Contacto | WhatsApp, dirección, redes | 1 | Parcial (pie de página) |
| Panel `/admin` | Crear, editar, agotar y ocultar productos | 1 | Existe |
| Carrito y pago | Selección de productos y pasarela de pago | 2 | Falta |
| Confirmación y seguimiento | Estado del pedido para el cliente | 2 | Falta |
| Admin de pedidos | Pedido nuevo, alistamiento, video de soporte, despacho | 2 | Falta |

## Alcance

**Etapa 1 — dentro:**

- Páginas de marca: Inicio, Quiénes somos y Contacto.
- Catálogo con búsqueda y filtros; página de producto con galería y botón WhatsApp.
- Agotado con Stock 0 y ocultar con la columna `Oculto`.
- Las cuatro políticas: privacidad, envíos, garantía, y términos y condiciones.
- Panel `/admin` protegido con clave.
- Migrar el alojamiento desde Vercel (plan previo en Notion: *Plan de acción pagina Web*).

**Etapa 2 — dentro:**

- Carrito y pago por pasarela.
- Flujo de pedido: confirmación, pedido nuevo, alistamiento, video de soporte y despacho por
  transportadora.
- Seguimiento del pedido para el cliente y gestión de pedidos para el administrador.

**Fuera, por ahora:** chatbot o CRM de atención, cuentas de cliente con login, varias bodegas.

## Stack

**Frontend** Next.js 14 (App Router) · React 18 · JavaScript

**Datos** Baserow por API — la misma tabla de InventarIA (decisión 0003). *Etapa 2: por decidir
dónde se guardan los pedidos (ver decisión 0005).*

**Contacto** WhatsApp (`wa.me`) con mensaje prellenado

**Alojamiento** Hoy Vercel; destino por decidir (ver preguntas abiertas)

**Pagos (Etapa 2)** Pasarela por decidir

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
- Etapa 2: todo pedido pagado recorre el flujo completo sin que nadie lo transcriba a mano.

## Riesgos

| Riesgo | Qué se hace |
|---|---|
| La API pública `/api/products` devuelve **todas** las columnas de Baserow: si la tabla tiene costo o proveedor, se ven desde internet | Revisar columnas y filtrar a una lista blanca (tarea en Fase 1) |
| Las políticas son obligatorias y deben ser correctas: privacidad (Ley 1581 de datos personales) y, al vender en línea, Estatuto del Consumidor (retracto, garantía legal) | Redactarlas y pedir revisión al contador o abogado antes de publicar |
| Recibir pagos en línea implica datos sensibles y conciliación | Usar una pasarela que maneje la tarjeta; la web nunca guarda datos de pago |
| El inventario es de equipos usados, únicos: dos clientes pueden pagar el mismo | Reservar o descontar stock al pagar (Etapa 2, por diseñar) |
| La clave de `/admin` es una sola y se compara en texto plano | Decidir si basta o se necesitan usuarios (pregunta abierta) |
| Fotos en Drive sin compartir públicamente no cargan | Regla RN-05 y validación al publicar |
| El hosting destino no soporta Node.js | Elegir hosting con Node 18+ o un VPS (decisión pendiente) |

## Preguntas abiertas

**Para cerrar la Fase 1 (Etapa 1):**

- [ ] ¿A qué hosting se migra desde Vercel? ¿Soporta Node.js 18+?
- [ ] ¿Dominio propio? ¿Cuál?
- [ ] ¿Se mantiene el diseño visual actual o se rediseña (colores, logo)?
- [ ] ¿Cuántos productos activos hay hoy en Baserow? ¿Qué columnas tiene la tabla real?
- [ ] ¿Quién usa el panel admin? ¿Una sola clave basta?
- [ ] ¿Se miden visitas (Google Analytics o Meta Pixel)?
- [ ] ¿Quiénes somos: qué historia, años de experiencia, clientes y logros se cuentan?
- [ ] ¿Las políticas ya existen por escrito o hay que redactarlas desde cero?

**Para la Etapa 2 (se responden después):**

- [ ] ¿Qué pasarela de pago? (Wompi, PayU, Mercado Pago, otra)
- [ ] ¿Dónde se guardan los pedidos? ¿En Baserow, en otra tabla?
- [ ] ¿Qué transportadora(s) y cómo se calcula el costo de envío?
- [ ] ¿Quién hace el alistamiento y dónde se guarda el video de soporte?

## Próximo paso

Cerrar la **Fase 1 de la Etapa 1**: responder las preguntas abiertas, revisar las columnas de
Baserow y decidir el hosting. La Etapa 2 solo se diseña cuando la Etapa 1 esté en producción.
