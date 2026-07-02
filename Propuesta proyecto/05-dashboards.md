# 05 — Dashboards

## Qué es un dashboard

Un dashboard es una pantalla configurable compuesta por widgets. Cada widget visualiza el resultado de un indicador o muestra nodos directamente (Kanban). Un dashboard no tiene datos propios.

La distinción entre indicador, widget y dashboard:
- **Indicador:** define qué calcular y cómo. Es reutilizable.
- **Widget:** instancia de un indicador (o vista Kanban) en un dashboard, con configuración de visualización específica.
- **Dashboard:** contenedor de widgets con layout y propósito.

Un mismo indicador puede aparecer en múltiples dashboards con distintos tipos de visualización.

---

## Propiedad y visibilidad

Cualquier miembro del equipo puede crear un dashboard. No hay RBAC en el Cambio 1.

| Tipo | Visible para | Editable por |
|---|---|---|
| Personal | Solo el autor | Solo el autor |
| Compartido | Todo el equipo | Solo el autor |

Un dashboard compartido puede ser clonado por otro miembro: la copia es personal y editable por el nuevo dueño.

---

## Tipos de widget

| Tipo | Fuente de datos | Cuándo usarlo |
|---|---|---|
| Tabla | Indicador | Valores desglosados con múltiples dimensiones |
| Barras | Indicador | Comparar magnitudes entre categorías |
| Línea | Indicador | Evolución temporal |
| Barra de progreso | Indicador | Avance hacia un total (ej. % del proyecto) |
| Donut | Indicador | Distribución proporcional (ej. slices por estado) |
| Kanban | Datos directos (no indicador) | Nodos de un nivel agrupados por estado en columnas |

### Kanban en dashboard vs. Kanban en proyecto

El sistema tiene dos vistas tipo Kanban con propósitos distintos:

| Aspecto | Kanban de proyecto (doc `02`) | Kanban widget de dashboard |
|---|---|---|
| **Ubicación** | Dentro de la vista de un proyecto | Dentro de un dashboard |
| **Propósito** | Navegación y gestión operativa | Monitoreo visual desde el dashboard |
| **Datos** | Nodos de un nivel del proyecto actual | Nodos de un nivel de cualquier proyecto (configurado en el widget) |
| **Interacción** | Drag-and-drop para cambiar estado | Solo lectura (no se cambia estado desde el dashboard) |

### Configuración de un widget

Al añadir un widget, el usuario configura:
- Qué indicador muestra (o qué proyecto/nivel para Kanban).
- Tipo de visualización (puede diferir del `default_viz` del indicador).
- Título personalizado (opcional; por defecto usa el nombre del indicador).
- Tamaño en el grid (ancho y alto en unidades).

---

## Layout

Grid de columnas fijas. El usuario redimensiona y reposiciona widgets con drag-and-drop. Posición y tamaño se guardan automáticamente.

Sin exportación ni modo presentación en el Cambio 1.

---

## Límites y navegación

Sin límite de dashboards por usuario ni en total.

La pantalla de dashboards muestra:
1. Dashboards personales del usuario.
2. Dashboards compartidos, ordenados por última modificación.

---

## Persistencia

La configuración completa se guarda en BD (entidad `dashboard_widget` — ver doc `01`). No hay configuración en localStorage.

Al reabrir un dashboard, se ve la misma configuración. Los datos se recargan en tiempo real.

---

## Relación con indicadores

- Un indicador puede existir sin estar en ningún dashboard.
- Al eliminar un indicador usado en widgets, el sistema avisa qué dashboards se afectan y pide confirmación.
- Si se confirma, los widgets quedan con estado de error visible ("Indicador eliminado"). No se eliminan automáticamente.

---

## Flujo completo

1. Construir un indicador en el constructor (doc `03`).
2. Guardar el indicador con nombre descriptivo.
3. Ir a un dashboard existente o crear uno nuevo.
4. Añadir widget, seleccionar el indicador.
5. Elegir visualización y tamaño.
6. El widget se renderiza con datos reales.
7. Ajustar posición en el grid.

El flujo es igual para dashboards personales y compartidos.
