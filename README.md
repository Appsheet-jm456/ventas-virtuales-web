# Ventas Virtual Colombia — Tienda web

> **Documentación del proyecto:** [docs/00-BRIEF.md](docs/00-BRIEF.md) · fases en [docs/sdlc/](docs/sdlc/) · método de trabajo en [CLAUDE.md](CLAUDE.md).

Página web tipo ecommerce para la venta de computadores corporativos nuevos y usados
(portátiles, torres tiny, partes y accesorios). Hecha con Next.js, lista para Vercel.

- **Catálogo público** con búsqueda, filtros por categoría/marca/precio y cinta **AGOTADO**.
- **Página de producto** con galería de fotos + video (tipo Mercado Libre) y botón
  **"Estoy interesado — WhatsApp"** que abre la línea oficial de ventas con mensaje prellenado.
- **Panel de administración** en `/admin` (protegido con clave): crear, editar y eliminar
  productos, incluyendo links de fotos y video.
- **Base de datos**: Baserow — usa la MISMA tabla que InventarIA (un solo inventario:
  al vender y poner Stock 0, en la web aparece "Agotado" automáticamente).

## 1. Probar en local

Requiere Node.js 18+.

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Sin configurar nada funciona en **modo demo** con productos
de ejemplo.

## 2. Variables de entorno

Crea `.env.local` (local) o configúralas en Vercel (Settings → Environment Variables):

| Variable | Obligatoria | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL del proyecto de Supabase (decisión 0009) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sí | Clave pública; lo que se puede leer o escribir lo decide la RLS |

> No requiere clave de IA (Gemini): esta web no usa IA.

## 3. Columnas esperadas en Baserow

`Código`, `Categoría`, `Descripción`, `Marca`, `Modelo`, `Procesador`, `Generación`,
`RAM`, `Almacenamiento`, `Estado`, `Precio` (número), `Stock` (número),
`Foto` (texto largo: URLs separadas por coma), `Video` (texto largo: URL de Drive/YouTube).

Los enlaces de Google Drive deben estar compartidos como **"Cualquier persona con el enlace"**.

### Columna opcional `Oculto` (para "Quitar de la tienda")

Para poder **quitar un producto del catálogo sin borrarlo de Baserow**, agrega una
columna llamada exactamente **`Oculto`** (tipo *Texto de una línea*). Cuando su valor
sea `Sí` (o `1`, `true`, `x`), el producto desaparece de la web para los clientes pero
se conserva en Baserow; el panel `/admin` lo sigue mostrando para poder republicarlo.
Si la columna no existe, todos los productos se ven con normalidad.

> **Agotado / Vendido** no necesita esta columna: se controla poniendo `Stock` en `0`,
> lo que muestra la cinta diagonal **"Equipo agotado"** en el producto.

## 4. Desplegar en Vercel

1. Sube este proyecto a un repositorio de GitHub.
2. En https://vercel.com → **Add New Project** → importa el repositorio.
3. Agrega las variables de entorno de la tabla anterior.
4. **Deploy**. Cada push a GitHub redespliega automáticamente.

## 5. Datos de la empresa

Se editan en un solo archivo: `lib/site.js` (nombre, dirección, WhatsApp, redes sociales).

## Estructura

```
app/
  page.js                  → Home: hero + catálogo con filtros
  producto/[codigo]/page.js→ Detalle: galería, specs, botón WhatsApp
  admin/page.js            → Panel admin (CRUD de productos)
  api/products/route.js    → Catálogo público en JSON (lee Baserow)
  api/admin/route.js       → Escritura protegida con la sesión de Supabase Auth
  components/              → Catalog (grid+filtros), Gallery (fotos+video)
lib/
  inventory.js             → Lectura/escritura Baserow (+deleteRow)
  images.js                → Fotos y videos desde links de Drive/YouTube
  site.js                  → Datos de la empresa (dirección, WhatsApp, redes)
```

## Pendientes (fases siguientes)

- Pasarela de pagos (el cierre de venta hoy es por WhatsApp).
- Chatbot / CRM de atención al cliente.
