# Propuesta: Repositorio de Documentación (Panel STyT — Cambio 1 de 2)

## Intención

Panel STyT reemplaza Notion como el hogar interno para la documentación de ingeniería + PM y el seguimiento de proyectos. Dos problemas de Notion impulsan este cambio: (1) los indicadores / KPIs / métricas personalizados para decisiones de proyecto son difíciles o imposibles de construir en Notion; (2) un bot previo de Telegram conectado al MCP de Notion falló porque el asistente peleaba con el esquema de Notion en lugar de consultar uno nativo.

Este es el **primero de dos cambios secuenciados**. El Cambio 1 entrega el repositorio de documentación estructurada, la jerarquía de proyecto de 5 niveles, el constructor de indicadores personalizados y la visualización en paneles. El Cambio 2 (asistente conversacional) queda diferido.

## Alcance

### En alcance
- Repositorio relacional estructurado primero para proyectos y documentos (entidades tipadas, vistas SQL para métricas).
- Jerarquía de proyecto de 5 niveles: `Idea de negocio` → `Problema` → `Iniciativas` → `Soluciones` → `Slices`.
- Propiedades de slice: conjunto de estados compartido, responsable, fechas estimadas de inicio/fin, dependencias entre slices.
- Gestión documental: Markdown + coautoría simple de texto enriquecido, versionado de documentos, documentos mayormente vinculados a un proyecto con un pequeño conjunto de docs transversales (guías, estándares, onboarding) sin proyecto.
- Constructor de indicadores (el componente MÁS COMPLEJO): UI, sin código. Conteos y agrupaciones por estado / responsable / proyecto / nivel; filtros temporales y tendencias (por ejemplo, "slices completados por semana"); fórmulas personalizadas (sum, avg, % avance, combinaciones).
- Vistas de dashboard: tablas + gráficos básicos (barras, líneas, barras de progreso, donuts) + vista Kanban / board por estado.
- Inicio limpio: sin migración de Notion.

### Fuera de alcance
- Asistente conversacional / RAG / NL→SQL (Cambio 2).
- Permisos / RBAC (acceso plano: todos ven todo).
- Comentarios en documentos.
- Notificaciones.
- Herramientas de migración desde Notion.
- Superficie del bot de Telegram.
- Desglose de tareas por debajo de slices.

## Enfoque

### Modelo de datos: relacional con prioridad estructurada

El problema central con Notion es la imposibilidad de construir indicadores y métricas personalizados. Un modelo relacional (PostgreSQL con entidades tipadas + vistas SQL) hace que los indicadores sean nativos: conteos, agregaciones, group-by, tendencias temporales y fórmulas personalizadas son operaciones SQL, no una capa ad hoc reinventada sobre un almacén de documentos.

Se consideraron y descartaron dos alternativas para la primera versión:

- **Primero documentos (Markdown + frontmatter):** muy amigable para RAG y simple, pero calcular métricas a través de muchos documentos requiere construir una capa de índice/consulta, lo que en la práctica equivale a reinventar una base de datos. La agregación cruzada de documentos (por ejemplo, "slices completados por proyecto por semana") es débil. Ese es el mismo problema que hizo insuficiente a Notion.
- **Híbrido (relacional + almacén de documentos + índice vectorial):** es el modelo más sólido a largo plazo, pero trae más piezas de las que necesita la primera versión. El núcleo relacional se construye ahora; el almacén de documentos y el índice vectorial se agregan después como un cambio separado (Cambio 2 para el índice vectorial; un seguimiento para documentos libres si hace falta).

**Decisión:** empezar con el modelo relacional estructurado, diseñado para que el almacén de documentos y el índice vectorial puedan agregarse más adelante sin rearmar el modelo de proyecto.

### Arquitectura: monolito modular

Un monolito modular: un backend con módulos internos (`projects`, `documents`, `indicators`, `dashboards`) que comparten una sola base de datos. Cada módulo tiene su frontera e interfaz; el módulo `assistant` (Cambio 2) encaja después detrás de una interfaz interna.

Se consideraron y descartaron dos alternativas:

- **Separación en dos servicios (API de docs + servicio dedicado de asistente):** aísla cargas de trabajo de IA/embeddings, pero dos desplegables y un contrato entre servicios es sobre-ingeniería para una herramienta interna con un equipo pequeño. La línea para extraer el asistente más adelante se conserva si su perfil de costo/cómputo lo exige.
- **Serverless (SST/Lambda):** encaja con el ecosistema vecino, pero introduce cold starts (malos para latencia de chat) y una ceremonia de infraestructura prematura para un producto interno greenfield.

