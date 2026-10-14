# Historial del proyecto

> Versiones del brief y cambios que las motivaron.
> El detalle técnico está en `git log`; aquí va lo que le importa a alguien que no lee código.

---

## Brief v1.3 — 14 oct 2026 · La tienda completa tiene repo propio

El Camino 2 deja de ser una promesa dentro de este repo: se construye en
`Appsheet-jm456/ventas-virtual-eccomer-web`, que nace con el método completo de Futur Green y el
CRM (decisión 0008). Este repo se concentra en terminar y publicar la landing.

---

## Brief v1.2 — 13 oct 2026 · Dos caminos: la landing ahora, la tienda completa después

**La landing sale primero.** El dueño aclaró el plan: la landing que ya está en Vercel se mejora
y se pasa a **Hostinger con el dominio propio**, mientras la tienda completa (administración,
inventarios, categorías, configuración, pedidos y ecommerce) se sigue planificando. El pago en
línea y el flujo de pedido quedan por ahora fuera (decisión 0005).

En la landing: **nuevo diseño** (portada, franja de confianza con garantía, envíos nacionales,
tienda física y asesoría, tarjetas de producto, banda de contacto y mejor versión celular) y el
público **ya no puede ver columnas internas** de Baserow como costo o proveedor.

---

## Brief v1.1 — 12 oct 2026 · Marca, políticas y ecommerce

**El objetivo creció y ahora está mapeado.** La web deja de ser solo un catálogo: debe posicionar
la marca (quiénes somos, especialidad Tech), publicar las políticas (privacidad, envíos, garantía,
términos y condiciones) y, más adelante, vender y cobrar en línea con un flujo de pedido de siete
pasos hasta el despacho.

Para no abrumar el trabajo se propone dividirlo en **dos etapas**: primero marca y catálogo con
cierre por WhatsApp, después el ecommerce (decisión 0005, por confirmar). El brief trae ahora un
**mapa de la web** con cada página, su etapa y su estado.

---

## Brief v1.0 — 12 oct 2026 · El proyecto toma estructura

**La tienda ya funcionaba, pero sin documentación.** Se adopta el método de Futur Green: brief,
reglas del negocio, modelo de datos, decisiones y cinco fases (Diseño, Especificaciones,
Implementación, Pruebas y Despliegue). Git guarda la versión buena y Notion es el espejo para
leer, comentar y llevar el tablero de tareas.

Al documentar salió un riesgo: la API pública del catálogo devuelve todas las columnas de
Baserow, incluidas las que podrían ser internas de InventarIA.
