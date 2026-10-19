# Fase 5 · Despliegue

**Estado:** 🟡 En curso (Camino 1 · landing) · **Abierta:** 13 oct 2026

> Pone la landing en Hostinger Web Apps, con el dominio propio y datos reales. Decisión 0006.

## Criterio de cierre

- [ ] Productos reales cargados en Supabase (CSV desde `/admin/productos`)
- [ ] Contraseña del panel cambiada por una fuerte (hoy es de pruebas)
- [ ] La rama de producción (`main`) trae el panel nuevo (HU-07 a HU-15)
- [ ] Web App creada en Hostinger y conectada al repositorio, rama `main`
- [ ] Las seis variables de entorno cargadas (tabla del paso 4)
- [ ] Prueba en la URL temporal: lista de verificación de abajo
- [ ] Dominio asociado y con SSL (candado)
- [ ] `NEXT_PUBLIC_SITE_URL` con el dominio y redespliegue
- [ ] Vercel apagado después de verificar; token de Baserow revocado

---

## Antes de Hostinger

1. **Cargar los productos reales**: exportar el CSV de Baserow y subirlo en `/admin/productos ›
   Carga CSV`. Sin esto la web sale con el catálogo vacío.
2. **Subir banners e imágenes** en `/admin/banners` (opcional: sin ellos se usan los de respaldo).
3. **Cambiar la contraseña** del panel en `/admin/configuracion › Cuenta`.
4. **Publicar el código en `main`**. Hoy la rama por defecto del repositorio es
   `claude/github-upload-iteration-cgbvq9` y el panel nuevo vive en
   `claude/determined-ramanujan-i61gup`. Se abre un Pull Request de la segunda hacia la primera,
   se fusiona, y en GitHub (*Settings › General › Default branch*) se renombra la rama por defecto
   a `main`. GitHub redirige el nombre viejo.

## Paso a paso en Hostinger

> Los nombres de los menús pueden variar un poco; si algo no coincide, guíate por el panel.

1. **hPanel → Sitios web → Web Apps → Empezar.** Elegir **Conectar con GitHub** y autorizar el
   repositorio `Appsheet-jm456/ventas-virtuales-web`, rama `main`.
2. **Configuración de la compilación.** Hostinger detecta Next.js. Verificar:
   - Versión de Node: **20** (mínimo 18.18)
   - Comando de compilación: `npm run build`
   - Comando de inicio: `npm start` (usa el puerto que asigna Hostinger, `PORT`)
3. **Antes del primer despliegue, cargar las variables** (misma pantalla o *Configuración →
   Variables*). Las `NEXT_PUBLIC_` se incorporan al construir: si se agregan después, hay que
   volver a desplegar.
4. **Variables de entorno:**

   | Variable | Valor | Secreta |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://upaoxwikqgevhepbgjoq.supabase.co` | No |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | la *publishable key* de Supabase (la misma de Vercel) | No |
   | `NEXT_PUBLIC_SITE_URL` | la URL temporal de Hostinger; luego `https://tu-dominio.com` | No |
   | `CLOUDINARY_CLOUD_NAME` | `ygybpehr` | No |
   | `CLOUDINARY_API_KEY` | la API Key de la llave **ApiWeb** | No |
   | `CLOUDINARY_API_SECRET` | el secreto de **ApiWeb** | **Sí** |

   **No van**: `BASEROW_API_TOKEN`, `BASEROW_TABLE_ID` ni `ADMIN_PASSWORD` (ya no se usan desde la
   decisión 0009 y HU-07), ni `SUPABASE_SECRET_KEY` o `SUPABASE_ACCESS_TOKEN`, que solo usa el
   servidor de desarrollo y **nunca** deben estar en la web. Nada de esto se escribe en GitHub ni
   en Notion (decisión 0002).
5. **Desplegar** y abrir la **URL temporal** que da Hostinger. Revisar la lista de abajo.
6. **Asociar el dominio** en la Web App (*Dominios*). Como el dominio está en la misma cuenta de
   Hostinger, el DNS se configura casi solo. El SSL se activa automáticamente.
7. **Cambiar `NEXT_PUBLIC_SITE_URL`** al dominio definitivo y volver a desplegar.
8. **Apagar Vercel** (o dejarlo unos días como respaldo) una vez verificado todo, y **revocar el
   token de Baserow** que tenía Vercel.

En Supabase y Cloudinary no hay que cambiar nada para el dominio nuevo. Cuando se haga la
recuperación de contraseña por correo, habrá que agregar el dominio en Supabase (*Authentication ›
URL Configuration*).

## Lista de verificación en la URL temporal

- [ ] Inicio: banner rotativo, categorías y línea de portátiles con productos reales
- [ ] `/productos`: búsqueda y filtros; una página de producto con fotos
- [ ] «Estoy interesado» abre WhatsApp con el producto y el número configurado
- [ ] Encabezado y pie con los datos de `/admin/configuracion`
- [ ] `/admin`: entra con correo y contraseña; Productos, Categorías, Banners (subir una imagen),
      Configuración y la Bandeja cargan sin error
- [ ] La Bandeja empieza a contar visitas después de navegar la web
- [ ] `https://<dominio>/api/products` **no** muestra columnas internas (costo, proveedor…)
- [ ] Se ve bien en el celular

## Cómo se actualiza después

Cada cambio al código es un push a `main`: Hostinger lo redespliega solo. Productos, categorías,
banners y datos de la empresa **no** requieren despliegue: se cambian en `/admin` y la web los
toma en menos de un minuto.
