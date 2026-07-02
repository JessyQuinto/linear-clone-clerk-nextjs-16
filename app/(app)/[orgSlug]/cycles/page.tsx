"use client";

import { useQuery } from "convex/react";
import { Loader2, Plus, RefreshCcw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateCycleDialog } from "@/components/cycles/create-cycle-dialog";
import { CycleRow } from "@/components/cycles/cycle-row";

/** Cycles index — Scoped to projects (Track B). Grouped by project. */
export default function CyclesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CyclesPageInner />
    </Suspense>
  );
}

function CyclesPageInner() {
  const cycles = useQuery(api.cycles.listWithProgress);
  const projects = useQuery(api.projects.list);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const wantNew = searchParams.get("new") === "true";
  const [manualOpen, setManualOpen] = useState(false);
  const [createProjectId, setCreateProjectId] = useState<Id<"projects"> | undefined>(
    undefined
  );
  const createOpen = manualOpen || wantNew;

  const openCreate = (projectId?: Id<"projects">) => {
    setCreateProjectId(projectId);
    setManualOpen(true);
  };

  const handleCreateOpenChange = (open: boolean) => {
    setManualOpen(open);
    if (!open) {
      setCreateProjectId(undefined);
      if (wantNew) {
        router.replace(pathname);
      }
    }
  };

  const loading = cycles === undefined || projects === undefined;
  const projectsWithCycles = projects?.filter((project) =>
    cycles?.some((cycle) => cycle.projectId === project._id)
  );

  return (
    <>
      <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Ciclos</span>
          {cycles !== undefined && (
            <span className="text-xs text-muted-foreground">
              {cycles.length}
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => openCreate()}
          disabled={projects !== undefined && projects.length === 0}
        >
          <Plus className="size-4" />
          Nuevo ciclo
        </Button>
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      ) : cycles.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <RefreshCcw className="size-8 text-muted-foreground/50" />
          <div>
            <p className="text-sm font-medium">No hay ciclos aún</p>
            <p className="text-xs text-muted-foreground">
              Los ciclos son sprints temporales asociados a un producto, numerados automáticamente.
            </p>
          </div>
          {projects.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Creá un producto primero, luego empezá su primer ciclo.
            </p>
          ) : (
            <Button size="sm" onClick={() => openCreate()}>
              <Plus className="size-4" />
              Comenzar un ciclo
            </Button>
          )}
        </div>
      ) : (
        <ScrollArea className="flex-1">
          {projectsWithCycles?.map((project) => (
            <section key={project._id}>
              <div className="flex h-9 items-center gap-2 bg-muted/50 px-4 text-sm">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: project.color ?? "#5e6ad2" }}
                />
                <span className="font-medium">{project.name}</span>
                <span className="text-xs text-muted-foreground">
                  {cycles.filter((cycle) => cycle.projectId === project._id).length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto size-6"
                  onClick={() => openCreate(project._id)}
                  aria-label={`Nuevo ciclo para ${project.name}`}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
              {cycles
                .filter((cycle) => cycle.projectId === project._id)
                .map((cycle) => (
                  <CycleRow key={cycle._id} cycle={cycle} />
                ))}
            </section>
          ))}
        </ScrollArea>
      )}

      <CreateCycleDialog
        open={createOpen}
        onOpenChange={handleCreateOpenChange}
        defaultProjectId={createProjectId}
      />
    </>
  );
}
