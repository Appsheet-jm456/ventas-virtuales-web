# 0005 · Dos caminos: la landing ahora, la tienda completa después

**Estado:** Aceptada · 13 oct 2026 (el dueño la definió en la conversación)

## Contexto

El objetivo creció: además del catálogo con WhatsApp, el negocio quiere una app completa con
administración, inventarios, categorías, configuración, pedidos y ecommerce con pago en línea.
Pero ya hay una landing funcionando, conectada a Baserow y desplegada en Vercel como prototipo.
Esperar a la app completa para publicar significa meses sin vitrina.

## Decisión

- **Camino 1 · Landing (ahora).** El código de este repositorio. Se mejora su diseño, se
  actualiza el inventario en Baserow y se despliega en Hostinger con el dominio propio
  (decisión 0006). Se queda como está en su alcance: catálogo, producto y WhatsApp.
- **Camino 2 · Tienda completa (después).** Una app nueva que se sigue planificando en Notion:
  administración, inventarios, categorías, configuración, pedidos y ecommerce. **El flujo de
  pago y pedido (pasarela → confirmación → pedido nuevo → alistamiento → video de soporte →
  despacho) queda por ahora fuera.**
- Cada camino recorre las cinco fases SDLC a su medida: la landing en versión acelerada, la
  tienda completa completa.

## Alternativas descartadas

**Esperar a la tienda completa para publicar** — sin vitrina durante meses.

**Hacer crecer la landing hasta volverla la tienda** — la landing no tiene base propia ni
usuarios; convertirla en ecommerce a parches mezcla dos arquitecturas.

## Consecuencias

- La landing puede salir a producción en días y sirve de vitrina mientras se diseña lo demás.
- Lo que se aprenda con la landing (qué busca el cliente, qué productos se mueven) alimenta el
  diseño de la tienda completa.
- La documentación separa lo que es de cada camino.
