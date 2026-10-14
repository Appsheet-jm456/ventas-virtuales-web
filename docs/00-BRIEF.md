# Ventas Virtual — Tienda Web · Brief del proyecto

`v1.3` · 14 oct 2026 · **Fase actual: 1 de 5 — Diseño** · Responsable: dueño de Ventas Virtual Colombia

---

## Qué es

Sitio web de **Ventas Virtual Colombia** (Cali), comercializadora de tecnología (Tech):
computadores corporativos nuevos y usados, portátiles, torres tiny, partes y accesorios. Es a la
vez **vitrina de la marca** y **canal de ventas**, y se construye por **dos caminos**:

| Camino | Qué es | Estado | Cómo se cierra la venta |
|---|---|---|---|
| **1 · Landing** | El código de este repositorio: catálogo conectado a Baserow, producto con fotos y video, WhatsApp | **Ahora**: ya existe en Vercel (prototipo); se mejora y se pasa a Hostinger | Por **WhatsApp**, con el producto ya identificado |
| **2 · Tienda completa (app)** | Administración, inventarios, categorías, configuración, pedidos y ecommerce | **Después**: repo propio `ventas-virtual-eccomer-web` (decisión 0008) | Por definir. El pago en línea y el flujo de pedido quedan **por ahora fuera** |

> No confundir los **caminos** (qué producto se entrega) con las **fases** SDLC (cómo se
> construye). Cada camino recorre las cinco fases: Diseño, Especificaciones, Implementación,
> Pruebas y Despliegue.

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

**Visión del Camino 2 (por ahora no):** convertir la página en un **ecommerce** donde el cliente compre y pague
en línea, con este flujo de pedido:

> Elección del producto → Pago por pasarela → Confirmación → Pedido nuevo → Alistamiento →
> Video de soporte → Despacho por transportadora

## Objetivos del Camino 1 (landing)

1. **Mejorar el diseño y el frontend** de la landing.
2. **Actualizar la lista de productos en Baserow**, que está desactualizada.
3. **Desplegarla en Hostinger** (plan Web Apps) y **asociarle el dominio** ya comprado
   (decisión 0006).

## Usuarios

| Usuario | Rol | Necesidad principal |
|---|---|---|
| Cliente final / empresa | Compra | Conocer la marca, filtrar por precio, marca, procesador o RAM, ver fotos y stock, y comprar o escribir a un asesor |
| Asesor de ventas | Atiende | Recibir al cliente con el producto ya identificado |
| Dueño / administrador | Administra | Publicar productos y, en el Camino 2, gestionar pedidos de principio a fin |
| Bodega / alistamiento (Camino 2) | Prepara | Saber qué pedido alistar y dejar el video de soporte |

## Mapa de la web

Lo que existe y lo que falta, página por página. **Este mapa es la lista de trabajo.**

| Página | Qué muestra | Camino | Estado |
|---|---|---|---|
| Inicio | Encabezado con buscador y WhatsApp, banner rotativo, categorías, línea Portátiles corporativos | 1 | Hecho con imágenes temporales (HU-01 a HU-05) |
| Categorías | Todas las categorías con imagen | 1 | Hecho con imágenes temporales (HU-03) |
| Quiénes somos | Historia, experiencia y especialidad (Tech) | 2 | Falta |
| Productos | Catálogo completo con búsqueda y filtros por categoría, marca y precio | 1 | Hecho: `/productos` (HU-06) |
| Producto | Fotos, video, especificaciones, disponibilidad, botón WhatsApp | 1 | Existe |
| Política de privacidad | Tratamiento de datos personales | 2 | Falta |
| Política de envíos | Cobertura nacional, tiempos, costos, transportadora | 2 | Falta |
| Política de garantía | Qué cubre, por cuánto tiempo, cómo se reclama | 2 | Falta |
| Términos y condiciones | Reglas de uso y de compra | 2 | Falta |
| Contacto | WhatsApp, dirección, redes y banda *¿No encuentras tu equipo?* | 1 | Existe |
| Panel `/admin` | Crear, editar, agotar y ocultar productos | 1 | Existe |
| Carrito y pago | Selección de productos y pasarela de pago | 2 (por ahora no) | Falta |
| Confirmación y seguimiento | Estado del pedido para el cliente | 2 (por ahora no) | Falta |
| Admin de pedidos | Pedido nuevo, alistamiento, video de soporte, despacho | 2 (por ahora no) | Falta |
| Admin completo | Inventarios, categorías y configuración | 2 | Falta |

