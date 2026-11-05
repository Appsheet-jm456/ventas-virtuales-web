# 0008 · La tienda completa (Camino 2) vive en un repositorio propio

**Estado:** Aceptada · 14 oct 2026 · Concreta la [0005](./0005-dos-caminos-landing-y-tienda-completa.md)

## Contexto

La decisión 0005 separó la landing (Camino 1) de la tienda completa (Camino 2) pero dejó los dos
en el mismo repositorio. Este repo nació sin SDLC: la tienda completa (pasarela de pagos con
Wompi u otra, pedidos, inventario, configuración, métricas) heredaría ese código sin diseño.

## Decisión

- **Camino 1 · Landing:** sigue en `Appsheet-jm456/ventas-virtuales-web` (este repo).
- **Camino 2 · Tienda completa:** `Appsheet-jm456/ventas-virtual-eccomer-web`, repo nuevo con el
  método de Futur Green y el CRM: brief, reglas del negocio, fases SDLC, decisiones y espejo en
  Notion. Se diseña por completo antes de programar.
- Lo que antes decía "Camino 2" en este repo (páginas de marca, administración completa, pedidos,
  ecommerce) se planifica y se construye allá. Qué se reutiliza de aquí (textos, políticas,
  diseño visual) se decide pieza por pieza, sin copiar código sin revisar.

## Alternativas descartadas

**Los dos caminos en este repo** — el ecommerce heredaría código v1 sin diseño y la deuda de
estructura que se quiere evitar.

## Consecuencias

- La landing sale rápido y no depende de las decisiones del ecommerce.
- Pendiente en cada repo: la fuente de datos (Baserow o Supabase) y cómo la tienda nueva
  reemplaza a la landing en el dominio.
- Brief a v1.3 (autorizado por el dueño el 14 oct 2026).
