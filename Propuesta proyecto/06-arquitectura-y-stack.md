# 06 — Arquitectura y Stack

## Arquitectura: monolito modular

Un solo backend con módulos internos que comparten una base de datos. Cada módulo tiene su frontera e interfaz pública. El módulo `assistant` (Cambio 2) encaja después detrás de una interfaz interna.

### Módulos

| Módulo | Responsabilidad |
|---|---|
| `projects` | CRUD de proyectos, nodos de jerarquía, estados, dependencias |
| `documents` | CRUD de documentos, versionado, búsqueda, etiquetas |
| `indicators` | Constructor de indicadores, motor de traducción a SQL, materialización |
| `dashboards` | CRUD de dashboards, widgets, configuración de layout |
| `users` | Registro, autenticación, perfil mínimo |

### Por qué monolito y no microservicios

- Un solo desplegable de backend. Dos desplegables en total (API + SPA).
- Un equipo pequeño con una herramienta interna no necesita la ceremonia de múltiples servicios ni contratos entre procesos.
- Las fronteras entre módulos están diseñadas para que cualquier módulo pueda extraerse a un servicio independiente si la escala o la carga lo requieren.

### Descartado

| Alternativa | Razón del descarte |
|---|---|
| Microservicios (API docs + servicio de asistente) | Sobre-ingeniería para herramienta interna con equipo pequeño. La línea de extracción se preserva. |
| Serverless (SST/Lambda) | Cold starts perjudican latencia. Ceremonia de infraestructura prematura para un proyecto greenfield. |

---

## Stack: opciones y recomendación

> La decisión final la toman el líder técnico y los stakeholders. Estas opciones enmarcan la decisión para aprobación.

### Opción A — Fullstack TypeScript (NestJS + React + PostgreSQL)

- **Backend**: NestJS (módulos con DI que se mapean a los módulos internos)
- **Frontend**: React + Vite (TipTap para texto enriquecido, Recharts para gráficos, react-kanban-dnd para board)
- **BD**: PostgreSQL
- **Pro**: Un solo lenguaje en todo el stack; ecosistema React maduro para la UI interactiva
- **Contra**: Ecosistema IA/RAG (LangChain.js) menos maduro que Python — el Cambio 2 posiblemente necesite sidecar Python

### Opción B — Python + TypeScript (FastAPI + React + PostgreSQL)

- **Backend**: FastAPI (async, modular, Pydantic, OpenAPI autogenerada)
- **Frontend**: React + Vite (mismo ecosistema que Opción A)
- **BD**: PostgreSQL (vía SQLAlchemy / SQLModel)
- **Pro**: Python tiene el ecosistema más fuerte para IA/RAG; FastAPI es ligero y modular; autodocs aceleran integración
- **Contra**: Dos lenguajes (Python + TS), dos desplegables (API + SPA)

### Opción C — Python Fullstack (Django + PostgreSQL + React islands)

- **Backend**: Django (ORM, admin, auth, migraciones incluidos)
- **Frontend**: Plantillas Django + HTMX + React islands solo para componentes interactivos
- **BD**: PostgreSQL (vía ORM de Django)
- **Pro**: Arranque más rápido (Django admin da CRUD funcional desde el día uno)
- **Contra**: El constructor de indicadores, Kanban y dashboards son altamente interactivos — plantillas + HTMX pelean contra una UX tipo SPA

### Comparación

| Criterio | A: NestJS + React | B: FastAPI + React | C: Django + islands |
|---|---|---|---|
| UI compleja (builder, charts, Kanban, rich-text) | ✅ Excelente | ✅ Excelente | ⚠️ Regular |
| Preparación para IA/RAG (Cambio 2) | ⚠️ Regular | ✅ Excelente | ✅ Excelente |
| Simplicidad del stack | ✅ 1 lenguaje | ⚠️ 2 lenguajes | ✅ 1 lenguaje |
| Velocidad de arranque | Media | Media | Rápida |
| Encaje con monolito modular | ✅ Bueno | ✅ Bueno | ✅ Bueno |

### Recomendación: Opción B (FastAPI + React + PostgreSQL)

**Razones:**

