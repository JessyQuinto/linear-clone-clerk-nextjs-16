# 01 — Modelo de Datos

## Principio rector

El núcleo del sistema es PostgreSQL. Cada entidad tiene campos tipados, relaciones explícitas y restricciones de integridad. Las métricas son el resultado natural de consultar este modelo — eso es lo que Notion no puede hacer.

---

## Entidades

### Proyecto (`project`)

Contenedor raíz de toda la jerarquía.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `name` | Texto | Nombre del proyecto |
| `description` | Texto largo | Descripción libre |
| `created_at` | Timestamp | Fecha de creación |
| `created_by` | FK → Usuario | Quién lo creó |

---

### Nodo de jerarquía (`hierarchy_node`)

Los cinco niveles (Idea de negocio, Problema, Iniciativa, Solución, Slice) se almacenan en una sola tabla auto-referencial. Una tabla por nivel duplicaría consultas y haría imposible preguntar "todos los nodos de un proyecto en cualquier nivel" sin UNION.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `project_id` | FK → Proyecto | Proyecto al que pertenece |
| `parent_id` | FK → Nodo (nullable) | Nodo padre; null si es raíz |
| `level` | Enum | `idea` / `problem` / `initiative` / `solution` / `slice` |
| `name` | Texto | Nombre del nodo |
| `description` | Texto largo | Descripción libre |
| `status_id` | FK → Estado | Estado actual |
| `owner_id` | FK → Usuario (nullable) | Responsable asignado |
| `estimated_start` | Fecha (nullable) | Solo aplica a `slice` |
| `estimated_end` | Fecha (nullable) | Solo aplica a `slice` |
| `created_at` | Timestamp | Fecha de creación |
| `created_by` | FK → Usuario | Quién lo creó |

---

### Estado (`status`)

Registros configurables con ámbito por nivel. No son un enum global.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `name` | Texto | Nombre visible (ej. "En curso") |
| `color` | Hex | Color de etiqueta en UI |
| `applicable_levels` | Array de Enum | Niveles donde este estado aplica |
| `sort_order` | Entero | Orden de aparición en UI |
| `is_terminal` | Booleano | Si marca fin del ciclo de vida |

Ver doc `02` para la lista de estados por nivel y sus transiciones.

---

### Dependencia entre nodos (`node_dependency`)

Relación tipada entre dos nodos. Solo entre slices (ver doc `02`).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `from_node_id` | FK → Nodo | Nodo origen |
| `to_node_id` | FK → Nodo | Nodo destino |
| `type` | Enum | `blocks` / `blocked_by` / `related_to` |
| `created_at` | Timestamp | Fecha de creación |

**Restricciones:** `from_node_id ≠ to_node_id`. Detección de ciclos en capa de aplicación antes de insertar. `blocks` y `blocked_by` son tipos distintos para permitir consultas bidireccionales con significado semántico claro.

---

### Documento (`document`)

Un documento puede estar vinculado a un nodo, directamente a un proyecto, o ser transversal.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `title` | Texto | Título del documento |
| `content` | Texto largo | Contenido actual (borrador de trabajo). Markdown serializado. |
| `node_id` | FK → Nodo (nullable) | Nodo al que pertenece; null si es transversal |
| `project_id` | FK → Proyecto (nullable) | Proyecto al que pertenece; null si es transversal |
| `doc_type` | Enum | `spec` / `design` / `runbook` / `adr` / `retro` / `meeting_note` / `guide` / `other` |
| `is_cross_cutting` | Booleano | True si es transversal (guías, estándares, onboarding) |
| `tags` | Texto[] | Etiquetas de texto libre para filtrado (usado principalmente en docs transversales) |
| `content_hash` | Texto | SHA-256 del contenido actual. Permite detectar cambios sin re-leer el contenido completo. |
| `created_at` | Timestamp | Fecha de creación |
| `created_by` | FK → Usuario | Autor principal |
| `updated_at` | Timestamp | Última modificación del contenido |

**Restricciones:**
- Si `is_cross_cutting = true`, tanto `node_id` como `project_id` deben ser null.
- Si `is_cross_cutting = false`, al menos `project_id` debe estar presente.

**Sobre `content`:** este campo contiene siempre el borrador de trabajo actual. Cuando el usuario hace un checkpoint (ver doc `04`), el contenido de este campo se copia a `document_version` como snapshot inmutable. Los guardados automáticos actualizan `content` directamente sin crear versión.

**Sobre `content_hash`:** se recalcula en cada guardado. Permite al Cambio 2 detectar documentos modificados para re-indexado sin leer el contenido completo (ver doc `06`).