**Decisión:** monolito modular ahora, con fronteras explícitas para extraer módulos más adelante si la escala o la carga lo requieren.

### Principios de diseño

- **El modelo de datos va primero.** Según la regla orgánica "IA redacta, el ingeniero diseña": el ingeniero diseña estructuras de datos y contratos; la IA redacta detalle algorítmico una vez que se elige el stack.
- **Opciones de stack + recomendación incluidas** (ver la sección Stack Options más abajo). El ingeniero y los stakeholders toman la decisión final antes de la spec/diseño, porque los contratos concretos dependen de eso.
- **Seam de indicadores.** El constructor emite una representación almacenada/metadatos de la definición de un indicador; se materializa mediante vistas SQL + motor de agregación. Mantener la gramática del constructor pequeña (conteos, group-by, temporal, fórmulas) controla la complejidad: ese es el riesgo explícito.
- **Seam del almacén de documentos.** La primera versión usa registros estructurados con un campo de Markdown/texto enriquecido/tablas; está diseñada para que un almacén de documentos libres separado y un índice vectorial (Cambio 2) puedan agregarse sin rearmar el modelo de proyecto.

## Opciones de stack

> La decisión final la toman el ingeniero y los stakeholders. Estas opciones enmarcan la decisión para aprobación.

### Opción A — Fullstack TypeScript (NestJS + React + PostgreSQL)

- **Backend**: NestJS (estructura modular con DI — los módulos internos `projects`, `documents`, `metrics` se mapean directamente a módulos NestJS)
- **Frontend**: React + Vite (TipTap para texto enriquecido, Recharts para gráficos, react-kanban-dnd para el board)
- **BD**: PostgreSQL (entidades tipadas, vistas SQL para indicadores)
- **Pros**: Un solo lenguaje en todo el stack; ecosistema React muy rico para la primera entrega UI-heavy (editor de texto enriquecido, gráficos, Kanban, todos con librerías maduras); el sistema de módulos de NestJS refleja la arquitectura de monolito modular; un solo desplegable
- **Contras**: El ecosistema de IA/RAG (LangChain.js) es menos maduro que Python, así que el Cambio 2 quizá necesite llamar a un servicio Python para embeddings/RAG avanzados; tooling de ciencia de datos más débil
- **Esfuerzo**: Medio

### Opción B — Python + TypeScript (FastAPI + React + PostgreSQL)

- **Backend**: FastAPI (async, modular, modelos Pydantic, documentación OpenAPI autogenerada)
- **Frontend**: React + Vite (mismo ecosistema que la Opción A: TipTap, Recharts, react-kanban-dnd)
- **BD**: PostgreSQL (vía SQLAlchemy / SQLModel)
- **Pros**: Python tiene el ecosistema MÁS fuerte para IA/RAG (LangChain, LlamaIndex, embeddings, vector stores): el Cambio 2 es un ciudadano de primera clase, no un agregado; FastAPI es ligero y modular (encaja con la arquitectura de monolito con módulos); React cubre la UI compleja; los autodocs aceleran la integración del frontend; el equipo conoce ambos lenguajes
- **Contras**: Dos lenguajes (Python + TS) y dos desplegables (API + SPA): patrón estándar SPA+API pero con más piezas que un stack de un solo lenguaje; contrato entre procesos a mantener
- **Esfuerzo**: Medio

### Opción C — Python Fullstack (Django + PostgreSQL + React islands)

- **Backend**: Django (todo incluido: ORM, admin, auth, migraciones)
- **Frontend**: plantillas Django + HTMX para la mayoría de páginas; React islands solo para componentes interactivos (constructor de indicadores, Kanban, gráficos)
- **BD**: PostgreSQL (vía ORM de Django)
- **Pros**: La forma más rápida de arrancar: Django admin da una UI CRUD funcional desde el día uno para captura temprana de datos; un solo lenguaje (Python); autenticación y migraciones integradas; listo para IA para el Cambio 2; menos ceremonia de infraestructura
- **Contras**: El constructor de indicadores, el Kanban con drag-and-drop y los dashboards con gráficos son altamente interactivos: plantillas Django + HTMX pueden soportarlo parcialmente, pero pelean contra una UX tipo SPA compleja; las React islands agregan un modelo de renderizado mixto (carga cognitiva); es más difícil lograr una experiencia pulida de texto enriquecido + dashboard frente a React puro
- **Esfuerzo**: Bajo-Medio (arranque), pero la complejidad de UI lo vuelve a subir

