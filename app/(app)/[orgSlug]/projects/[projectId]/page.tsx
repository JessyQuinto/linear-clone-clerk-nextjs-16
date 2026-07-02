"use client";

import { useMutation, useQuery } from "convex/react";
import { ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { AddIssuesPopover } from "@/components/projects/add-issues-popover";
import { GroupedIssueList } from "@/components/projects/grouped-issue-list";
import {
  completionPercent,
  progressFromIssues,
} from "@/components/projects/project-meta";
import { ProjectProperties } from "@/components/projects/project-properties";
import { IssueProgressBar } from "@/components/projects/progress-bar";

/** Project detail — Clean Linear-style layout with real issue list as primary content. */
export default function ProjectDetailPage() {
  const params = useParams<{ orgSlug: string; projectId: string }>();
  const projectId = params.projectId as Id<"projects">;
  const project = useQuery(api.projects.get, { projectId });

  if (project === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Proyecto no encontrado.
      </div>
    );
  }

  return (
    <ProjectDetail
      key={project._id}
      project={project}
      orgSlug={params.orgSlug}
    />
  );
}

function ProjectDetail({
  project,
  orgSlug,
}: {
  project: Doc<"projects">;
  orgSlug: string;
}) {
  const issues = useQuery(api.projects.listIssues, { projectId: project._id });
  const candidates = useQuery(api.projects.candidateIssues, {
    projectId: project._id,
  });
  const teams = useQuery(api.teams.list);
  const updateProject = useMutation(api.projects.update);
  const updateIssue = useMutation(api.issues.update);

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");

  const teamKeyFor = (teamId: Id<"teams">) =>
    teams?.find((team) => team._id === teamId)?.key ?? "?";

  const saveName = () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === project.name) {
      setName(project.name);
      return;
    }
    updateProject({ projectId: project._id, name: trimmed }).catch(() => {
      toast.error("Error al actualizar el nombre del proyecto");
    });
  };

  const saveDescription = () => {
    if (description === (project.description ?? "")) {
      return;
    }
    updateProject({
      projectId: project._id,
      description: description.trim() ? description : null,
    }).catch(() => {
      toast.error("Error al actualizar la descripción");
    });
  };

  const addIssue = (issueId: Id<"issues">) => {
    updateIssue({ issueId, projectId: project._id }).catch(
      (error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "Error al vincular el slice"
        );
      }
    );
  };

  const progress = progressFromIssues(issues ?? []);

  return (
    <>
      <header className="flex h-12 shrink-0 items-center justify-between border-b px-4 text-sm">
        <div className="flex min-w-0 items-center gap-1.5">
          <Link
            href={`/${orgSlug}/projects`}
            className="text-muted-foreground hover:text-foreground"
          >
            Proyectos
          </Link>
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium">{project.name}</span>
        </div>
        <AddIssuesPopover
          candidates={candidates}
          teamKeyFor={teamKeyFor}
          onAdd={addIssue}
          emptyText="Todos los slices ya están vinculados."
        />
      </header>

      <div className="flex min-h-0 flex-1">
        <ScrollArea className="flex-1">
          <div className="mx-auto flex max-w-3xl flex-col gap-4 px-8 pt-8 pb-4">
            {/* Editable title */}
            <Textarea
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              rows={1}
              className="min-h-0 resize-none border-none px-0 text-2xl font-semibold shadow-none focus-visible:ring-0 dark:bg-transparent"
            />

            {/* Editable description */}
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={saveDescription}
              placeholder="Agregar descripción…"
              className="min-h-20 resize-none border-none px-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
            />

            {/* Progress card */}
            <div className="flex flex-col gap-2 rounded-lg border p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">
                  Avance
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {progress.done} de {progress.total - progress.canceled} completados
                  · {completionPercent(progress)}%
                </span>
              </div>
              <IssueProgressBar progress={progress} />
              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  {progress.done} completados
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-blue-500" />
                  {progress.in_review} en revisión
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-yellow-500" />
                  {progress.in_progress} en curso
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-muted-foreground/40" />
                  {progress.backlog + progress.todo} abiertos
                </span>
              </div>
            </div>
          </div>

          {/* Issues list — primary content */}
          {issues === undefined || teams === undefined ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <GroupedIssueList
              issues={issues}
              teamKeyFor={teamKeyFor}
              emptyState={
                <div className="flex flex-col items-center gap-2 py-16 text-center">
                  <p className="text-sm text-muted-foreground">
                    No hay slices en este proyecto aún.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Usa el botón &quot;Add issues&quot; para vincular tareas existentes.
                  </p>
                </div>
              }
            />
          )}
        </ScrollArea>

        {/* Properties sidebar */}
        <aside className="w-72 shrink-0 border-l p-4">
          <h3 className="mb-3 text-xs font-medium text-muted-foreground">
            Propiedades
          </h3>
          <ProjectProperties project={project} />
        </aside>
      </div>
    </>
  );
}
