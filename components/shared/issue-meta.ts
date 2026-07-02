import { Doc } from "@/convex/_generated/dataModel";

export type IssueStatus = Doc<"issues">["status"];
export type IssuePriority = Doc<"issues">["priority"];

export const STATUSES: { value: IssueStatus; label: string }[] = [
  { value: "backlog", label: "Pendiente" },
  { value: "todo", label: "Por hacer" },
  { value: "in_progress", label: "En progreso" },
  { value: "in_review", label: "En revisión" },
  { value: "done", label: "Completado" },
  { value: "canceled", label: "Cancelado" },
];

export const PRIORITIES: { value: IssuePriority; label: string }[] = [
  { value: "none", label: "Sin prioridad" },
  { value: "urgent", label: "Urgente" },
  { value: "high", label: "Alta" },
  { value: "medium", label: "Media" },
  { value: "low", label: "Baja" },
];

export function statusLabel(status: IssueStatus): string {
  return STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function priorityLabel(priority: IssuePriority): string {
  return PRIORITIES.find((p) => p.value === priority)?.label ?? priority;
}
