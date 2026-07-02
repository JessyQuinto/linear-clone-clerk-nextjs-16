"use client";

import { useMutation, useQuery } from "convex/react";
import { ChevronRight, Loader2, List, Columns3, Bookmark, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { InitiativeList } from "@/components/projects/initiative-list";
import { QaSummaryTable } from "@/components/projects/qa-summary-table";
import { CycleRow } from "@/components/cycles/cycle-row";
import {
  SlicesFilterBar,
  SliceFilters,
  filterIssues,
} from "@/components/projects/slices-filter-bar";
import { DocumentationPanel } from "@/components/projects/documentation-panel";
import { BoardView } from "@/components/board/board-view";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  // New queries for STYT 4-level hierarchy
  const initiatives = useQuery(api.initiatives.listByProject, { projectId: project._id });
  const qaRecords = useQuery(api.qa.listByProject, { projectId: project._id });
  const cycles = useQuery(api.cycles.listByProject, { projectId: project._id });

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [sliceFilters, setSliceFilters] = useState<SliceFilters>({
    assigneeFilter: "all",
    statusFilter: "all",
    initiativeFilter: "all",
    cycleFilter: "all",
  });
  const [displayMode, setDisplayMode] = useState<"list" | "board">("list");
  
  const views = useQuery(api.views.list);
  const removeView = useMutation(api.views.remove);
  
  const defaultTeam = teams?.[0];
  const labelRows = useQuery(api.views.teamIssueLabels, {
    teamId: defaultTeam?._id ?? ("team_eng" as Id<"teams">),
  });
  const members = useQuery(api.organizations.listMembers);

  const labelsByIssue = useMemo(() => {
    const map = new Map<Id<"issues">, { labelId: string; name: string; color: string }[]>();
    for (const row of labelRows ?? []) {
      const list = map.get(row.issueId) ?? [];
      list.push({ labelId: row.labelId, name: row.name, color: row.color });
      map.set(row.issueId, list);
    }
    return map;
  }, [labelRows]);

  const assigneesById = useMemo(() => {
    const map = new Map<string, { name: string; imageUrl?: string }>();
    for (const member of members ?? []) {
      map.set(member.userId, { name: member.name, imageUrl: member.imageUrl });
    }
    return map;
  }, [members]);

  const parseViewFilters = (filtersStr: string, currentUserId?: string): SliceFilters => {
    try {
      const parsed = JSON.parse(filtersStr);
      if ('assigneeFilter' in parsed) {
        return {
          assigneeFilter: parsed.assigneeFilter || "all",
          statusFilter: parsed.statusFilter || "all",
          initiativeFilter: parsed.initiativeFilter || "all",
          cycleFilter: parsed.cycleFilter || "all",
        };
      }
      let assigneeFilter = "all";
      if (parsed.assigneeId === currentUserId) {
        assigneeFilter = "me";
      } else if (parsed.assigneeId) {
        assigneeFilter = "others";
      }
      let statusFilter = "all";
      if (parsed.statuses && parsed.statuses.length > 0) {
        statusFilter = parsed.statuses[0];
      } else if (parsed.status) {
        statusFilter = parsed.status;
      }
      return {
        assigneeFilter,
        statusFilter,
        initiativeFilter: parsed.initiativeFilter || "all",
        cycleFilter: parsed.cycleFilter || "all",
      };
    } catch {
      return {
        assigneeFilter: "all",
        statusFilter: "all",
        initiativeFilter: "all",
        cycleFilter: "all",
      };
    }
  };

  const currentUserId = useQuery(api.users.current)?._id;

  const filteredIssues = useMemo(() => {
    if (!issues) return undefined;
    return filterIssues(issues, sliceFilters, currentUserId);
  }, [issues, sliceFilters, currentUserId]);

  const hasActiveFilters = Object.values(sliceFilters).some((v) => v !== "all");

  const teamKeyFor = (teamId: Id<"teams">) =>
    teams?.find((team) => team._id === teamId)?.key ?? "ING";

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
            Productos
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

          {/* Hierarchy Tabs Section */}
          <div className="border-t">
            <Tabs defaultValue="initiatives" className="w-full">
              <div className="border-b px-8 bg-muted/20">
                <TabsList className="h-10 bg-transparent p-0 gap-6" variant="line">
                  <TabsTrigger
                    value="initiatives"
                    className="h-10 rounded-none border-b-2 border-transparent border-x-transparent border-t-transparent data-[state=active]:border-b-foreground !bg-transparent dark:!bg-transparent !shadow-none after:hidden focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                  >
                    Iniciativas
                  </TabsTrigger>
                  <TabsTrigger
                    value="slices"
                    className="h-10 rounded-none border-b-2 border-transparent border-x-transparent border-t-transparent data-[state=active]:border-b-foreground !bg-transparent dark:!bg-transparent !shadow-none after:hidden focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                  >
                    Slices
                  </TabsTrigger>
                  <TabsTrigger
                    value="qa"
                    className="h-10 rounded-none border-b-2 border-transparent border-x-transparent border-t-transparent data-[state=active]:border-b-foreground !bg-transparent dark:!bg-transparent !shadow-none after:hidden focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                  >
                    Testing & QA
                  </TabsTrigger>
                  <TabsTrigger
                    value="cycles"
                    className="h-10 rounded-none border-b-2 border-transparent border-x-transparent border-t-transparent data-[state=active]:border-b-foreground !bg-transparent dark:!bg-transparent !shadow-none after:hidden focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                  >
                    Ciclos
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="initiatives" className="mt-0">
                <InitiativeList
                  initiatives={initiatives}
                  slices={issues}
                  teamKeyFor={teamKeyFor}
                  projectId={project._id}
                />
              </TabsContent>

              <TabsContent value="slices" className="mt-0">
                <div className="flex flex-col gap-2 border-b bg-muted/20 px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <SlicesFilterBar
                      filters={sliceFilters}
                      onFiltersChange={setSliceFilters}
                      initiatives={initiatives}
                      cycles={cycles}
                      hasActiveFilters={hasActiveFilters}
                    />

                    {/* Saved Views Dropdown */}
                    {views && views.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground hover:bg-accent/50 focus:outline-none focus-visible:outline-none focus-visible:ring-0">
                            <Bookmark className="size-3.5" />
                            Vistas
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          {views.map((v) => (
                            <DropdownMenuItem
                              key={v._id}
                              className="flex items-center justify-between text-xs cursor-pointer"
                              onClick={() => {
                                const parsed = parseViewFilters(v.filters, currentUserId);
                                setSliceFilters(parsed);
                                toast.success(`Vista "${v.name}" aplicada`);
                              }}
                            >
                              <span className="truncate">{v.name}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-4 opacity-50 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeView({ viewId: v._id })
                                    .then(() => toast.success(`Vista "${v.name}" eliminada`))
                                    .catch(() => toast.error("Error al eliminar la vista"));
                                }}
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <Tabs
                    value={displayMode}
                    onValueChange={(val) => setDisplayMode(val as "list" | "board")}
                  >
                    <TabsList className="h-7 bg-transparent border p-0 gap-0">
                      <TabsTrigger
                        value="list"
                        className="h-6 gap-1 px-2.5 text-xs rounded-none border-r border-transparent data-[state=active]:border-r data-[state=active]:bg-background focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                      >
                        <List className="size-3.5" />
                        Lista
                      </TabsTrigger>
                      <TabsTrigger
                        value="board"
                        className="h-6 gap-1 px-2.5 text-xs rounded-none data-[state=active]:bg-background focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                      >
                        <Columns3 className="size-3.5" />
                        Kanban
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {filteredIssues === undefined || teams === undefined ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                ) : displayMode === "board" ? (
                  <div className="p-4 overflow-x-auto">
                    <BoardView
                      issues={filteredIssues}
                      teamId={defaultTeam?._id ?? ("team_eng" as Id<"teams">)}
                      teamKey={defaultTeam?.key ?? "ING"}
                      orgSlug={orgSlug}
                      labelsByIssue={labelsByIssue}
                      assigneesById={assigneesById}
                    />
                  </div>
                ) : (
                  <GroupedIssueList
                    issues={filteredIssues}
                    teamKeyFor={teamKeyFor}
                    emptyState={
                      <div className="flex flex-col items-center gap-2 py-16 text-center">
                        <p className="text-sm text-muted-foreground">
                          {hasActiveFilters
                            ? "No hay slices que coincidan con los filtros."
                            : "No hay slices en este proyecto aún."}
                        </p>
                        {!hasActiveFilters && (
                          <p className="text-xs text-muted-foreground">
                            Usa el botón &quot;Add issues&quot; para vincular tareas existentes.
                          </p>
                        )}
                      </div>
                    }
                  />
                )}
              </TabsContent>

              <TabsContent value="qa" className="mt-0">
                <QaSummaryTable
                  qaRecords={qaRecords}
                  projectId={project._id}
                  issues={issues ?? []}
                />
              </TabsContent>

              <TabsContent value="cycles" className="mt-0">
                {cycles === undefined ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                ) : cycles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-sm text-muted-foreground">
                    No hay ciclos activos para este producto.
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {cycles.map((cycle) => (
                      <CycleRow key={cycle._id} cycle={cycle} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        {/* Properties sidebar */}
        <aside className="w-72 shrink-0 border-l p-4">
          <h3 className="mb-3 text-xs font-medium text-muted-foreground">
            Propiedades
          </h3>
          <ProjectProperties project={project} />
          <div className="mt-4 border-t pt-4">
            <DocumentationPanel entityId={project._id} />
          </div>
        </aside>
      </div>
    </>
  );
}
