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

## Resistencia ante tráfico alto y ataques

**Pregunta que origina la tarea:** ¿qué pasa si entran 100.000 personas o si alguien ataca la web, y cómo se
diseña para que lo soporte con Hostinger y el dominio propio?

**Idea de diseño:** cachear en capas para que casi ninguna visita llegue al servidor ni a la base de datos.

```
Visitante → Cloudflare (caché + WAF) → Hostinger (Next.js) → Supabase
              absorbe 90–99 %            solo lo que falta       casi nada
```

**Ya cubierto por el diseño:** la RLS impide escribir sin sesión; la clave secreta de Supabase no se usa
en la web; la API pública no expone costo ni proveedor (RN-04); las fichas no admiten HTML; el repositorio
no tiene secretos; el cron diario evita la pausa del plan gratuito de Supabase.

**Por hacer, en este orden** (cada punto es una tarea en `tareas.csv`):

1. **Límites del plan de Hostinger Web Apps** (CPU, RAM, peticiones simultáneas, qué pasa al excederse).
   Decide si alcanza o si hay que pasar a un VPS. Bloquea el resto.
2. **Cloudflare gratis delante del dominio:** DNS en Cloudflare, caché, protección DDoS, WAF y modo «Under Attack».
3. **Cabeceras:** `Cache-Control: s-maxage` en las páginas públicas y de seguridad (CSP, HSTS,
   X-Frame-Options) en `next.config.js`.
4. **Límite de peticiones** en `/api/eventos`, `/api/products`, `/api/admin/*` y el inicio de sesión del panel.
5. **Dos pasos (MFA) para el dueño** en Supabase Auth, además de cambiar `Admin123*`.
6. **Alerta de caída** (UptimeRobot u otra) y **prueba de restauración** de la copia diaria de Supabase.
7. **Prueba de carga** (k6) contra la URL temporal antes de mover el dominio.
8. **Planes de Supabase y Cloudinary:** revisar límites de conexiones y ancho de banda; subir de plan si hay un
   lanzamiento fuerte.

Además, `npm audit` y actualizar `next` con frecuencia.

**Criterio de cierre:** páginas públicas servidas desde caché de Cloudflare, límites activos en las rutas
que escriben, panel con dos pasos, alerta de caída funcionando y una prueba de carga documentada en
`sdlc/4-pruebas.md`.

**Pregunta abierta:** si el plan de Hostinger no alcanza, ¿se sube a VPS o se usa otro hosting durante las
campañas? Se responde con el punto 1 (decisión 0006 revisable).

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
