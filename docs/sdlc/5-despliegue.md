# Fase 5 · Despliegue

**Estado:** 🟡 En curso (Camino 1 · landing) · **Abierta:** 13 oct 2026

> Pone la landing en Hostinger Web Apps, con el dominio propio y datos reales. Decisión 0006.

## Criterio de cierre

- [ ] Inventario de Baserow actualizado
- [ ] La rama de producción (`main`) trae el rediseño y la lista blanca de columnas
- [ ] Web App creada en Hostinger y conectada al repositorio
- [ ] Variables de entorno cargadas: `BASEROW_API_TOKEN`, `BASEROW_TABLE_ID`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL`
- [ ] Prueba en la URL temporal: catálogo, producto, WhatsApp, `/admin` y fotos
- [ ] Dominio asociado y con SSL (candado)
- [ ] Vercel apagado después de verificar

---

## Paso a paso en Hostinger

> Los nombres de los menús pueden variar un poco; si algo no coincide, guíate por el panel.

1. **Subir el código a `main`.** Fusionar el [PR #1](https://github.com/Appsheet-jm456/ventas-virtuales-web/pull/1).
   Hostinger despliega desde la rama que se le indique.
2. **hPanel → Sitios web → Web Apps → Empezar.** Elegir **Conectar con GitHub** y autorizar el
   repositorio `Appsheet-jm456/ventas-virtuales-web`, rama `main`.
3. **Configuración de la compilación.** Hostinger detecta Next.js. Verificar:
   - Versión de Node: **18.18 o superior** (20 recomendado)
   - Comando de compilación: `npm run build`
   - Comando de inicio: `npm start` (usa el puerto que asigna Hostinger, `PORT`)
4. **Variables de entorno** (misma pantalla o *Configuración → Variables*):

   | Variable | Valor |
   |---|---|
   | `BASEROW_API_TOKEN` | Token de Baserow con permisos *Create, Update y Delete* |
   | `BASEROW_TABLE_ID` | Número de la tabla (está en la URL de Baserow) |
   | `ADMIN_PASSWORD` | Clave del panel `/admin` (una nueva y larga) |
   | `NEXT_PUBLIC_SITE_URL` | `https://tu-dominio.com` (para las vistas previas al compartir) |

   Son las mismas que hoy tiene Vercel. **No las escribas en GitHub ni en Notion** (decisión 0002).
5. **Desplegar** y abrir la **URL temporal** que da Hostinger. Revisar la lista de abajo.
6. **Asociar el dominio** en la Web App (*Dominios*). Como el dominio está en la misma cuenta de
   Hostinger, el DNS se configura casi solo. El SSL se activa automáticamente.
7. **Cambiar `NEXT_PUBLIC_SITE_URL`** al dominio definitivo y volver a desplegar.
8. **Apagar Vercel** (o dejarlo unos días como respaldo) una vez verificado todo.

## Lista de verificación en la URL temporal

- [ ] El catálogo muestra los productos reales y los filtros funcionan
- [ ] Una página de producto muestra fotos y video
- [ ] El botón de WhatsApp abre el chat con el producto
- [ ] `/admin` pide clave y deja crear, editar, agotar y ocultar
- [ ] `https://<dominio>/api/products` **no** muestra columnas internas (costo, proveedor…)
- [ ] Se ve bien en el celular

## Cómo se actualiza después

Cada cambio al código es un push a `main`: Hostinger lo redespliega solo. El inventario no
requiere despliegue: se cambia en Baserow y la web se refresca en menos de un minuto.