**Sobre `tags`:** array nativo de PostgreSQL (`text[]`). Se usa para organizar y filtrar documentos transversales. Ver doc `04` para detalles de uso.

---

### Versión de documento (`document_version`)

Snapshot inmutable del contenido en un momento dado.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `document_id` | FK → Documento | Documento al que pertenece |
| `version_number` | Entero | Número secuencial de versión |
| `content` | Texto largo | Snapshot del contenido en ese momento |
| `checkpoint_note` | Texto (nullable) | Nota opcional del autor al guardar |
| `created_at` | Timestamp | Momento del checkpoint |
| `created_by` | FK → Usuario | Quién guardó la versión |

Ver doc `04` para la política de versionado y el mecanismo de conflictos.

---

### Definición de indicador (`indicator_definition`)

Configuración serializada de lo que calcula un indicador. No es SQL: es una descripción estructurada que el motor traduce a SQL en tiempo de ejecución.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `name` | Texto | Nombre del indicador (ej. "Slices completados por semana") |
| `description` | Texto (nullable) | Qué mide este indicador |
| `definition` | JSONB | Gramática serializada (ver doc `03`) |
| `created_by` | FK → Usuario | Quién lo creó |
| `created_at` | Timestamp | Fecha de creación |
| `last_evaluated_at` | Timestamp (nullable) | Última materialización |

---

### Dashboard (`dashboard`)

Colección ordenada de widgets, cada uno vinculado a un indicador.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `name` | Texto | Nombre del dashboard |
| `owner_id` | FK → Usuario | Quién lo creó |
| `is_shared` | Booleano | Si es visible para todo el equipo |
| `created_at` | Timestamp | Fecha de creación |

---

### Widget de dashboard (`dashboard_widget`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `dashboard_id` | FK → Dashboard | Dashboard al que pertenece |
| `indicator_id` | FK → Indicador (nullable) | Indicador que alimenta este widget. Null para widgets Kanban. |
| `viz_type` | Enum | `table` / `bar` / `line` / `progress` / `donut` / `kanban` |
| `config` | JSONB | Configuración de visualización (colores, ejes, agrupación, o nivel/proyecto para Kanban) |
| `position_x` | Entero | Columna en el grid |
| `position_y` | Entero | Fila en el grid |
| `width` | Entero | Ancho en unidades de grid |
| `height` | Entero | Alto en unidades de grid |

**Sobre widgets Kanban:** el widget Kanban no usa un indicador — muestra nodos directamente. Su `config` define qué proyecto y nivel visualiza. Ver doc `05` para la distinción entre Kanban de navegación y Kanban de dashboard.

---

### Usuario (`user`)

Modelo mínimo. Sin RBAC en el Cambio 1. Mecanismo de autenticación definido en doc `06`.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `name` | Texto | Nombre completo |
| `email` | Texto (unique) | Email único |
| `role` | Enum | `engineer` / `pm` (informativo, sin permisos diferenciales) |
| `created_at` | Timestamp | Fecha de incorporación |

---

## Diagrama de relaciones

```
Usuario
  ├─── crea ──────────────────▶ Proyecto
  ├─── es responsable de ─────▶ Nodo de jerarquía
  ├─── crea ──────────────────▶ Documento
  ├─── crea ──────────────────▶ Versión de documento
  ├─── crea ──────────────────▶ Definición de indicador
  └─── posee ─────────────────▶ Dashboard

Proyecto
  ├─── contiene ──────────────▶ Nodo de jerarquía (múltiples)
  └─── contiene ──────────────▶ Documento (múltiples)

Nodo de jerarquía
  ├─── tiene padre ───────────▶ Nodo de jerarquía (auto-referencial)
  ├─── tiene estado ──────────▶ Estado
  ├─── tiene dependencias ────▶ Dependencia entre nodos
  └─── tiene documentos ──────▶ Documento (múltiples)

Documento
  └─── tiene versiones ───────▶ Versión de documento (múltiples)

Definición de indicador
  └─── alimenta ──────────────▶ Widget de dashboard (múltiples)

Dashboard
  └─── contiene ──────────────▶ Widget de dashboard (múltiples)
```

---

## Escala de referencia

Con el volumen actual (50 usuarios, 50 proyectos), las vistas SQL estándar son suficientes para todos los indicadores. No se necesitan vistas materializadas ni caché en el Cambio 1. Umbral para revisitar: ~500 nodos activos con indicadores cruzando múltiples proyectos y niveles.
