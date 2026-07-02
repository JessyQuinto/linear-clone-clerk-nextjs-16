"use client";

import { useQuery } from "convex/react";
import { Loader2, Inbox } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { IssueRow } from "@/components/issues/issue-row";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Workspace home — displays user's workspace, assigned slices, and metrics.
 */
export default function WorkspaceHomePage() {
  const currentUser = useQuery(api.users.current);
  const myIssues = useQuery(
    api.issues.listByAssignee,
    currentUser?._id ? { assigneeId: currentUser._id } : "skip"
  );
  const teams = useQuery(api.teams.list);

  const teamKeyFor = (teamId: Id<"teams">) =>
    teams?.find((team) => team._id === teamId)?.key ?? "ING";

  const loading = currentUser === undefined || (currentUser !== null && myIssues === undefined);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (currentUser === null) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Usuario no autenticado.
      </div>
    );
  }

  const assignedIssues = myIssues ?? [];
  const inProgressCount = assignedIssues.filter((i) => i.status === "in_progress").length;
  const todoCount = assignedIssues.filter((i) => i.status === "todo").length;
  const doneCount = assignedIssues.filter((i) => i.status === "done").length;

  return (
    <>
      <header className="flex h-12 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-foreground">Mi espacio de trabajo</span>
        </div>
      </header>

      <ScrollArea className="flex-1 bg-background">
        <div className="mx-auto max-w-5xl p-6 flex flex-col gap-6">
          {/* Welcome back */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                ¡Hola de nuevo, {currentUser.name.split(" ")[0]}!
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Acá tenés un resumen de tu trabajo asignado y prioridades del momento.
              </p>
            </div>
            {/* Minimalist Metrics strip */}
            <div className="flex gap-8 shrink-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  En progreso
                </span>
                <span className="text-xl font-semibold text-foreground leading-none">
                  {inProgressCount}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 border-l pl-8">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Pendientes
                </span>
                <span className="text-xl font-semibold text-foreground leading-none">
                  {todoCount}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 border-l pl-8">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Completadas
                </span>
                <span className="text-xl font-semibold text-foreground leading-none">
                  {doneCount}
                </span>
              </div>
            </div>
          </div>

          {/* Slices Section */}
          <div className="rounded-lg border bg-card">
            <div className="flex h-10 items-center justify-between border-b px-4 bg-muted/20">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Mis Slices Asignados ({assignedIssues.length})
              </span>
            </div>

            {assignedIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                <Inbox className="size-6 text-muted-foreground/40" />
                <div>
                  <p className="text-sm font-medium">No tenés slices asignados</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Podés ir a la sección de Productos para asignarte nuevas tareas.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                {assignedIssues.map((issue) => (
                  <IssueRow
                    key={issue._id}
                    issue={issue}
                    teamKey={teamKeyFor(issue.teamId)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </>
  );
}
