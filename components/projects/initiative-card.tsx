"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { IssueRow } from "@/components/issues/issue-row";
import { IssueProgressBar } from "./progress-bar";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { InitiativeEditDialog } from "./initiative-edit-dialog";

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

export function InitiativeCard({
  initiative,
  slices,
  teamKeyFor,
}: {
  initiative: InitiativeWithStats;
  slices: Doc<"issues">[];
  teamKeyFor: (teamId: Id<"teams">) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const removeInitiative = useMutation(api.initiatives.remove);

  const priorityColors = {
    critical: "bg-red-500/10 text-red-500 border-red-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };

  const priorityLabels = {
    critical: "Crítica",
    high: "Alta",
    medium: "Media",
    low: "Baja",
  };

  const statusProgress = {
    total: initiative.sliceCount,
    backlog: initiative.slicesByStatus.backlog,
    todo: initiative.slicesByStatus.todo,
    in_progress: initiative.slicesByStatus.in_progress,
    in_review: 0,
    done: initiative.slicesDone,
    canceled: 0,
  };

  const handleDelete = async () => {
    try {
      await removeInitiative({ initiativeId: initiative._id });
      toast.success("Iniciativa eliminada");
    } catch {
      toast.error("Error al eliminar la iniciativa");
    }
  };

  return (
    <>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:border-muted-foreground/30">
        <div
          className="flex flex-col gap-3 p-4 cursor-pointer sm:flex-row sm:items-center sm:justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <button className="mt-1 shrink-0 text-muted-foreground hover:text-foreground">
              {expanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground truncate">
                  {initiative.name}
                </h4>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${
                    priorityColors[initiative.priority] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {priorityLabels[initiative.priority] || initiative.priority}
                </span>
              </div>
              {initiative.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {initiative.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pl-7 sm:pl-0 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {initiative.slicesDone} de {initiative.sliceCount} Slices
              </span>
              <div className="w-24">
                <IssueProgressBar progress={statusProgress} />
              </div>
              <span className="text-xs font-medium w-8 text-right">
                {initiative.progress}%
              </span>
            </div>

            <div className="flex items-center gap-2 border-l pl-4">
              <span className="text-xs text-muted-foreground hidden md:inline">Líder:</span>
              {initiative.leadImageUrl ? (
                <UserAvatar name={initiative.leadName} imageUrl={initiative.leadImageUrl} />
              ) : (
                <div className="flex items-center justify-center size-5 rounded-full bg-accent text-accent-foreground">
                  <User className="size-3" />
                </div>
              )}
              <span className="text-xs text-foreground truncate max-w-24">
                {initiative.leadName.split(" ")[0]}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="size-7" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="size-3.5" />
                  Editar
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="size-3.5" />
                      Eliminar
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Eliminar iniciativa</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Estás seguro? Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {expanded && (
          <div className="border-t bg-muted/20">
            {slices.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No hay slices asociados a esta iniciativa todavía.
              </div>
            ) : (
              <div className="flex flex-col">
                {slices.map((slice) => (
                  <div key={slice._id} className="pl-6 hover:bg-accent/40">
                    <IssueRow issue={slice} teamKey={teamKeyFor(slice.teamId)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <InitiativeEditDialog
        initiative={initiative}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