1. **El Cambio 2 es un compromiso, no un quizá.** Python tiene el ecosistema más rico para RAG/embeddings. La Opción A probablemente necesitaría sidecar Python, erosionando su ventaja de "un solo lenguaje".
2. **El Cambio 1 es intensivo en UI.** React tiene el mejor ecosistema para los tres componentes UI más difíciles: texto enriquecido, dashboards con gráficos y Kanban con drag-and-drop.
3. **FastAPI encaja con el monolito modular.** Routers y DI se mapean a los módulos `projects`, `documents`, `indicators`, `dashboards`.
4. **PostgreSQL es la BD correcta en cualquier caso.** Relacional, vistas SQL para indicadores y extensión `pgvector` disponible para el Cambio 2.

**Tradeoff aceptado:** dos desplegables (FastAPI + SPA React). Es un patrón estándar SPA+API, no microservicios.

---

## Autenticación

El Cambio 1 no tiene RBAC, pero sí necesita un mecanismo para identificar quién accede al sistema.

### Mecanismo propuesto

| Aspecto | Decisión |
|---|---|
| Método de login | Email + contraseña con hash (bcrypt/argon2). OAuth opcional si el equipo ya usa un proveedor SSO. |
| Sesión | JWT con expiración configurable. |
| Registro de usuarios | Por invitación o creación manual por un administrador. No hay registro público (herramienta interna). |
| Modelo de permisos | Plano: todos los usuarios autenticados ven y editan todo. El campo `role` (engineer/pm) es informativo. |

> [!NOTE]
> Si el equipo usa un proveedor de identidad corporativo (Google Workspace, Azure AD), OAuth/OIDC es preferible a email+contraseña. Esta decisión se cierra antes de la implementación del módulo `users`.

---

## Modelo de despliegue

| Componente | Despliegue |
|---|---|
| **API (FastAPI)** | Contenedor Docker o servicio en cloud (Railway, Render, EC2). Un solo proceso. |
| **SPA (React + Vite)** | Build estático servido desde CDN o desde el mismo servidor que la API (via proxy reverso). |
| **PostgreSQL** | Instancia gestionada (Neon, RDS, Supabase) o auto-hospedada. |

Entorno mínimo: un servidor + una BD. No hay colas, workers ni servicios adicionales en el Cambio 1.

---

## Preparación para el Cambio 2 (seam)

El Cambio 2 agrega un asistente conversacional (RAG + NL→SQL). Para que no requiera migración de datos, el modelo del Cambio 1 incluye campos de preparación desde el día uno.

### Campos ya incluidos en el modelo (doc `01`)

| Campo | Entidad | Propósito para Cambio 2 |
|---|---|---|
| `doc_type` | `document` | Filtrar por tipo antes de chunking |
| `node_id`, `project_id` | `document` | Ancla semántica para retrieval con contexto de proyecto |
| `tags` | `document` | Filtrado semántico por categoría |
| `content_hash` | `document` | Detectar cambios sin re-leer contenido completo |
| `level` | `hierarchy_node` | Construir prompts con contexto jerárquico |
| `definition` (JSONB) | `indicator_definition` | El asistente puede leer la gramática y generar variantes |

### Legibilidad del esquema para NL→SQL

El asistente NL→SQL necesita entender el esquema para generar queries correctas. Reglas que el esquema del Cambio 1 sigue:

- Nombres de tablas en singular, en inglés (o español uniforme).
- Nombres de columnas descriptivos: `estimated_start` en lugar de `ts1`.
- Toda relación representada como FK en la base de datos.
- Enums almacenados como texto con valores predecibles.

### Endpoint de contexto de esquema

El Cambio 1 provee un endpoint interno que retorna la descripción del esquema:

```
GET /internal/schema-context
```

Respuesta: descripción en texto plano o JSON de tablas, columnas con tipos y relaciones. No es API pública — es contrato interno entre los dos cambios. En el Cambio 1 puede ser un archivo estático generado por las migraciones.

### Vistas SQL para el asistente

Estas columnas calculadas deben existir como vistas SQL desde el Cambio 1:

| Vista / columna | Descripción |
|---|---|
| `slice_completion_rate` | % de slices en estado terminal sobre el total por solución |
| `days_since_last_update` | Diferencia entre `updated_at` y `now()` |
| `is_blocked` | Booleano derivado de dependencias `blocks` sin resolver |

Si solo existen en la capa de aplicación, el asistente NL→SQL no puede incluirlas en queries generadas.

### Qué NO se hace en el Cambio 1

- No se necesita índice vectorial ni `pgvector`.
- No se necesita integración con modelos de lenguaje.
- No se necesita lógica de chunking — solo que los campos de metadata existan.
- El endpoint `/internal/schema-context` puede ser un archivo estático.
