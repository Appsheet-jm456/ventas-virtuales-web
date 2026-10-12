# 0002 · Secretos fuera del repositorio

**Estado:** Aceptada · 12 oct 2026

## Contexto

El repositorio es **público**. Un secreto que llegue al historial de git queda expuesto para
siempre, aunque después se borre del archivo.

## Decisión

- La app lee sus credenciales de `.env.local` (local) o de las variables del hosting:
  `BASEROW_API_TOKEN`, `BASEROW_TABLE_ID`, `ADMIN_PASSWORD`.
- La sincronización con Notion lee `.env.notion`: `NOTION_TOKEN` y `NOTION_PARENT_PAGE`.
- Ninguno se versiona (`.gitignore`). La plantilla sin valores sí: `.env.notion.example`.
- Ninguna clave se escribe en Notion.

## Consecuencias

- Montar el proyecto en otra máquina: copiar las plantillas y completar los valores.
- La integración de Notion es la misma de Futur Green: basta copiar su `.env.notion`.
