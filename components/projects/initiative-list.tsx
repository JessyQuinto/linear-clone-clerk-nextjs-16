"use client";

import { useState } from "react";
import { Plus, Target } from "lucide-react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { InitiativeCard } from "./initiative-card";
import { InitiativeCreateDialog } from "./initiative-create-dialog";

interface InitiativeWithStats extends Doc<"initiatives"> {
  sliceCount: number;
  slicesDone: number;
  progress: number;
  leadName: string;
  leadImageUrl?: string;
  slicesByStatus: {
    backlog: number;
    todo: number;
    in_progress: number;
    done: number;
  };
}

export function InitiativeList({
  initiatives,
  slices,
  teamKeyFor,
  projectId,
}: {
  initiatives: InitiativeWithStats[] | undefined;
  slices: Doc<"issues">[] | undefined;
  teamKeyFor: (teamId: Id<"teams">) => string;
  projectId: Id<"projects">;
}) {
  const [createOpen, setCreateOpen] = useState(false);

  if (initiatives === undefined || slices === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-xs text-muted-foreground">Cargando iniciativas...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Iniciativas ({initiatives.length})
        </h3>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 text-xs"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-3.5" />
          Nueva iniciativa
        </Button>
      </div>

      {initiatives.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Target className="size-8 text-muted-foreground/50" />
          <div>
            <p className="text-sm font-medium">No hay iniciativas en este producto</p>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Las iniciativas representan los grandes objetivos o módulos de desarrollo del producto.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" />
            Crear iniciativa
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {initiatives.map((ini) => {
            const iniSlices = slices.filter((s) => s.initiativeId === ini._id);
            return (
              <InitiativeCard
                key={ini._id}
                initiative={ini}
                slices={iniSlices}
                teamKeyFor={teamKeyFor}
              />
            );
          })}
        </div>
      )}

      <InitiativeCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        projectId={projectId}
      />
    </div>
  );
}
