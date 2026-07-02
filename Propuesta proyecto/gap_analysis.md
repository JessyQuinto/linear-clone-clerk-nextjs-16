# Análisis: Linear Clone vs. Propuesta Panel STyT

## Stack del proyecto base

| Componente | Tecnología |
|---|---|
| **Framework** | Next.js 16 (React 19, App Router) |
| **Backend/BD** | [Convex](https://convex.dev) (BaaS — backend-as-a-service, NoSQL documental, funciones serverless) |
| **Auth** | [Clerk](https://clerk.com) (autenticación + organizaciones + webhooks) |
| **UI** | Tailwind CSS 4, Radix UI, shadcn, Lucide icons |
| **DnD** | @dnd-kit (drag-and-drop para board) |
| **AI** | @convex-dev/agent + OpenAI SDK (embeddings, chat, triage) |
| **Billing** | Planes (free/pro/enterprise) con limits |

> [!CAUTION]
> **Conflicto con la propuesta.** La propuesta recomienda **FastAPI + React + PostgreSQL**. Este proyecto usa **Next.js + Convex (NoSQL)**. Son stacks fundamentalmente diferentes. Convex NO es PostgreSQL — es un BaaS documental sin SQL, sin vistas, sin joins nativos. Esto impacta directamente al constructor de indicadores, que depende de SQL para funcionar.

---

## Mapeo: Funcionalidades del Proyecto Base → Propuesta

### ✅ Lo que ya existe y es reutilizable

| Feature del clone | Mapeo a la propuesta | Estado | Archivos clave |
|---|---|---|---|
| **Proyectos** con nombre, descripción, estado, lead, fecha objetivo | Doc `01` — Entidad `project` | ✅ Implementado | [projects.ts](file:///C:/Users/Jessy/Desktop/Proyecto%20styt/linear-clone-clerk-nextjs-16-main/convex/projects.ts) |
| **Issues** con título, descripción, status, prioridad, asignado, fechas | Doc `01` — Comparable a `hierarchy_node` nivel Slice | ✅ Parcial | [issues.ts](file:///C:/Users/Jessy/Desktop/Proyecto%20styt/linear-clone-clerk-nextjs-16-main/convex/issues.ts), [schema.ts](file:///C:/Users/Jessy/Desktop/Proyecto%20styt/linear-clone-clerk-nextjs-16-main/convex/schema.ts) |
| **Relaciones entre issues** (blocks, blocked_by, related, duplicate) | Doc `02` — Dependencias entre slices | ✅ Implementado (sin detección de ciclos en relaciones, sí en jerarquía) | [issueRelations.ts](file:///C:/Users/Jessy/Desktop/Proyecto%20styt/linear-clone-clerk-nextjs-16-main/convex/issueRelations.ts) |
| **Sub-issues** con jerarquía padre-hijo + detección de ciclos | Doc `02` — Jerarquía auto-referencial | ✅ Implementado (pero solo 2 niveles: parent ↔ child) | [issueRelations.ts L285-L345](file:///C:/Users/Jessy/Desktop/Proyecto%20styt/linear-clone-clerk-nextjs-16-main/convex/issueRelations.ts#L285-L345) |
| **Board/Kanban** con drag-and-drop entre columnas de estado | Doc `02`/`05` — Vista board + Kanban widget | ✅ Implementado | [board-view.tsx](file:///C:/Users/Jessy/Desktop/Proyecto%20styt/linear-clone-clerk-nextjs-16-main/components/board/board-view.tsx) |
| **Labels** (etiquetas con color por organización) | Doc `01`/`04` — Comparable a `tags` en documentos | ✅ Implementado (para issues, no para docs) | [schema.ts L140-L152](file:///C:/Users/Jessy/Desktop/Proyecto%20styt/linear-clone-clerk-nextjs-16-main/convex/schema.ts#L140-L152) |
| **Activity log** (historial de cambios por issue) | No en propuesta, pero útil para auditoría | ✅ Implementado | [activity.ts](file:///C:/Users/Jessy/Desktop/Proyecto%20styt/linear-clone-clerk-nextjs-16-main/convex/activity.ts) |
| **Búsqueda** full-text por título/descripción | Doc `04` — Búsqueda en documentos | ✅ Implementado | [search.ts](file:///C:/Users/Jessy/Desktop/Proyecto%20styt/linear-clone-clerk-nextjs-16-main/convex/search.ts) |
| **Auth con Clerk** (usuarios, organizaciones, roles) | Doc `06` — Autenticación | ✅ Implementado (más completo que lo propuesto: ya tiene org + roles) | [webhooks.ts](file:///C:/Users/Jessy/Desktop/Proyecto%20styt/linear-clone-clerk-nextjs-16-main/convex/webhooks.ts) |
| **Views** guardadas (filtros serializados, personal/compartida) | Doc `05` — Dashboards personales/compartidos | ✅ Parcial (filtros, no dashboards con widgets) | [views.ts](file:///C:/Users/Jessy/Desktop/Proyecto%20styt/linear-clone-clerk-nextjs-16-main/convex/views.ts) |
| **Presencia** (quién está online/viendo qué) | Doc `04` — Indicador visual de edición | ✅ Implementado | [presenceFns.ts](file:///C:/Users/Jessy/Desktop/Proyecto%20styt/linear-clone-clerk-nextjs-16-main/convex/presenceFns.ts), [presence-panel.tsx](file:///C:/Users/Jessy/Desktop/Proyecto%20styt/linear-clone-clerk-nextjs-16-main/components/issue-detail/presence-panel.tsx) |
| **Progreso de proyecto** (conteo de issues por estado) | Doc `03` — Indicador tipo `count` + `group_by` | ✅ Parcial (hardcoded en `countProgress`, no configurable) | [projects.ts L46-L72](file:///C:/Users/Jessy/Desktop/Proyecto%20styt/linear-clone-clerk-nextjs-16-main/convex/projects.ts#L46-L72) |

---

### ❌ Lo que falta construir (en alcance de la propuesta)

| Feature de la propuesta | ¿Existe algo similar? | Esfuerzo estimado |
|---|---|---|
| **Jerarquía de 5 niveles** (Idea → Problema → Iniciativa → Solución → Slice) | ❌ Solo existe parent/child de 2 niveles. No hay niveles tipados con semántica. | **Alto** — Requiere rediseñar el modelo de issues a `hierarchy_node` con campo `level` |
| **Estados semánticos por nivel** | ❌ Hay un solo enum de estados global para todos los issues | **Medio** — Crear tabla `status` con `applicable_levels` |
| **Transiciones de estado validadas** | ❌ Los cambios de estado son libres (cualquier estado a cualquier otro) | **Medio** — Agregar validación en la capa de mutación |
| **Documentos y versionado** | ❌ No existe. Issues tienen `description` (texto plano, sin versionado) | **Alto** — Entidades `document` + `document_version` + editor + versionado completo |
| **Editor Markdown + rich text** | ❌ No hay editor. Las descriptions son texto plano | **Alto** — Integrar TipTap o Lexical con toolbar y serialización |
| **Documentos transversales** | ❌ No existe concepto de documento sin proyecto | **Medio** — Extensión del módulo de documentos |
| **Constructor de indicadores** | ❌ No existe. Solo hay `countProgress` hardcoded | **Muy alto** — Gramática, motor de traducción, UI de 3 pasos, preview |
| **Dashboards con widgets** | ❌ No existe. Las views guardan filtros, no widgets visuales | **Alto** — Entidades `dashboard` + `dashboard_widget` + grid layout + 6 tipos de visualización |
| **Gráficos** (barras, líneas, donut, progreso) | ❌ No hay librería de charts | **Medio** — Integrar Recharts o Chart.js |
| **Bloqueo optimista de documentos** | ❌ No aplica (no hay documentos) | **Medio** — Implementar junto con módulo de documentos |
| **Content hash para seam Cambio 2** | ❌ No existe | **Bajo** — Campo calculado al guardar |

---

### ⚠️ Lo que existe PERO está marcado como "fuera de alcance" en la propuesta

| Feature del clone | Propuesta dice | ¿Qué hacer? |
|---|---|---|
| **Comentarios en issues** (con menciones @usuario) | ❌ Fuera de alcance | Ya implementado con CRUD completo, menciones y activity log. **Decisión: ¿se deja o se quita?** |
| **Notificaciones** (activity feed) | ❌ Fuera de alcance | El activity log existe. No hay push notifications, pero el feed sí. **Decisión: ¿es suficiente?** |
| **RBAC** (admin/member por organización) | ❌ Fuera de alcance (acceso plano) | Clerk ya lo maneja con roles. **Decisión: ¿se simplifica a acceso plano o se aprovecha?** |
| **AI Agent** (chat, triage, embeddings, tools) | ❌ Fuera de alcance (Cambio 2) | Módulo completo con OpenAI, vector search, herramientas. **No activar ahora, pero el código queda.** |
| **Attachments** (archivos adjuntos en issues, hasta 25MB) | ❌ Fuera de alcance (imágenes embebidas) | Implementado con Convex storage. **Decisión: ¿se deja o se quita?** |
| **Ciclos/Sprints** (timeboxed con issues asignados) | No mencionado | Concepto que no existe en la propuesta. **Decisión: ¿se quita o se adapta?** |
| **Teams** (equipos dentro de una org) | No mencionado | La propuesta asume usuarios planos. **Decisión: depende del tamaño del equipo.** |
| **Billing/Plans** (free, pro, enterprise con limits) | No mencionado | No aplica para herramienta interna. **Quitar.** |
| **Embeddings / Vector search** | ❌ Fuera de alcance (Cambio 2) | Ya existe con índice vectorial en Convex. **No activar, pero el campo y el índice quedan.** |

---

## 🔴 Decisión crítica: ¿Convex o PostgreSQL?

Este es el elefante en la sala. La propuesta dice PostgreSQL con SQL views para indicadores. El proyecto base usa Convex (NoSQL).

### Lo que Convex NO puede hacer que la propuesta requiere

| Necesidad de la propuesta | Convex | PostgreSQL |
|---|---|---|
| Vistas SQL para indicadores | ❌ No existe | ✅ Nativo |
| `GROUP BY` + agregaciones | ❌ Solo en memoria (JavaScript) | ✅ Nativo |
| Joins relacionales | ❌ Manual con queries encadenadas | ✅ Nativo |
| Fórmulas con `SUM`, `AVG`, `COUNT` | ❌ Solo en memoria | ✅ Nativo |
| Tendencias temporales (date_trunc, window functions) | ❌ No disponible | ✅ Nativo |
| Vistas materializadas | ❌ No existe | ✅ Nativo |
| pgvector para embeddings (Cambio 2) | ❌ Tiene su propio vector search | ✅ Con extensión |

### Lo que Convex SÍ ofrece y sería costoso rehacer

| Feature | Convex | PostgreSQL + FastAPI |
|---|---|---|
| Real-time (subscriptions reactivas) | ✅ Nativo (cada query es un live query) | ❌ Requiere WebSockets manuales |
| Auth integrado (Clerk) | ✅ Plugin directo | ⚠️ Requiere integración manual |
| File storage (attachments) | ✅ Integrado | ❌ Requiere S3 o similar |
| Serverless functions | ✅ Nativo | ❌ Requiere servidor |
| Zero-config deployment | ✅ `npx convex deploy` | ❌ Docker + CI/CD manual |

### Opciones

**Opción 1 — Migrar a PostgreSQL (como dice la propuesta).**
Requiere rehacer TODO el backend. Se conserva: componentes React, UI de board/Kanban, layout, auth (Clerk se puede usar con cualquier stack). Se pierde: real-time nativo, storage integrado, todo el código de Convex functions (~15 archivos).

**Opción 2 — Quedarse con Convex y adaptar la propuesta.**
El constructor de indicadores se implementa con agregaciones en JavaScript (Convex functions) en lugar de SQL views. Funciona para la escala actual (100 usuarios, 20 proyectos) pero el motor de indicadores es menos potente. El seam del Cambio 2 cambia: Convex tiene su propio vector search, no se usaría pgvector.

**Opción 3 — Híbrido: Convex para CRUD + PostgreSQL para analytics.**
Convex maneja el CRUD en tiempo real (issues, proyectos, docs). PostgreSQL (via Neon o similar) recibe un sync periódico y ejecuta las queries de indicadores. Más complejo, pero aprovecha lo mejor de ambos mundos.

---

## Resumen de cobertura

```
Propuesta doc 01 (Modelo de datos)
  ├── project ──────────────── ✅ Existe
  ├── hierarchy_node ────────── ❌ Rediseñar (issues → nodos con niveles)
  ├── status ────────────────── ❌ Crear (hoy es enum fijo)
  ├── node_dependency ────────── ✅ Existe (issueRelations)
  ├── document ──────────────── ❌ Crear desde cero
  ├── document_version ────────── ❌ Crear desde cero
  ├── indicator_definition ──── ❌ Crear desde cero
  ├── dashboard ─────────────── ❌ Crear desde cero
  ├── dashboard_widget ────────── ❌ Crear desde cero
  └── user ──────────────────── ✅ Existe (más completo, con Clerk)

Propuesta doc 02 (Jerarquía)
  ├── 5 niveles ─────────────── ❌ Solo 2 niveles (parent/child)
  ├── Estados por nivel ────── ❌ Un solo enum global
  ├── Transiciones ─────────── ❌ Libres
  ├── Dependencias ─────────── ✅ Existe
  ├── Detección de ciclos ──── ✅ Existe (en jerarquía padre-hijo)
  └── Vista board ─────────── ✅ Existe

Propuesta doc 03 (Indicadores)  ── ❌ NO EXISTE NADA

Propuesta doc 04 (Documentos)   ── ❌ NO EXISTE NADA

Propuesta doc 05 (Dashboards)   ── ❌ NO EXISTE NADA (hay views pero son filtros)

Fuera de alcance
  ├── Comentarios ─────────── ✅ YA EXISTE
  ├── RBAC ─────────────────── ✅ YA EXISTE (via Clerk)
  ├── AI/RAG ────────────────── ✅ YA EXISTE (módulo agent)
  ├── Attachments ──────────── ✅ YA EXISTE
  └── Activity log ────────── ✅ YA EXISTE
```

---

## Preguntas que necesitan respuesta antes de avanzar

1. **¿Se cambia el stack a PostgreSQL o se queda con Convex?** Esto define TODO lo demás.
2. **Las features "fuera de alcance" que ya existen (comentarios, RBAC, attachments, AI) — ¿se dejan en el código o se eliminan?** Eliminarlas es esfuerzo desperdiciado; dejarlas contradice la propuesta.
3. **¿Se adapta la jerarquía de 5 niveles al modelo de issues+sub-issues existente o se rediseña desde cero?**
4. **¿El constructor de indicadores funciona con agregaciones en JS (Convex) o requiere SQL (PostgreSQL)?** Si requiere SQL, Convex no sirve como backend único.
