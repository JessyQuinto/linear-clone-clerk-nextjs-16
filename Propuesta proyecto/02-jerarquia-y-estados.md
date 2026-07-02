# 02 — Jerarquía y Estados

## Los cinco niveles

### Niveles y su propósito

| Nivel | Propósito | ¿Obligatorio? |
|---|---|---|
| Idea de negocio | Hipótesis o necesidad detectada, sin definir aún | No |
| Problema | Problema concreto derivado de una idea, con evidencia | No |
| Iniciativa | Agrupación de trabajo para resolver un problema | No |
| Solución | Aproximación técnica o de producto dentro de una iniciativa | No |
| Slice | Unidad de trabajo ejecutable, con responsable y fechas | No |

**Todos los niveles son opcionales.** Un equipo puede empezar directamente en Iniciativa o en Slice sin crear niveles superiores.

### Reglas de la jerarquía

- Un nodo solo puede tener como padre un nodo del nivel inmediatamente superior.
- Un nodo puede existir sin padre si el nivel superior no está definido (raíz del árbol en ese nivel).
- Un proyecto puede tener múltiples raíces en diferentes niveles simultáneamente.
- No hay límite de hijos dentro de un nivel.

### Propiedades por nivel

| Propiedad | Idea | Problema | Iniciativa | Solución | Slice |
|---|---|---|---|---|---|
| Estado | ✓ | ✓ | ✓ | ✓ | ✓ |
| Responsable | ✓ | ✓ | ✓ | ✓ | ✓ |
| Documentos vinculados | ✓ | ✓ | ✓ | ✓ | ✓ |
| Fecha estimada de inicio | — | — | — | — | ✓ |
| Fecha estimada de fin | — | — | — | — | ✓ |
| Dependencias | — | — | — | — | ✓ |

---

## Estados por nivel

Cada nivel tiene su propio conjunto de estados con significado semántico distinto.

### Idea de negocio

| Estado | Significado | Terminal |
|---|---|---|
| Borrador | Capturada, sin validar | No |
| En evaluación | Siendo analizada por el equipo | No |
| Aprobada | Validada, lista para derivar en Problemas | Sí |
| Descartada | No se va a trabajar | Sí |

### Problema

| Estado | Significado | Terminal |
|---|---|---|
| Sin explorar | Identificado, sin trabajo activo | No |
| En exploración | Siendo investigado o validado | No |
| Definido | Problema claro con suficiente evidencia | Sí |
| Cerrado | Resuelto o descartado | Sí |

### Iniciativa

| Estado | Significado | Terminal |
|---|---|---|
| Por comenzar | Definida, sin trabajo activo | No |
| En progreso | Con al menos una Solución activa | No |
| En revisión | Trabajo completado, pendiente de validación | No |
| Completada | Finalizada | Sí |
| Pausada | Detenida temporalmente | No |

### Solución

| Estado | Significado | Terminal |
|---|---|---|
| Por diseñar | Identificada, sin diseño técnico | No |
| En diseño | Siendo diseñada | No |
| En desarrollo | Con Slices activos | No |
| En revisión | Desarrollo completado, pendiente de validación | No |
| Completada | Finalizada | Sí |
| Descartada | No se va a implementar | Sí |

### Slice

| Estado | Significado | Terminal |
|---|---|---|
| Backlog | Definido, sin comenzar | No |
| En curso | En desarrollo activo | No |
| En revisión | Pendiente de revisión o QA | No |
| Completado | Finalizado y validado | Sí |
| Bloqueado | Impedido por dependencia o factor externo | No |
| Cancelado | No se va a completar | Sí |

---

## Transiciones de estado

Las transiciones no son libres. Los estados terminales no tienen transiciones de salida.

### Slice (el más crítico)

```
Backlog ──────▶ En curso
En curso ─────▶ En revisión
En curso ─────▶ Bloqueado
En curso ─────▶ Cancelado
Bloqueado ────▶ En curso
En revisión ──▶ Completado
En revisión ──▶ En curso   (cambios necesarios)
```

Si un Slice completado necesita reabrirse, se crea un nuevo Slice derivado del original.

### Iniciativa

```
Por comenzar ─▶ En progreso
En progreso ──▶ En revisión
En progreso ──▶ Pausada
Pausada ──────▶ En progreso
En revisión ──▶ Completada
En revisión ──▶ En progreso
```

Los niveles Idea, Problema y Solución siguen el mismo principio: estados terminales no tienen transiciones de salida.

---

## Dependencias entre Slices

Las dependencias son exclusivas del nivel Slice.

### Tipos

| Tipo | Significado |
|---|---|
| `blocks` | Este Slice impide que el otro avance |
| `blocked_by` | Este Slice está impedido por el otro |
| `related_to` | Relación informativa, sin bloqueo |

`blocks` y `blocked_by` son simétricamente consistentes: si A bloquea a B, B está bloqueado por A. El sistema mantiene esta consistencia automáticamente.

### Reglas

- Un Slice no puede depender de sí mismo.
- No se permiten ciclos. El sistema verifica antes de insertar.
- Las dependencias no propagan estado automáticamente. Si un bloqueante se completa, el bloqueado no cambia de estado solo — el cambio es manual. La UI muestra un indicador visual de que el bloqueador fue resuelto.
- Las dependencias pueden cruzar proyectos.

---

## Visualización de la jerarquía

Dos vistas dentro de la sección de proyecto (distintas de los widgets Kanban en dashboards — ver doc `05`):

**Vista de árbol:** representación anidada del proyecto completo con ramas colapsables. Vista principal de navegación.

**Vista de board:** nodos de un nivel específico como tarjetas agrupadas por estado. El usuario selecciona qué nivel ver. Vista de seguimiento operativo.

Ambas vistas filtran por proyecto. No hay vista global de todos los proyectos en modo board.
