# Crear las tablas Categorías y Banners en Baserow

> Modelo v2 (`docs/notion_modelado_datos.md`, decisión 0007). Las tablas se crean importando
> estos CSV; después se ajusta el tipo de algunas columnas.

## 1. Importar

En la **misma base de datos** donde está la tabla de productos de InventarIA:

1. **+ Crear tabla → Importar archivo → CSV** y elegir `categorias.csv`.
   - Marcar **"La primera fila es el encabezado"**. Nombre de la tabla: `Categorías`.
2. Repetir con `banners.csv`. Nombre: `Banners`.

## 2. Cambiar el tipo de columnas

Al importar, todas quedan como texto. Cambiar (clic en la columna → Editar campo → Tipo):

| Tabla | Columna | Tipo |
|---|---|---|
| Categorías | `Orden` | Número |
| Categorías | `Visible`, `Línea en el Inicio` | Booleano |
| Categorías | `Imagen` | URL |
| Banners | `Orden` | Número |
| Banners | `Activo` | Booleano |
| Banners | `Imagen escritorio`, `Imagen celular` | URL |
| Banners | `Desde`, `Hasta` | Fecha |

Las columnas `Imagen…` quedan vacías: se llenan desde `/admin` al subir a Cloudinary.

## 3. Permisos del token

En **Configuración → Tokens de base de datos**, el token que usa la web debe tener permiso sobre
las tablas nuevas: **Leer** para mostrarlas y **Crear / Actualizar / Eliminar** para que `/admin`
las administre.

## 4. Pasar los ID

El ID de cada tabla es el número que aparece en la URL al abrirla
(`…/database/123/table/456` → `456`). Van como variables de entorno, no en git:

```
BASEROW_TABLE_CATEGORIAS=...
BASEROW_TABLE_BANNERS=...
```