### Comparación

| Criterio | A: NestJS + React | B: FastAPI + React | C: Django + islands |
|---|---|---|---|
| Complejidad UI (builder, charts, Kanban, rich-text) | Excelente (React nativo) | Excelente (React nativo) | Regular (las React islands pelean con las plantillas Django) |
| Preparación para IA/RAG (Cambio 2) | Regular (LangChain.js, quizá necesite sidecar Python) | Excelente (nativo en Python) | Excelente (nativo en Python) |
| Simplicidad del stack (lenguajes/desplegables) | Buena (1 lenguaje, 1 desplegable) | Regular (2 lenguajes, 2 desplegables) | Buena (1 lenguaje, 1 desplegable) |
| Velocidad de arranque | Media | Media | Rápida (admin listo desde el inicio) |
| Encaje con monolito modular | Bueno (módulos NestJS) | Bueno (routers/módulos FastAPI) | Bueno (apps Django) |

### Recomendación: Opción B (FastAPI + React + PostgreSQL)

**Por qué B:**

1. **El Cambio 2 es una apuesta, no un quizá.** El asistente conversacional de IA es la segunda mitad de este producto. Python tiene el ecosistema más rico para RAG/embeddings/LangChain: construir el asistente de forma nativa en Python es natural, no un agregado. La Opción A probablemente necesitaría un sidecar Python para el Cambio 2, erosionando su ventaja de "un solo lenguaje".
2. **El primer cambio es intensivo en UI.** React tiene el mejor ecosistema para los tres componentes UI más difíciles: edición de texto enriquecido (TipTap/Lexical), dashboards con gráficos (Recharts/Chart.js) y Kanban con drag-and-drop (react-kanban-dnd). Las opciones A y B usan React de forma nativa; la Opción C pelea contra esto.
3. **FastAPI encaja con el monolito modular.** Los routers y la inyección de dependencias de FastAPI se mapean limpiamente a los módulos `projects`, `documents`, `indicators`, `dashboards`. Es ligero (no tiene el peso de Django), async y genera documentación de API que acelera la integración con React.
4. **El equipo conoce ambos lenguajes.** La preocupación por los "dos lenguajes" se mitiga: el equipo ya trabaja con Python + TS/Node (ecosistema vecino). El patrón SPA+API es estándar, no exótico.
5. **PostgreSQL es la BD correcta en cualquier caso.** Relacional, entidades tipadas, vistas SQL para indicadores personalizados y extensión pgvector disponible para los embeddings del Cambio 2: las tres opciones lo usan.

**Tradeoff aceptado:** dos desplegables (FastAPI + SPA React) en lugar de uno. Este es un split estándar de SPA+API, no una arquitectura de microservicios. El backend sigue siendo un monolito modular con módulos internos.

**Si la prioridad cambia a arranque más rápido sobre mejor UI:** la Opción C (Django) obtiene CRUD funcional más rápido, pero la UX del constructor de indicadores y de los dashboards va a pelear con el framework. Solo se recomienda si la complejidad de UI se reduce en una conversación de alcance posterior.

## Decisiones clave (15 supuestos consolidados)

| # | Decisión |
|---|----------|
| 1 | Usuarios: Ingeniería + PMs (no gerencia, no toda la empresa). |
| 2 | Cobertura documental: técnica (specs, diseños, APIs, runbooks); seguimiento de proyectos (estado, responsables, hitos); operativa (notas de reuniones, ADRs, retrospectivas, onboarding). |
| 3 | Modelo de relación: la mayoría de los docs están atados a un proyecto; unos pocos son transversales (guías, estándares, onboarding) sin proyecto. |
| 4 | Indicadores construidos desde UI por un PM, sin código: conteos, group-by (estado / responsable / proyecto / nivel), temporal/tendencias, fórmulas personalizadas (sum, avg, % avance, combinaciones). |
| 5 | El componente más complejo de la primera versión es el constructor de indicadores: requiere diseño cuidadoso. |
| 6 | Jerarquía: Idea de negocio → Problema → Iniciativas → Soluciones → Slices (5 niveles). |
| 7 | Propiedades de slice: estado, responsable, fechas estimadas de inicio/fin, dependencias entre slices. |
| 8 | Conjunto de estados compartido para TODOS los niveles de la jerarquía (por ejemplo, backlog, en curso, en revisión, completado, pausado). |
| 9 | Autoría: Markdown + texto enriquecido, ambos, simple. |
| 10 | Versionado de documentos: incluido en el alcance de la primera versión. |
| 11 | Vistas: tablas + gráficos básicos (barras, líneas, barras de progreso, donuts) + Kanban/board por estado. |
| 12 | No objetivos de la primera versión: sin permisos, sin comentarios, sin notificaciones. |
| 13 | Secuenciación: este es el Cambio 1 de 2; el asistente (Función 2) es un cambio posterior. |
| 14 | Arquitectura: monolito modular, relacional primero, proyectos como entidades tipadas, seam para docs no estructurados más adelante. |
| 15 | Stack: se incluyen opciones + recomendación (ver Stack Options); el ingeniero y los stakeholders toman la decisión final antes de la spec. |

