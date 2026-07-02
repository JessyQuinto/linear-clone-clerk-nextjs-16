# Lista Comparativa: Linear Clone vs. Propuesta Panel STyT

> **Contexto:** El backend se rehace con FastAPI + PostgreSQL. Del clone se evalúa qué componentes de **frontend (React)** son reutilizables.

---

## 1. Proyectos y Jerarquía (doc 02)

| Feature | Clone (frontend) | Clone (backend) | Acción |
|---|---|---|---|
| CRUD de proyectos (nombre, descripción, estado, lead, fecha) | ✅ Páginas de proyecto, listado, detalle | ✅ Backend del proyecto | **Reutilizar UI** / Rehacer backend en FastAPI |
| Jerarquía de 5 niveles (Idea → Problema → Iniciativa → Solución → Slice) | ❌ Solo existe parent/child de 2 niveles | ❌ Issues con `parentIssueId` simple | **Construir desde cero** — modelo `hierarchy_node` con campo `level` y validación de niveles |
| Estados semánticos por nivel (distintos para cada nivel) | ❌ Un solo enum global (`backlog`, `todo`, `in_progress`, `in_review`, `done`, `canceled`) | ❌ Enum fijo en schema | **Construir desde cero** — tabla `status` con `applicable_levels`, selectores dinámicos en UI |
| Transiciones de estado validadas | ❌ Cambios libres en UI | ❌ Sin validación | **Construir desde cero** — grafo de transiciones en backend + validación en frontend |
| Vista de árbol (jerarquía anidada colapsable) | ❌ No existe | — | **Construir desde cero** — componente de árbol con nodos colapsables |
| Vista board/Kanban por estado | ✅ Board con drag-and-drop (dnd-kit) | ✅ `sortOrder` en issues | **Refactorizar** — adaptar de issues a `hierarchy_node`, filtrar por nivel y proyecto |
| Dependencias entre slices (blocks/blocked_by/related) | ✅ Panel de relaciones en detalle de issue | ✅ `issueRelations.ts` con normalización y simetría | **Refactorizar** — restringir a nivel Slice, rehacer backend |
| Detección de ciclos en dependencias | ❌ Solo detecta ciclos en jerarquía padre-hijo, no en relaciones blocks/blocked_by | ✅ Parcial (solo en `setParent`) | **Construir** — extender detección de ciclos a dependencias tipo `blocks` |
| Propiedades de Slice (responsable, fechas estimadas) | ✅ Asignado + due date en issues | ✅ `assigneeId`, `dueDate` | **Refactorizar** — renombrar a `estimated_start`/`estimated_end`, restringir a nivel Slice |

---

## 2. Documentos y Versionado (doc 04)

| Feature | Clone (frontend) | Clone (backend) | Acción |
|---|---|---|---|
| CRUD de documentos (título, contenido, tipo, proyecto) | ❌ No existe | ❌ No existe | **Construir desde cero** |
| Editor Markdown + rich text (WYSIWYG) | ❌ No existe (descriptions son texto plano) | — | **Construir desde cero** — integrar TipTap o Lexical |
| Tipos de documento (spec, design, adr, runbook, retro, etc.) | ❌ | ❌ | **Construir desde cero** |
| Documentos transversales (sin proyecto, con etiquetas) | ❌ | ❌ | **Construir desde cero** |
| Etiquetas para docs transversales | ❌ (existe labels para issues, pero diferente concepto) | ❌ | **Construir desde cero** — campo `tags text[]` en PostgreSQL |
| Versionado manual con checkpoints | ❌ | ❌ | **Construir desde cero** — entidad `document_version` |
| Historial de versiones + restauración | ❌ | ❌ | **Construir desde cero** |
| Borrador auto-guardado | ❌ | ❌ | **Construir desde cero** — `document.content` como borrador de trabajo |
| Bloqueo optimista (concurrencia con `updated_at`) | ❌ | ❌ | **Construir desde cero** |
| Indicador visual de edición activa ("Editado por...") | ✅ Existe sistema de presencia (`presence-panel.tsx`) | ✅ `presenceFns.ts` | **Reutilizar concepto** — adaptar presencia de issue a documento |
| Búsqueda por título y contenido | ✅ Existe búsqueda full-text de issues | ✅ `search.ts` con search index | **Refactorizar** — adaptar a documentos, usar full-text search de PostgreSQL |

---

## 3. Constructor de Indicadores (doc 03)

| Feature | Clone (frontend) | Clone (backend) | Acción |
|---|---|---|---|
| Gramática de definición (source + operation + output) | ❌ | ❌ | **Construir desde cero** |
| UI del constructor (formulario de 3 pasos) | ❌ | — | **Construir desde cero** |
| Motor de traducción (JSON → SQL parametrizado) | ❌ | ❌ | **Construir desde cero** |
| Operación: conteo (`count`) | ❌ | ✅ Parcial — `countProgress` hardcoded | **Construir desde cero** — generalizar a cualquier entidad/filtro |
| Operación: agrupación (`group_by`) | ❌ | ❌ | **Construir desde cero** |
| Operación: tendencia temporal (`trend`) | ❌ | ❌ | **Construir desde cero** |
| Operación: fórmula (`formula`) | ❌ | ❌ | **Construir desde cero** |
| Preview con datos reales en el constructor | ❌ | — | **Construir desde cero** |
| Almacenamiento de definiciones (JSONB) | ❌ | ❌ | **Construir desde cero** |

---

## 4. Dashboards (doc 05)

