# Modelo de datos

> La web no tiene base propia: lee y escribe la tabla de Baserow que comparte con InventarIA
> (decisión 0003). Este documento describe las columnas que usa. Reglas que implementa:
> [REGLAS_DEL_NEGOCIO.md](./REGLAS_DEL_NEGOCIO.md).

---

## Tabla de productos (Baserow)

| Columna | Tipo en Baserow | Uso en la web | Público |
|---|---|---|---|
| `Código` | Texto | Identifica el producto; va en la URL y en el mensaje de WhatsApp (RN-09) | Sí |
| `Categoría` | Texto | Filtro del catálogo | Sí |
| `Descripción` | Texto largo | Detalle del producto | Sí |
| `Marca` | Texto | Filtro y título | Sí |
| `Modelo` | Texto | Título | Sí |
| `Procesador` | Texto | Especificación | Sí |
| `Generación` | Texto | Especificación | Sí |
| `RAM` | Texto | Especificación | Sí |
| `Almacenamiento` | Texto | Especificación | Sí |
| `Estado` | Texto | Nuevo, Grado A, Grado B… | Sí |
| `Precio` | Número | Precio publicado (RN-07) | Sí |
| `Stock` | Número | 0 muestra **Equipo agotado** (RN-02) | Sí |
| `Foto` | Texto largo o archivo | URLs separadas por coma; Drive se convierte a enlace directo | Sí |
| `Video` | Texto largo | Enlace de Drive o YouTube | Sí |
| `Oculto` | Texto de una línea, opcional | `Sí` / `1` / `true` / `x` lo quita de la tienda (RN-03) | No |

**Columnas que no son de la web.** La tabla puede tener otras columnas de InventarIA (costo,
proveedor…). Hoy `flattenRow()` copia **todas** y la API pública las devuelve: es el riesgo
abierto de RN-04. La corrección es una lista blanca con las columnas marcadas *Público* arriba.

## Flujo de datos

```
Cliente ──► Next.js (servidor) ──► Baserow API  (lectura; el token nunca llega al navegador)
Admin  ──► /api/admin + clave ──► Baserow API  (crear / editar / eliminar)
Cliente ──► botón ──► wa.me/<línea de ventas>?text=<producto>
```

## Archivos que tocan los datos

| Archivo | Qué hace |
|---|---|
| `lib/inventory.js` | Lee, crea, actualiza y borra filas; modo demo sin credenciales; `isHidden()` |
| `lib/images.js` | Saca las URLs de foto y video de una fila y convierte enlaces de Drive |
| `app/api/products/route.js` | Catálogo en JSON: público sin ocultos; admin con todo |
| `app/api/admin/route.js` | Escrituras con clave; solo deja pasar columnas conocidas |