## Capacidades

> Contrato para sdd-spec. No existen specs todavía (`openspec/specs/` está vacío / greenfield): todas las capacidades son NUEVAS.

### Nuevas capacidades
- `projects`: jerarquía de 5 niveles (Idea de negocio → Problema → Iniciativas → Soluciones → Slices), propiedades de slice, dependencias, conjunto de estados compartido.
- `documents`: autoría Markdown + texto enriquecido, vínculo a proyecto, docs transversales (sin proyecto), versionado.
- `indicators`: constructor UI (conteos, group-by, temporal/tendencias, fórmulas personalizadas), evaluación/materialización.
- `dashboards`: vistas (tablas, gráficos, Kanban/board) sobre indicadores y datos de proyecto.

### Capacidades modificadas
Ninguna: greenfield.

## Áreas afectadas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `openspec/specs/projects/spec.md` | Nuevo | Jerarquía de 5 niveles, propiedades de slices, dependencias, estados compartidos. |
| `openspec/specs/documents/spec.md` | Nuevo | Autoría, vínculo, docs transversales, versionado. |
| `openspec/specs/indicators/spec.md` | Nuevo | Capacidades del constructor y seam de materialización. |
| `openspec/specs/dashboards/spec.md` | Nuevo | Vistas de tabla/gráficos/board. |
| `openspec/config.yaml` | Modificado (más adelante) | Stack registrado una vez que el ingeniero lo haya elegido. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|------|------------|------------|
| Deriva de alcance del constructor de indicadores (fórmulas + temporal + group-by en una sola UI) | Alta | Mantener la gramática mínima desde el día uno (conteos, group-by, temporal simple, fórmulas limitadas); dejar fórmulas avanzadas para después. Fase de diseño dedicada y cuidadosa. |
| El stack aún no está elegido: los contratos concretos de datos quedan bloqueados | Media | El ingeniero selecciona el stack ANTES de sdd-spec para que las specs puedan fijar contratos concretos (la regla orgánica dice: el ingeniero diseña estructuras primero). |
| El seam del almacén de documentos queda mal dimensionado: la primera versión es demasiado rígida o invita a un híbrido prematuro | Media | La spec/diseño DEBEN definir el pequeño campo de docs libres (Markdown/texto enriquecido/tablas) y el seam explícito para un futuro almacén de documentos; no construir el híbrido el día uno. |
| Crecimiento de no objetivos (comentarios/notificaciones/permisos) | Baja | No objetivos explícitos arriba; la fase de spec rechaza requisitos que se vayan acumulando. |

## Dependencias

- Aprobación de stakeholders sobre la opción de stack (A/B/C) antes de que sdd-spec pueda especificar contratos concretos de datos.

## Criterios de éxito

- [ ] Un PM puede crear un proyecto a través de toda la jerarquía de 5 niveles (Idea → Problema → Iniciativa → Solución → Slice) y configurar estado/responsable/fechas/dependencias sin tocar código.
- [ ] Un PM puede construir un indicador personalizado (count + group-by por estado/responsable/proyecto/nivel) desde la UI y verlo en una vista de dashboard sin código.
- [ ] Los docs se pueden redactar en Markdown + texto enriquecido, vincular a un proyecto o marcarse como transversales y versionarse.
- [ ] Los dashboards renderizan tablas, gráficos básicos y un Kanban/board por estado usando los mismos indicadores.
- [ ] No hay permisos, comentarios, notificaciones, asistente ni superficie de Telegram en la primera versión.