# 0006 · Hosting: Hostinger Web Apps (Node.js)

**Estado:** Aceptada · 13 oct 2026

## Contexto

La landing es una app Next.js que lee Baserow en el servidor (para que el token no llegue al
navegador) y tiene rutas de API para el panel admin. Necesita un servidor con Node.js: un
hosting solo PHP no sirve. El negocio ya tiene un plan **Web Apps** de Hostinger y el dominio
comprado ahí.

## Decisión

- La landing se despliega en **Hostinger Web Apps** conectando el repositorio de GitHub; cada
  push a la rama de producción redespliega.
- El dominio se asocia desde el mismo hPanel; el SSL lo gestiona Hostinger.
- Las claves (`BASEROW_API_TOKEN`, `BASEROW_TABLE_ID`, `ADMIN_PASSWORD`) van como variables de
  entorno en hPanel (decisión 0002).
- Vercel se mantiene como prototipo hasta verificar el nuevo despliegue, y luego se apaga.

## Consecuencias

- Cada actualización de la web = push a GitHub; no hay subida manual.
- La app debe arrancar con `npm start` en el puerto que Hostinger le asigne (`PORT`).
- Para la tienda completa (Camino 2) habrá que revisar si este plan alcanza o se pasa a un VPS.
