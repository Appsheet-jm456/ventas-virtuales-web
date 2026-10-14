# 0003 · Baserow como única fuente del inventario

**Estado:** Reemplazada por la [0009](./0009-supabase-cloud-para-la-landing.md) · 14 oct 2026 (registra cómo se construyó la v1)

## Contexto

El inventario ya se lleva en Baserow con InventarIA. Tener una base aparte para la web obligaría
a sincronizar dos inventarios y tarde o temprano mostrarían cosas distintas.

## Decisión

- La web lee y escribe **la misma tabla** de Baserow que InventarIA, por su API.
- Sin base de datos propia. El token de Baserow solo vive en el servidor.
- Agotado = `Stock` en 0. Oculto = columna `Oculto`.

## Alternativas descartadas

**Base propia (Supabase o SQLite) sincronizada con Baserow** — dos inventarios que divergen.

## Consecuencias

- Vender en InventarIA y poner Stock 0 basta para que la web muestre agotado.
- La web depende de la disponibilidad y del límite de peticiones de Baserow.
- Las columnas internas de InventarIA están en la misma tabla: la API pública debe filtrarlas
  (RN-04).
