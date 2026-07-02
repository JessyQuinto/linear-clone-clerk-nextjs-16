# 07 — Criterios de Éxito

## Escala de referencia

Criterios calibrados para:

- **Usuarios:** hasta 100 simultáneos
- **Proyectos activos:** hasta 20
- **Documentos por proyecto:** hasta 200
- **Indicadores por dashboard:** hasta 15

Revisitar antes de superar 10x estos valores.

---

## 1. Gestión de proyectos y jerarquía

| # | Criterio | Umbral | Verificación |
|---|---|---|---|
| 1.1 | Crear un nodo en cualquier nivel | < 500ms desde clic hasta confirmación visual | Performance API en navegador |
| 1.2 | Cambiar estado de un nodo | Reflejado en todas las vistas abiertas en < 2s | Dos sesiones simultáneas |
| 1.3 | Crear nodo en nivel intermedio sin completar niveles superiores | El sistema lo permite sin error | Prueba funcional: crear Iniciativa sin Idea previa |
| 1.4 | Registrar dependencia entre dos slices | Visible en detalle de ambos slices | Prueba funcional |
| 1.5 | Detectar ciclo de dependencias | Bloquea creación con mensaje de error claro | Prueba: intentar crear A→B→A |

---

## 2. Constructor de indicadores

| # | Criterio | Umbral | Verificación |
|---|---|---|---|
| 2.1 | PM sin SQL construye indicador con al menos un filtro | Lo logra en < 10min en primera sesión | Prueba de usabilidad con PM real, sin guía |
| 2.2 | Indicador devuelve resultado | < 3s dentro de la escala de referencia | Timer en la UI |
| 2.3 | Query de indicador falla (timeout, división por cero) | Mensaje de error descriptivo; no rompe el dashboard | Error inyectado |
| 2.4 | Definición de indicador editable | El indicador actualizado ejecuta con nueva definición sin recrearlo | Prueba funcional |
| 2.5 | Determinismo de resultados | Resultado idéntico en 3 ejecuciones consecutivas sin cambio de datos | Prueba de determinismo |

---

## 3. Documentos y versionado

| # | Criterio | Umbral | Verificación |
|---|---|---|---|
| 3.1 | Guardar checkpoint crea versión recuperable | Versión anterior accesible desde historial | Prueba funcional |
| 3.2 | Dos usuarios editan el mismo doc simultáneamente | Ningún cambio se pierde silenciosamente; conflicto detectado | Dos sesiones editando mismo doc |
| 3.3 | Historial con 50 versiones carga | < 1s | Dataset sintético |
| 3.4 | Documento transversal encontrable por título | Aparece en < 2s tras escribir 3+ caracteres | Prueba con 50+ docs transversales |

---

## 4. Dashboards

| # | Criterio | Umbral | Verificación |
|---|---|---|---|
| 4.1 | Dashboard con 15 indicadores carga completo | < 5s en escala de referencia | Performance API |
| 4.2 | Indicador fallido no bloquea el resto | Indicadores válidos se muestran; fallido muestra error aislado | Error inyectado en 1 de 10 |
| 4.3 | Configuración persiste entre sesiones | Layout e indicadores iguales al recargar | Prueba: crear, cerrar sesión, volver |
| 4.4 | Dashboard compartido visible por otro usuario | Segundo usuario puede verlo sin configuración adicional | Prueba con dos cuentas |

---

## 5. Performance general

| # | Criterio | Umbral | Verificación |
|---|---|---|---|
| 5.1 | Carga inicial de la aplicación | < 3s en 10 Mbps | Lighthouse / WebPageTest |
| 5.2 | Navegación entre vistas | < 1s por transición | Performance API |
| 5.3 | Tiempos bajo carga concurrente | Umbrales se cumplen con 50 usuarios simultáneos | Prueba de carga (k6 o Locust) |
| 5.4 | Sin pérdida de datos bajo reinicio durante escritura | Operación se completa o revierte; nunca estado inconsistente | Kill de proceso durante escritura |

---

## 6. Onboarding

| # | Criterio | Umbral | Verificación |
|---|---|---|---|
| 6.1 | Usuario nuevo crea su primer proyecto con un nodo | Lo logra en < 15min sin documentación | Prueba de usabilidad |
| 6.2 | Usuario nuevo entiende los niveles | Categoriza correctamente 5 ejemplos en su nivel correcto | Evaluación durante onboarding |
| 6.3 | Pantalla vacía guía al usuario | Acción principal clara visible, no lista de opciones | Revisión de UI en estado vacío |

---

## Criterios de rechazo

Independientemente de que otros criterios se cumplan:

- Pérdida silenciosa de datos en cualquier operación de escritura.
- Un error en un componente rompe la sesión completa o requiere recarga.
- Una acción produce estado inconsistente en BD que no puede revertirse.
- El sistema no responde a ninguna acción por >10s sin indicador de carga.

---

## Notas de revisión

- Los umbrales de performance se ajustan si la escala cambia antes del lanzamiento.
- Los criterios de onboarding se repiten con usuarios reales del equipo, no con desarrolladores.
- El criterio 5.3 requiere acordar la herramienta de prueba antes de la revisión final.