## Alcance

**Camino 1 — landing (dentro):**

- Catálogo con búsqueda y filtros; página de producto con galería, video y botón WhatsApp.
- Agotado con Stock 0 y ocultar con la columna `Oculto`.
- Panel `/admin` sencillo, protegido con clave.
- Rediseño del frontend: portada, franja de confianza, tarjetas, banda de contacto y
  versión móvil.
- API pública con **lista blanca de columnas** (RN-04): solo datos de venta.
- Inventario de Baserow al día.
- Despliegue en Hostinger Web Apps con dominio propio.

**Camino 2 — tienda completa (después, en el repo `ventas-virtual-eccomer-web`):**

- Páginas de marca: Quiénes somos y las cuatro políticas (privacidad, envíos, garantía, términos).
- Administración completa: inventarios, categorías, configuración.
- Módulo de pedidos.
- **Ecommerce completo — por ahora no:** pago por pasarela y el flujo de pedido (confirmación →
  pedido nuevo → alistamiento → video de soporte → despacho por transportadora).

**Fuera, por ahora:** chatbot o CRM de atención, cuentas de cliente con login, varias bodegas.

## Stack

**Frontend** Next.js 14 (App Router) · React 18 · JavaScript

**Datos** Baserow por API — la misma tabla de InventarIA (decisión 0003). *Camino 2: por decidir
dónde se guardan los pedidos.*

**Contacto** WhatsApp (`wa.me`) con mensaje prellenado

**Alojamiento** Hoy Vercel (prototipo). Destino: **Hostinger Web Apps** con Node.js (decisión 0006)

**Pagos** Fuera por ahora (Camino 2)

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
- Camino 2: todo pedido pagado recorre el flujo completo sin que nadie lo transcriba a mano.

## Riesgos

| Riesgo | Qué se hace |
|---|---|
| La API pública devolvía **todas** las columnas de Baserow (costo, proveedor…) | **Resuelto**: lista blanca en `lib/inventory.js` (RN-04) |
| El inventario de Baserow está desactualizado y la web lo muestra tal cual | El dueño lo actualiza; la web refresca cada 60 s |
| Las políticas son obligatorias y deben ser correctas: privacidad (Ley 1581 de datos personales) y, al vender en línea, Estatuto del Consumidor (retracto, garantía legal) | Redactarlas y pedir revisión al contador o abogado antes de publicar |
| (Camino 2) Recibir pagos en línea implica datos sensibles y conciliación | Usar una pasarela que maneje la tarjeta; la web nunca guarda datos de pago |
| El inventario es de equipos usados, únicos: dos clientes pueden pagar el mismo | Reservar o descontar stock al pagar (Camino 2, por diseñar) |
| La clave de `/admin` es una sola y se compara en texto plano | Decidir si basta o se necesitan usuarios (pregunta abierta) |
| Fotos en Drive sin compartir públicamente no cargan | Regla RN-05 y validación al publicar |
| El plan de Hostinger no corre la app como se espera | Probar el despliegue con la URL temporal antes de mover el dominio |

## Preguntas abiertas

**Camino 1 — landing:**

- [x] ¿A qué hosting se despliega? → **Hostinger Web Apps**, con el dominio comprado ahí.
- [ ] ¿Cuál es el dominio exacto?
- [ ] ¿Cuántos productos activos hay en Baserow y quién los actualiza de ahora en adelante?
- [ ] ¿Quién usa el panel admin? ¿Una sola clave basta?
- [ ] ¿Se miden visitas (Google Analytics o Meta Pixel)?

**Camino 2 — tienda completa (se responden después):**

- [ ] ¿Quiénes somos: qué historia, años de experiencia, clientes y logros se cuentan?
- [ ] ¿Las políticas ya existen por escrito o hay que redactarlas desde cero?
- [ ] ¿Dónde se guardan los pedidos y el inventario? ¿Se sigue con Baserow?
- [ ] ¿Qué hosting soporta la app completa? ¿Basta el plan actual?
- [ ] Cuando llegue el ecommerce: ¿qué pasarela, qué transportadora y quién hace el alistamiento?

## Próximo paso

Terminar el **Camino 1**: aprobar el nuevo diseño, actualizar los productos en Baserow, desplegar
en Hostinger con el dominio y apagar Vercel. Guía en [sdlc/5-despliegue.md](./sdlc/5-despliegue.md).