| Feature | Clone (frontend) | Clone (backend) | Acción |
|---|---|---|---|
| CRUD de dashboards (personal/compartido) | ❌ | ❌ | **Construir desde cero** |
| Widgets con grid drag-and-drop | ❌ (el board tiene dnd pero es otra cosa) | ❌ | **Construir desde cero** — grid layout con react-grid-layout o similar |
| Widget: tabla | ❌ | — | **Construir desde cero** |
| Widget: barras | ❌ | — | **Construir desde cero** — integrar Recharts |
| Widget: línea | ❌ | — | **Construir desde cero** — Recharts |
| Widget: barra de progreso | ✅ Existe barra de progreso en proyectos | — | **Reutilizar** — adaptar de `progressShape` a indicador genérico |
| Widget: donut | ❌ | — | **Construir desde cero** — Recharts |
| Widget: Kanban (solo lectura en dashboard) | ✅ Parcial — el board existe pero es interactivo | — | **Refactorizar** — crear versión read-only del board |
| Clonado de dashboards | ❌ | ❌ | **Construir desde cero** |
| Persistencia de layout (posición/tamaño) | ❌ | ❌ | **Construir desde cero** |
| Indicador eliminado → widget con error | ❌ | ❌ | **Construir desde cero** |

---

## 5. 🗑️ Lo que se ELIMINA del clone

### 5a. Funcionalidades completas a eliminar

| Qué se elimina | Por qué | Archivos/carpetas afectados |
|---|---|---|
| **AI Agent** (chat, triage, embeddings, herramientas) | Cambio 2 — no se implementa ahora | Módulo de IA (se elimina) |
| **Comentarios** en issues con @menciones | Fuera de alcance en Cambio 1 | Módulo de Comentarios (se elimina) |
| **Attachments** (archivos adjuntos) | Fuera de alcance en Cambio 1 | Módulo de Adjuntos (se elimina) |
| **Ciclos / Sprints** (periodos de tiempo) | No existe en la propuesta de Panel STyT | Módulo de Ciclos (se elimina) |
| **Teams** (equipos con prefijo ENG-42) | La propuesta asume usuarios planos, sin equipos | Módulo de Equipos (se elimina) |
| **Embeddings / Vector search** | Cambio 2 | Búsqueda vectorial (se elimina) |
| **RBAC** (roles admin/member) | Fuera de alcance — acceso plano | Restricciones de roles (se eliminan) |

### 5b. Conceptos de Linear que no existen en Panel STyT

| Concepto de Linear | Equivalente en la propuesta | Acción |
|---|---|---|
| **Issues** (unidad de trabajo plana) | `hierarchy_node` con nivel `slice` | Refactorizar — el issue se convierte en un nodo tipado |
| **Prioridad** (none/urgent/high/medium/low) | No existe en la propuesta | **Eliminar** — los nodos no tienen prioridad, solo estado |
| **Estimación** (story points) | No existe en la propuesta | **Eliminar** — los slices tienen fechas, no puntos |
| **Issue number** con prefijo de team (ENG-42) | No existe — no hay teams | **Eliminar** |
| **Labels** en issues (etiquetas con color) | `tags` en documentos (texto libre) | **Refactorizar** — concepto diferente, destino diferente |
| **Due date** (fecha única) | `estimated_start` + `estimated_end` (dos fechas) | **Refactorizar** — un campo se convierte en dos |
| **Sort order** (ordenamiento fraccional) | No especificado en propuesta | **Decidir** — ¿se necesita ordenamiento manual en board? |
| **Duplicate_of** (tipo de relación) | No existe — solo blocks/blocked_by/related_to | **Eliminar** del enum de relaciones |

### 5c. Decisiones pendientes sobre features existentes

| Feature del clone | Existe | Decisión necesaria |
|---|---|---|
| **Activity log** (historial de cambios por issue) | ✅ Implementado | ¿Se incorpora al alcance? Útil para auditoría, bajo costo adicional. |
| **Onboarding flow** (pantalla para usuario nuevo) | ✅ Implementado | ¿Se adapta para Panel STyT? El doc 07 (criterios) pide pantalla vacía con acción clara. |
| **Command palette** (cmdk — Ctrl+K) | ✅ Implementado | ¿Se conserva? Es un buen UX pattern para navegación rápida. |
| **Dark mode** (via next-themes) | ✅ Implementado | ¿Se conserva? Ya funciona, cero costo. |

---

## 6. Infraestructura — Cambios de stack

| Componente | Clone actual | Propuesta | Acción |
|---|---|---|---|
| Framework frontend | Next.js 16 + React 19 | React + Vite | **Decisión pendiente:** ¿Next.js (ya configurado) o Vite (más simple)? |
| Estilos | Tailwind 4 + Radix + shadcn | No especificado | **Reutilizar** — design system ya montado |
| Backend | — | FastAPI | **Rehacer completo** |
| Base de datos | — | PostgreSQL | **Rehacer completo** — esquema relacional según doc 01 |
| Auth | — | Por definir (doc 06) | **Rehacer** — implementar auth propia |
| Drag and drop | @dnd-kit | No especificado | **Reutilizar** — ya funciona para board |
| Charts | No existe | Recharts (propuesto) | **Agregar** |
| Editor rich text | No existe | TipTap o Lexical | **Agregar** |
| Real-time | — | No especificado | **Decisión pendiente:** ¿se necesita real-time? Si sí, WebSockets |

---

## Resumen por acción

| Acción | Cantidad |
|---|---|
| 🆕 **Construir desde cero** | 28 |
| 🔄 **Refactorizar** (adaptar UI/concepto existente) | 6 |
| ♻️ **Reutilizar** (se conserva con ajustes menores) | 5 |
| 🗑️ **Eliminar** (no aplica a Panel STyT) | 17 |
| ❓ **Decisión pendiente** | 6 |
