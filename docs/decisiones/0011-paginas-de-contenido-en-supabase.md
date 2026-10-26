# 0011 · Páginas de contenido (políticas) en Supabase

**Estado:** Aceptada · 26 oct 2026 · HU-26

## Contexto

La web necesita páginas de políticas (garantía, devolución, envíos, términos y condiciones y
privacidad, Ley 1581) que el dueño pueda crear, cambiar, ocultar, ordenar y quitar desde `/admin`
sin pedir cambios de código. Cada una tiene varias secciones con título y texto, y se muestra con
un índice a la izquierda.

## Decisión

- Tabla nueva **`paginas`** en Supabase (decisión 0009): `slug` (dirección, única), `titulo`,
  `estilo` (`acordeon` o `texto`), `orden`, `visible` y `secciones` (JSON: lista de
  `{ titulo, texto }`), con fechas de creación y actualización.
- El texto de cada sección usa el **texto seguro** de HU-29 (párrafos, `**negrita**`, listas y
  subtítulos). **No se guarda ni se interpreta HTML**: React escapa todo.
- **RLS:** el público solo lee las páginas visibles; crear, cambiar y borrar es solo del usuario
  autenticado del panel.
- La web pública las sirve en `/politicas/<slug>` y lista las visibles en la columna **Soporte**
  del pie. Una página oculta responde «no encontrada».
- Los cinco textos iniciales se cargan como **borradores ocultos**: son una base para que el dueño
  o su asesor legal los revisen antes de publicarlos. Claude no los da como texto legal definitivo.

## Consecuencias

- Agregar una política nueva no requiere programar.
- Límites: hasta 40 secciones por página, título de sección de 150 caracteres y texto de 8.000.
- La sección «Preguntas frecuentes» puede reutilizar esta tabla más adelante (HU aparte).
