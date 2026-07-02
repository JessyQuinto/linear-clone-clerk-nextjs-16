# 03 — Constructor de Indicadores

## Propósito

El constructor de indicadores es el componente diferencial del sistema. Es la razón principal por la que Notion no sirve: Notion no puede construir métricas relacionales porque no tiene un modelo relacional real.

La complejidad viene de diseñar una gramática de definición de indicadores que sea suficientemente expresiva para los casos de uso del equipo, pero lo suficientemente acotada para que el motor de traducción a SQL sea predecible y mantenible.

---

## Operaciones soportadas

Un indicador responde a una pregunta sobre los datos del sistema. La gramática soporta cuatro tipos:

### 1. Conteo (`count`)

Cuenta nodos que cumplen un filtro.

- ¿Cuántos Slices hay en estado "En curso"?
- ¿Cuántos Problemas tiene el Proyecto X?
- ¿Cuántas Iniciativas no tienen responsable?

### 2. Agrupación (`group_by`)

Cuenta o suma nodos agrupados por una dimensión.

- Slices completados por responsable.
- Iniciativas por estado.
- Slices activos por proyecto.

Dimensiones de agrupación: estado, responsable, proyecto, nivel, tipo de documento, semana/mes.

### 3. Tendencia temporal (`trend`)

Evolución de un conteo en el tiempo.

- Slices completados por semana en el último mes.
- Iniciativas abiertas por mes en el último trimestre.

Granulado temporal: día, semana, mes. Rango: ventana relativa ("últimas 4 semanas") o absoluta (fecha inicio → fecha fin).

### 4. Fórmula (`formula`)

Combina métricas con operaciones matemáticas simples.

- Porcentaje de avance: `(Slices completados / Total de Slices) × 100`
- Velocidad media: `Slices completados / Semanas transcurridas`

Operaciones: suma, resta, multiplicación, división, porcentaje. Sin condicionales ni funciones de ventana en el Cambio 1.

---

## Gramática de definición

Una definición de indicador es un objeto JSON almacenado en el campo `definition` de `indicator_definition` (ver doc `01`). Tres secciones obligatorias: `source`, `operation`, `output`.

### `source` — qué datos

| Campo | Opciones | Descripción |
|---|---|---|
| `entity` | `node` / `document` | Entidad sobre la que opera |
| `level` | `idea` / `problem` / `initiative` / `solution` / `slice` / `all` | Nivel; `all` cruza niveles |
| `project_id` | UUID / `all` | Proyecto específico o todos |
| `status_filter` | Lista de estados / `all` | Limitar a estados específicos |
| `owner_filter` | UUID / `all` | Limitar a un responsable |
| `date_range` | Objeto de rango temporal | Ventana de tiempo |

### `operation` — qué calcular

| Campo | Opciones | Descripción |
|---|---|---|
| `type` | `count` / `group_by` / `trend` / `formula` | Tipo de operación |
| `group_by_dimension` | `status` / `owner` / `project` / `level` / `week` / `month` | Solo para `group_by` y `trend` |
| `granularity` | `day` / `week` / `month` | Solo para `trend` |
| `formula_expression` | Texto | Solo para `formula`; referencia métricas por nombre |

### `output` — cómo presentarlo

| Campo | Opciones | Descripción |
|---|---|---|
| `default_viz` | `table` / `bar` / `line` / `progress` / `donut` | Visualización preferida |
| `label` | Texto | Etiqueta del eje o columna |
| `unit` | Texto (nullable) | Unidad del resultado (ej. "%", "slices") |

### Ejemplo: "Slices completados por semana en el último mes"

```json
{
  "source": {
    "entity": "node",
    "level": "slice",
    "project_id": "all",
    "status_filter": ["completed"],
    "date_range": { "type": "relative", "last": 4, "unit": "week" }
  },
  "operation": {
    "type": "trend",
    "granularity": "week"
  },
  "output": {
    "default_viz": "line",
    "label": "Slices completados",
    "unit": "slices"
  }
}
```

### Ejemplo: "% de avance del Proyecto X"

```json
{
  "source": {
    "entity": "node",
    "level": "slice",
    "project_id": "uuid-del-proyecto-x",
    "status_filter": "all",
    "date_range": null
  },
  "operation": {
    "type": "formula",
    "formula_expression": "(completed_count / total_count) * 100"
  },
  "output": {
    "default_viz": "progress",
    "label": "Avance",
    "unit": "%"
  }
}
```

---

## Materialización

La materialización traduce la definición JSON a SQL, ejecuta la query y devuelve el resultado.

### Flujo

1. El usuario abre un dashboard o refresca un widget.
2. El frontend solicita el resultado con el `indicator_id`.
3. El backend recupera la definición JSON.
4. El motor traduce la definición en una query SQL parametrizada.
5. La query se ejecuta contra PostgreSQL.
6. El resultado se devuelve y se renderiza.

### Estrategia en el Cambio 1

Ejecución en tiempo real: cada solicitud ejecuta la query. No hay caché ni vistas materializadas.

El motor genera queries parametrizadas a partir de plantillas por tipo de operación — no SQL libre. Esto previene SQL injection y hace predecible el plan de ejecución.

### Umbrales para revisitar

Si un indicador tarda >2s en materializar:
- Añadir índice en la columna de agrupación o filtro.
- Materializar con job periódico (cada 15min) y servir desde caché.
- Convertir a vista materializada de PostgreSQL con refresh.

Ninguna de estas opciones cambia la gramática ni el modelo.

---

## Exclusiones del Cambio 1

- JOINs cruzados entre entidades distintas en una sola definición.
- Condicionales en fórmulas (`IF`, `CASE`).
- Funciones de ventana (running total, ranking).
- Sub-indicadores (un indicador que referencia a otro).
- Indicadores sobre dependencias.

Estos casos se pueden implementar como vistas SQL manuales mantenidas por el ingeniero, fuera del constructor visual.

---

## UX del constructor

Formulario en tres pasos que refleja la gramática:

**Paso 1 — ¿Qué datos?** Entidad, nivel, proyecto, estado, rango de tiempo. Valores por defecto razonables.

**Paso 2 — ¿Qué calcular?** Tipo de operación. Controles adicionales según el tipo (dimensión, granulado, fórmula).

**Paso 3 — ¿Cómo presentarlo?** Tipo de visualización y etiquetas. Preview con datos reales.

El indicador se puede guardar desde cualquier paso. Sin nombre no se puede guardar. Errores en fórmula se muestran antes de permitir guardar.
