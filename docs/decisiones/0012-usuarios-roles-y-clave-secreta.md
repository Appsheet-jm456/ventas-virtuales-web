# 0012 · Usuarios, roles editables y clave secreta en el servidor

**Estado:** Aceptada · 4 nov 2026 · HU-34

## Contexto

El panel lo usarán varias personas (Dueños, Encargados, Vendedores y otros) y antes cualquier usuario
autenticado podía escribir en todo. El dueño pidió un **Superadmin que cree roles y permisos**, no
una lista fija. Supabase no tiene correo propio configurado: solo 2 correos por hora y únicamente
a miembros del proyecto.

## Decisión

- Tres tablas nuevas: **`roles`**, **`rol_permisos`** (módulo y nivel `ver` o `editar`) y **`perfiles`**
  (persona, rol, activo, historial).
- **Superadmin:** acceso total y único que crea, cambia o elimina roles. Su rol no se edita, y un
  disparador en la base impide quedarse sin un Superadmin activo.
- **Doble verificación:** cada ruta del panel comprueba el permiso (`lib/permisos.js`) y la RLS lo
  repite con `panel_puede()`. Ocultar un botón nunca es el único control.
- **`SUPABASE_SECRET_KEY` se usa en la web, solo en el servidor** (`lib/supabase-admin.js`), para
  administrar usuarios y roles, y para comprobar si una imagen está en uso antes de borrarla. Sustituye
  lo dicho en 0009 sobre no usarla. `perfiles`, `roles` y `rol_permisos` no tienen reglas de escritura:
  solo se cambian por esa vía.
- **Acceso de personas nuevas: enlace de un solo uso** que el panel genera y el administrador envía por
  WhatsApp. El token va después del `#`, no llega al servidor, y se usa al pulsar el botón, para que la
  vista previa de WhatsApp no lo gaste. Vence en 1 hora. Sin servicio de correo.
- **Quitar acceso = desactivar** (perfil inactivo + bloqueo en Supabase Auth). Solo se elimina a quien
  nunca entró.
- **Nosotros** se guarda en `configuracion`, pero se protege con el permiso «Políticas y Nosotros».

## Consecuencias

- Vercel y Hostinger necesitan `SUPABASE_SECRET_KEY`; sin ella el módulo Usuarios avisa que falta y el
  resto del panel sigue funcionando.
- Un rol nuevo (por ejemplo Despacho) no requiere programar, salvo que necesite un módulo nuevo.
- Agregar un módulo al panel exige sumarlo a `lib/modulos.js` y a la restricción de `rol_permisos`.
- Si más adelante se configura correo (SMTP), se puede enviar el mismo enlace por correo.
- Reversa disponible en `supabase/reversas/20261104120000_usuarios_roles.down.sql`.
