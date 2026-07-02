import { Doc } from "@/convex/_generated/dataModel";
import { IssueStatus } from "@/components/shared/issue-meta";

export type ProjectStatus = Doc<"projects">["status"];

export const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "backlog", label: "Pendiente" },
  { value: "planned", label: "Planificado" },
  { value: "in_progress", label: "En progreso" },
  { value: "paused", label: "Pausado" },
  { value: "completed", label: "Completado" },
  { value: "canceled", label: "Cancelado" },
];

export function projectStatusLabel(status: ProjectStatus): string {
  return PROJECT_STATUSES.find((s) => s.value === status)?.label ?? status;
}

/** Linear-ish project color palette. */
export const PROJECT_COLORS = [
  "#5e6ad2",
  "#26b5ce",
  "#4cb782",
  "#f2c94c",
  "#f2994a",
  "#eb5757",
  "#bb87fc",
  "#95a2b3",
] as const;

export const DEFAULT_PROJECT_COLOR = PROJECT_COLORS[0];

/** Issue counts by status — matches `progressShape` in convex/projects.ts. */
export type IssueProgress = {
  total: number;
  backlog: number;
  todo: number;
  in_progress: number;
  in_review: number;
  done: number;
  canceled: number;
};

export const EMPTY_PROGRESS: IssueProgress = {
  total: 0,
  backlog: 0,
  todo: 0,
  in_progress: 0,
  in_review: 0,
  done: 0,
  canceled: 0,
};

export function progressFromIssues(
  issues: { status: IssueStatus }[]
): IssueProgress {
  const progress: IssueProgress = { ...EMPTY_PROGRESS };
  for (const issue of issues) {
    progress.total += 1;
    progress[issue.status] += 1;
  }
  return progress;
}

/** Percent complete = done / (total − canceled). */
export function completionPercent(progress: IssueProgress): number {
  const denominator = progress.total - progress.canceled;
  if (denominator <= 0) {
    return 0;
  }
  return Math.round((progress.done / denominator) * 100);
}
