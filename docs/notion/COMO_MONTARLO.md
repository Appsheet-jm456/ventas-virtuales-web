# Cómo está montado en Notion

> Igual que Futur Green y ClaudePyme: `sincronizar.py` crea la estructura completa colgando de
> la misma página padre, con la misma integración.

## El principio que sostiene todo

**Git y Notion no compiten: hacen cosas distintas** (decisión 0001).

| | Manda en | Nunca guarda |
|---|---|---|
| **Git** | Código, brief, reglas, decisiones técnicas, fases | Estados de tareas del día a día |
| **Notion** | Estado de fases, tablero de tareas, bloqueos, comentarios | Código ni la versión buena del brief |

**Regla del dueño (12 oct 2026): en Notion solo se modifican los bloques que cambiaron.** Nunca
se reescribe un documento completo. `sincronizar.py` compara bloque a bloque: lo igual no se
toca, un texto que cambió se edita en su lugar y solo se borra o inserta lo que de verdad sale o
entra.

---

## Estructura

```
📄 Página padre (NOTION_PARENT_PAGE, compartida con Futur Green y ClaudePyme)
└── 🛒 Ventas Virtual — Tienda Web Landing ← one-pager (docs/00-BRIEF.md)
    ├── 🚦 Fases                       ← base de datos (fases.csv)
    ├── ✅ Tareas                      ← base de datos (tareas.csv)
    ├── 🗄️ Modelado de Datos           ← docs/notion_modelado_datos.md
    ├── 📏 Reglas del negocio          ← docs/REGLAS_DEL_NEGOCIO.md
    ├── 📋 Brief del proyecto
    │   ├── 📄 v1.0 — 12 oct 2026      ← copia del brief de cada versión
    │   └── 🧭 Decisiones tecnicas     ← docs/decisiones/
    └── 💻 Codigo del proyecto
        ├── 🏗️ Arquitectura            ← docs/sdlc/1-diseno.md
        ├── 🖥️ Entorno local           ← docs/ENTORNO_LOCAL.md
        └── enlace al repositorio      ← GitHub, NO el código
```

La página padre la comparten varios proyectos con páginas del mismo nombre ("Brief del
proyecto", "Decisiones tecnicas"). Por eso el script **nunca busca por título en todo el
workspace**: baja desde la portada "Ventas Virtual — Tienda Web".

## Crear la estructura (una sola vez)

1. Copiar el `.env.notion` de Futur Green a la raíz de este proyecto.
2. Ensayar y crear:

```bash
python3 docs/notion/sincronizar.py --revisar   # qué haría, sin escribir
python3 docs/notion/sincronizar.py             # lo crea
python3 docs/notion/sincronizar.py --paginas   # agrega Modelado de Datos y Reglas del negocio
```

Si la portada ya tiene sus bases, el script se niega a correr de nuevo: la inicial es una vez.

Lo único que la API de Notion no permite crear son las **vistas**. Hacerlas a mano en Tareas:

| Vista | Cómo | Para qué |
|---|---|---|
| Tablero | *Board* agrupado por Estado | El día a día |
| Bloqueadas | *Table* filtrada por Estado = Bloqueada | Lo que necesita una decisión tuya |
| Por fase | *Board* agrupado por Fase | Ver avance del ciclo |
| Esta semana | *Table* filtrada por Prioridad = Alta y Estado ≠ Hecha | Foco |

---

## Cómo se usa después

| Cambió… | Comando |
|---|---|
| Estado de tareas o fases (`tareas.csv`, `fases.csv`) | `--tareas` — solo las filas que cambiaron |
| Brief, reglas, modelo o decisiones | `--paginas` — solo los bloques que cambiaron |
| Las dos cosas | `--todo` |
| Nueva versión del brief (con autorización del dueño) | `--version` |

Siempre se puede ensayar primero agregando `--revisar`.

**Antes de sincronizar las tareas**, comparar la base de Tareas en Notion con `tareas.csv` y
traer a git lo que el dueño cambió allá, para no pisarlo.

### Al bloquearse una tarea
Moverla a *Bloqueada* y escribir **por qué** en Notas. Una tarea bloqueada sin motivo escrito es
una tarea perdida.

### Al cerrar una fase
1. Marcar todos los criterios de cierre en `docs/sdlc/N-*.md`.
2. Estado de la fase → *Completada* en `fases.csv`; la siguiente → *En curso*.
3. Actualizar la tabla de fases del brief y proponer subir versión.

## Versionado del brief

| Cambio | Sube |
|---|---|
| Corregir una cifra o redacción | nada |
| Cerrar una fase, nuevo hito, riesgo nuevo | menor — `v1.0` → `v1.1` |
| Cambia el alcance, el modelo de negocio o el stack | mayor — `v1.x` → `v2.0` |

Al subir versión: editar versión y fecha en `docs/00-BRIEF.md`, anotar en `docs/CHANGELOG.md`,
commit y `python3 docs/notion/sincronizar.py --version`.
