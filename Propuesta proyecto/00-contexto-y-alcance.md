# 00 — Contexto y Alcance

## Qué es Panel STyT

Panel STyT es una plataforma interna de gestión de proyectos y documentación técnica para los equipos de ingeniería y producto de STyT.

El sistema permite:

- **Organizar proyectos** desde la idea inicial hasta las unidades de trabajo ejecutables, usando una jerarquía de 5 niveles que refleja cómo el equipo piensa los proyectos: desde una idea de negocio hasta el slice concreto que un ingeniero va a implementar.
- **Escribir y versionar documentación técnica** — specs, diseños, ADRs, runbooks, retrospectivas — vinculada directamente a los proyectos y nodos de la jerarquía donde es relevante.
- **Construir indicadores personalizados sin código** — un PM puede definir métricas como "slices completados por semana" o "% de avance del proyecto" desde una interfaz visual, sin escribir SQL ni depender de un ingeniero.
- **Visualizar el estado del trabajo en dashboards configurables** — con gráficos, tablas, barras de progreso y vistas Kanban que se alimentan de los indicadores definidos.

### Para quién es

Usuarios internos: ingenieros y PMs del equipo de STyT. No es una herramienta para clientes, gerencia general ni toda la empresa.

### Qué reemplaza

Notion. El equipo actualmente usa Notion para documentación y seguimiento, pero Notion tiene dos limitaciones que Panel STyT resuelve:

---

## Por qué se reemplaza Notion

Dos problemas concretos impulsan el cambio:

1. **Métricas personalizadas imposibles.** Notion no tiene modelo relacional — construir indicadores y KPIs sobre su esquema requiere workarounds que se rompen con cada cambio.
2. **Integración con asistente fallida.** Un bot previo de Telegram conectado al MCP de Notion falló porque el asistente peleaba con el esquema de Notion en lugar de consultar uno nativo.

---

## Secuenciación

| Cambio | Contenido | Estado |
|---|---|---|
| **Cambio 1** (esta propuesta) | Repositorio de documentación, jerarquía de proyectos, constructor de indicadores, dashboards | En propuesta |
| **Cambio 2** (posterior) | Asistente conversacional con RAG y NL→SQL | Diferido |

---

## Alcance del Cambio 1

### En alcance

- Repositorio relacional para proyectos y documentos (entidades tipadas, vistas SQL para métricas).
- Jerarquía de proyecto de 5 niveles: `Idea de negocio` → `Problema` → `Iniciativa` → `Solución` → `Slice`.
- Propiedades de nodo: estados semánticos por nivel, responsable, fechas estimadas (solo slices), dependencias entre slices.
- Gestión documental: Markdown + texto enriquecido, versionado manual con checkpoints, documentos vinculados a proyecto y documentos transversales con etiquetas.
- Constructor de indicadores sin código: conteos, agrupaciones, tendencias temporales, fórmulas simples.
- Dashboards configurables: widgets sobre indicadores (tablas, gráficos, barras de progreso, donuts) + vista Kanban.
- Inicio limpio: sin migración de Notion.

### Fuera de alcance

| Excluido | Razón |
|---|---|
| Asistente conversacional / RAG / NL→SQL | Cambio 2. |
| Permisos / RBAC | Acceso plano: todos ven todo. |
| Comentarios en documentos | Complejidad de UI sin valor suficiente en v1. |
| Notificaciones | Requiere infraestructura de mensajería no justificada aún. |
| Migración desde Notion | Inicio limpio; el equipo re-carga lo necesario. |
| Bot de Telegram | Depende del asistente (Cambio 2). |
| Tareas por debajo de slices | El slice es la unidad mínima de trabajo. |
| Imágenes embebidas en documentos | Se evalúa post-lanzamiento. |
| Diff visual entre versiones | Comparación manual; diff en iteración posterior. |
| Carpetas para documentos transversales | Etiquetas suficientes con <50 docs transversales. |
| Exportación de dashboards / modo presentación | No justificado para herramienta interna. |
| Edición colaborativa en tiempo real (CRDT) | Bloqueo optimista es suficiente para el volumen actual. |

---

## Decisiones clave

| # | Decisión |
|---|---|
| 1 | **Usuarios:** Ingeniería + PMs. No gerencia, no toda la empresa. |
| 2 | **Documentos soportados:** specs, diseños, APIs, runbooks, ADRs, retros, notas de reunión, guías, onboarding. |
| 3 | **Relación doc→proyecto:** la mayoría de docs atados a un proyecto; unos pocos son transversales sin proyecto. |
| 4 | **Indicadores:** construidos desde UI por un PM, sin código ni SQL. |
| 5 | **Complejidad:** el constructor de indicadores es el componente más complejo — requiere diseño cuidadoso y gramática acotada. |
| 6 | **Jerarquía:** 5 niveles, todos opcionales. Un equipo puede empezar en cualquier nivel. |
| 7 | **Estados:** semánticos por nivel, no un enum global compartido. |
| 8 | **Versionado:** manual con checkpoints explícitos, no automático por cada guardado. |
| 9 | **Concurrencia:** bloqueo optimista con `updated_at`, no edición en tiempo real. |
| 10 | **Autenticación:** definida en doc `06` (sección de autenticación). Sin RBAC en v1. |
| 11 | **Stack:** opciones y recomendación en doc `06`. Requiere aprobación antes de specs. |

---

## Riesgos

| Riesgo | Prob. | Mitigación |
|---|---|---|
| Deriva de alcance del constructor de indicadores (fórmulas + temporal + group-by en una sola UI) | Alta | Gramática mínima desde el día uno; lo que no está en la gramática queda fuera. Fase de diseño dedicada. |
| Stack sin decidir bloquea contratos concretos de datos | Media | Decidir stack ANTES de iniciar specs. Ver doc `06`. |
| Seam del Cambio 2 mal dimensionado (modelo demasiado rígido o híbrido prematuro) | Media | Campos de preparación para RAG incluidos desde el Cambio 1 (`tags`, `content_hash`). No se construye infraestructura de IA. |
| Crecimiento de no-objetivos (comentarios, permisos, notificaciones) | Baja | Lista de exclusiones explícita. Se rechaza cualquier requisito fuera del alcance documentado. |

---

## Dependencias

| Dependencia | Bloqueante para |
|---|---|
| Aprobación del stack (doc `06`) | Especificaciones de contratos de datos |
| Definición del mecanismo de autenticación (doc `06`) | Implementación del modelo de usuario |

---

## Estructura de esta propuesta

| Doc | Contenido |
|---|---|
| `00` | Este documento: contexto, alcance, riesgos |
| `01` | Modelo de datos: entidades, campos, relaciones |
| `02` | Jerarquía y estados: niveles, estados por nivel, transiciones, dependencias |
| `03` | Constructor de indicadores: gramática, materialización, UX del constructor |
| `04` | Documentos y versionado: tipos, formato, versionado, concurrencia |
| `05` | Dashboards: widgets, layout, flujo de uso |
| `06` | Arquitectura y stack: monolito modular, opciones de stack, autenticación, preparación Cambio 2 |
| `07` | Criterios de éxito: 22 criterios verificables con umbrales |

---

## Criterios de éxito (resumen)

Ver doc `07` para los 22 criterios detallados. Los 4 criterios principales:

1. Un PM crea un proyecto con la jerarquía completa y configura estado/responsable/fechas sin código.
2. Un PM construye un indicador personalizado desde la UI y lo ve en un dashboard sin código.
3. Los documentos se redactan, versionan y vinculan a proyectos o se marcan como transversales.
4. Los dashboards renderizan múltiples tipos de visualización usando indicadores definidos.
