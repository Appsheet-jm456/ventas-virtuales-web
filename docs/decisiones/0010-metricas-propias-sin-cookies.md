# 0010 · Métricas propias, sin cookies ni datos personales

**Estado:** Aceptada · 19 oct 2026 · Responde la pregunta abierta del brief «¿Se miden visitas?»

## Contexto

La Bandeja de entrada del panel (HU-11) debe mostrar cuántos visitantes llegan y cuántos escriben
por WhatsApp, y qué productos generan más consultas. Las opciones eran Google Analytics o Meta
Pixel, o registrar los eventos en la base que ya tiene la web (Supabase, decisión 0009).

## Decisión

- Se registran dos eventos en la tabla `eventos` de Supabase: **visita** (cada página vista) y
  **whatsapp** (cada clic en un enlace de WhatsApp, con el código del producto cuando sale del
  botón «Estoy interesado»).
- **Sin datos personales** (Ley 1581): no se guarda IP, cookie, identificador ni navegador. Solo
  el tipo, la ruta sin parámetros (`?q=` podría traer lo que el cliente escribió), el código del
  producto y la hora. No hace falta aviso de cookies.
- La web llama a `/api/eventos`, que descarta robots (por el navegador que declaran) y nunca
  afecta al visitante si falla. El panel no se mide.
- La RLS deja al público solo **insertar**, con la hora del servidor; leer es solo del
  administrador. Los resúmenes salen de dos funciones SQL (`metricas_por_dia` y
  `productos_mas_consultados`) que respetan esa RLS.
- Los días se cuentan en hora de Colombia.

## Consecuencias

- La Bandeja funciona sin cuentas ni scripts de terceros y la web no carga nada externo para medir.
- No hay visitantes únicos, origen de la visita ni embudo: si se necesitan, se agrega Google
  Analytics u otra herramienta con su propio aviso de privacidad.
- Cualquiera podría enviar eventos falsos a `/api/eventos`; con el volumen esperado se acepta. Si
  se abusa, se agrega un límite por minuto.
- Migración: `supabase/migrations/20261019230000_eventos_metricas.sql`.
