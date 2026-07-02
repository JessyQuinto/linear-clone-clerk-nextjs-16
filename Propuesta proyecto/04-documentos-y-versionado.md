# 04 — Documentos y Versionado

## Tipos de documento

### Documentos de proyecto

Vinculados a un nodo de la jerarquía o directamente a un proyecto. Representan el trabajo de ingeniería y PM.

### Documentos transversales

No pertenecen a ningún proyecto. Son guías de equipo, estándares, documentos de onboarding, políticas operativas. Cualquier miembro puede referenciarlos desde cualquier proyecto.

### Tipos concretos

| Tipo | Categoría | Uso típico |
|---|---|---|
| `spec` | Proyecto | Especificación funcional o técnica |
| `design` | Proyecto | Notas de diseño de arquitectura o sistema |
| `adr` | Proyecto | Architecture Decision Record |
| `runbook` | Proyecto | Guía operativa para un sistema o proceso |
| `retro` | Proyecto | Registro de retrospectiva |
| `meeting_note` | Proyecto | Notas de reunión vinculadas a un nodo |
| `guide` | Transversal | Guía de práctica o estándar de equipo |
| `other` | Ambas | Documento que no encaja en los tipos anteriores |

---

## Formato de contenido

Markdown con extensiones de texto enriquecido: negrita, cursiva, encabezados, listas, bloques de código, tablas y links. Sin imágenes embebidas en el Cambio 1.

El contenido se almacena como texto plano (Markdown serializado). El editor en la UI es visual (WYSIWYG), pero el almacenamiento es texto — legible fuera del sistema y fácil de indexar para el Cambio 2.

---

## Organización de documentos transversales

### Etiquetas

Un documento transversal puede tener múltiples etiquetas de texto libre (ej. `frontend`, `seguridad`, `onboarding`). Las etiquetas se almacenan como array nativo de PostgreSQL (`text[]`) en el campo `tags` de la entidad `document` (ver doc `01`).

Las etiquetas son el mecanismo principal de filtrado y agrupación visual en la pantalla de documentos transversales.

### Búsqueda

La pantalla tiene un campo de búsqueda que filtra por título y contenido. Con ≤50 documentos transversales, `LIKE` o full-text search de PostgreSQL es suficiente sin índice adicional.

No hay carpetas en el Cambio 1.

---

## Versionado

### Mecanismo: checkpoints manuales

El versionado es manual y explícito. El sistema no crea versiones automáticas por tiempo ni por cada guardado. Razón: el auto-versionado frecuente produce un historial ruidoso, difícil de navegar y costoso.

Una nueva versión se crea cuando el autor hace clic en "Guardar versión":
- El contenido actual (campo `content` de `document`) se copia como snapshot inmutable a `document_version`.
- Número de versión secuencial (1, 2, 3...).
- Nota opcional del autor.
- Timestamp y autor.

### Borrador de trabajo

El campo `content` de la entidad `document` (ver doc `01`) siempre contiene el borrador actual. Los guardados automáticos actualizan este campo directamente sin crear versión. Si el usuario cierra el editor sin crear checkpoint, el borrador se conserva.

La relación es: `document.content` = estado actual de trabajo. `document_version.content` = snapshots históricos inmutables.

### Retención

Sin límite de versiones en el Cambio 1. Con el volumen esperado, el costo es despreciable. Si se necesita una política de retención, se puede añadir sin cambiar el modelo.

### Operaciones sobre versiones

- Ver historial (lista de checkpoints con fecha, autor y nota).
- Ver contenido de cualquier versión en modo solo lectura.
- Restaurar una versión: crea una nueva versión con nota automática "Restaurado desde versión N". No borra historia.

Sin diff visual entre versiones en el Cambio 1.

---

## Concurrencia

### Mecanismo: bloqueo optimista

Basado en `updated_at`:

1. Al abrir un documento para editar, el sistema registra el `updated_at` actual.
2. Al guardar, compara el `updated_at` del documento en BD con el registrado.
3. Si son iguales: nadie más editó. El guardado procede.
4. Si difieren: conflicto detectado.

### Resolución de conflicto

Opciones presentadas al usuario:
- **Sobrescribir:** se crea una versión de los cambios descartados antes de sobrescribir.
- **Descartar mis cambios:** el usuario pierde sus ediciones y ve la versión actual.
- **Revisar:** el sistema muestra el contenido actual en ventana lateral para decisión manual.

### Indicador visual

Cuando un usuario está editando un documento, la UI muestra un indicador visible para otros usuarios ("Editado por [Nombre]"). Reduce la probabilidad de conflictos sin locking real.
