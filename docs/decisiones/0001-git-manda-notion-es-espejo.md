# 0001 · Git manda, Notion es el espejo

**Estado:** Aceptada · 12 oct 2026

## Contexto

La tienda se construyó sin estructura: había código pero no brief, reglas, fases ni tareas. Se
adopta el mismo esquema que ya funciona en Futur Green y ClaudePyme Restaurante.

## Decisión

- **Git es la fuente de verdad** del código, el brief, las reglas, las decisiones y las fases.
- **Notion es el espejo** para leer y comentar sin abrir una terminal, y es donde vive el
  **estado** de las tareas (tablero).
- `docs/notion/sincronizar.py` copia de git a Notion. Nunca al revés.
- **En Notion solo se modifican los bloques que cambiaron**; nunca se reescribe un documento
  completo (el dueño, 12 oct 2026).

## Alternativas descartadas

**Solo Notion** — sin diff ni fecha por cambio; en semanas no se sabe qué versión es la buena.

**Solo git** — el tablero y los comentarios del día a día son más cómodos en Notion.

## Consecuencias

- Cambiar el brief = editar `docs/00-BRIEF.md`, commit y `sincronizar.py --todo`.
- Lo que se edite a mano en el texto del brief en Notion se pierde en la siguiente
  sincronización. Los comentarios y el tablero sí se conservan.
