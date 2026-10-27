# Flujo de desarrollo

> Cómo se trabaja una mejora o un bug de principio a fin. Aplica al Camino 1 (landing) y, cuando
> arranque, al Camino 2. Si este flujo cambia, cambia primero aquí.

---

## 1. Tres herramientas, una sola fuente de verdad

| Herramienta | Papel | Quién la toca |
|---|---|---|
| **Git** (`docs/notion/tareas.csv`, `docs/sdlc/`) | **Fuente de verdad**: historias, criterios, decisiones y estado | Claude, al cerrar cada bloque |
| **Notion** (base Tareas) | Tablero del día a día | El dueño y Claude |
| **EDT en Google Sheets** (pestaña «EDT detallada») | Mapa completo y avance por fase. **Solo lectura** | Se regenera desde `tareas.csv` |
| **Servidor de prueba** (puerto 3100, Playwright, `npm run build`) | Verificar lo hecho | Claude prueba; el dueño aprueba |

Reglas:

1. Un estado se cambia en `tareas.csv` (o en Notion, y Claude lo trae a git antes de sincronizar).
   **Nunca se edita a mano en la EDT.**
2. Notion se sincroniza fila a fila: `python3 docs/notion/sincronizar.py --tareas`. Solo cambian las
   filas que cambiaron.
3. La EDT se refresca cuando el dueño dice «refresca la EDT»: Claude corre
   `python3 docs/notion/edt_generar.py` y escribe el resultado en la pestaña.
4. No se abre un cuarto lugar de seguimiento.

EDT: <https://docs.google.com/spreadsheets/d/1-2d4h7N8Thpb3w6lsccwwAsrDzc4yYQQF_DbEmgmMpA/edit>

---

## 2. Ciclo de una mejora o un bug

```
Registrar → Documentar → Implementar → Probar → Aprobar → Cerrar
    ↑                                     │
    └─────────── BUG nuevo ◄──────────────┘
```

| Paso | Qué se hace | Dónde queda |
|---|---|---|
| **Registrar** | Fila `HU-n` (mejora) o `BUG-n` (defecto) con prioridad Alta, Media o Baja | `tareas.csv` → Notion → EDT |
| **Documentar** | Historia con criterios verificables. Un bug: pasos para reproducirlo, resultado esperado y real | `sdlc/2-especificaciones.md` |
| **Implementar** | Un commit por bloque, en español | Git |
| **Probar** | `npm run build` y prueba en navegador (Playwright) de cada criterio. Un bug: primero la prueba que lo reproduce y falla; luego el arreglo la pone en verde | `sdlc/4-pruebas.md` |
| **Aprobar** | El dueño prueba en el servidor y aprueba | Nota con fecha en la tarea |
| **Cerrar** | Estado Hecha, `CHANGELOG.md`, sincronizar Notion y refrescar la EDT | Los tres |

Si al probar aparece otro defecto, se abre un `BUG-n` ligado a la historia y la historia no se
cierra hasta resolverlo.

---

## 3. Definición de «Hecho»

Una historia está Hecha solo si:

- `npm run build` compila.
- Cada criterio de aceptación tiene una prueba que pasa.
- El dueño la aprobó en el servidor de prueba.
- Los documentos están al día: especificación, `PENDIENTES.md` y `CHANGELOG.md`.
- Notion y la EDT reflejan el estado.

---

## 4. Clasificación de bugs

| Nivel | Qué es | Cuándo se arregla |
|---|---|---|
| **Crítico** | La web no carga, se expone un dato interno o falla el cierre por WhatsApp | De inmediato, antes de cualquier otra cosa |
| **Alto** | Falla una función principal (filtros, panel, subida de fotos) | En el siguiente bloque |
| **Medio** | Falla con salida alternativa o error visual notorio | Dentro de la semana |
| **Bajo** | Texto o detalle estético | Se agrupa con otra historia |

La prioridad de la tarea (Alta, Media, Baja) sale del nivel: Crítico y Alto → Alta; Medio → Media;
Bajo → Baja. El nivel va en las Notas, al principio: `[Crítico]`, `[Alto]`, `[Medio]` o `[Bajo]`.

---

## 5. Ritmo de trabajo

- **Al empezar la sesión:** leer `docs/PENDIENTES.md`, `git fetch` y revisar si el dueño cambió algo en
  Notion.
- **Durante:** un bloque a la vez, solo la historia en curso.
- **Al cerrar el bloque:** commit, prueba y actualización de `tareas.csv`.
- **Al cerrar la sesión:** `PENDIENTES.md` deja claro el siguiente paso. Sin push hasta que el dueño
  lo ordene.
- **Cada semana, o cuando el dueño lo pida:** refrescar la EDT y resumir avance, bugs abiertos y qué
  bloquea la salida.

---

## 6. Condiciones para salir en línea

Antes de mover el dominio a producción deben estar cerradas las tareas de la Fase 5
([sdlc/5-despliegue.md](./sdlc/5-despliegue.md)): publicar en `main`, contraseña de pruebas cambiada,
límites de Hostinger conocidos, Cloudflare, cabeceras, límite de peticiones, verificación en dos pasos,
alerta de caída, prueba de carga y revisión legal de las políticas. **Un bug Crítico o Alto abierto
bloquea la salida.**

---

## 7. Cómo se ven los bugs y las mejoras en la EDT

- `7 · Bugs y mejoras` agrupa lo que nace después de la planificación.
  - `7.1 Bugs abiertos`: todas las filas `BUG-n`.
  - `7.2 Mejoras nuevas`: las `HU-n` que aún no tienen entregable propio.
- Cuando una historia nueva pertenece claramente a un entregable existente (por ejemplo, a «Panel de
  administración»), se agrega a ese entregable en `docs/notion/edt_generar.py`.

---

## 8. Lo que no se hace

- Editar estados a mano en la EDT.
- Cerrar una historia «casi lista» sin su prueba.
- Corregir un bug sin registrarlo.
- Hacer push sin la orden del dueño.
