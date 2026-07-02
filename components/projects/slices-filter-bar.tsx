"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export type SliceFilters = {
  assigneeFilter: string;
  statusFilter: string;
  initiativeFilter: string;
  cycleFilter: string;
};

export function SlicesFilterBar({
  filters,
  onFiltersChange,
  initiatives,
  cycles,
  hasActiveFilters,
}: {
  filters: SliceFilters;
  onFiltersChange: (f: SliceFilters) => void;
  initiatives: Doc<"initiatives">[] | undefined;
  cycles: Doc<"cycles">[] | undefined;
  hasActiveFilters: boolean;
}) {
  const [saveOpen, setSaveOpen] = useState(false);
  const [viewName, setViewName] = useState("");
  const createView = useMutation(api.views.create);

  const clearFilters = () => {
    onFiltersChange({
      assigneeFilter: "all",
      statusFilter: "all",
      initiativeFilter: "all",
      cycleFilter: "all",
    });
  };

  const handleSaveView = async () => {
    if (!viewName.trim()) return;
    try {
      await createView({
        name: viewName.trim(),
        filters: JSON.stringify(filters),
        shared: false,
      });
      toast.success("Vista guardada");
      setSaveOpen(false);
      setViewName("");
    } catch {
      toast.error("Error al guardar la vista");
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="size-3.5 text-muted-foreground" />

        <Select
          value={filters.assigneeFilter}
          onValueChange={(v) => onFiltersChange({ ...filters, assigneeFilter: v })}
        >
          <SelectTrigger size="sm" className="h-7 w-auto gap-1 text-xs">
            <SelectValue placeholder="Responsable" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="me">Asignado a mí</SelectItem>
            <SelectItem value="others">Otros</SelectItem>
            <SelectItem value="unassigned">Sin asignar</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.statusFilter}
          onValueChange={(v) => onFiltersChange({ ...filters, statusFilter: v })}
        >
          <SelectTrigger size="sm" className="h-7 w-auto gap-1 text-xs">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="backlog">Pendiente</SelectItem>
            <SelectItem value="todo">Por hacer</SelectItem>
            <SelectItem value="in_progress">En progreso</SelectItem>
            <SelectItem value="done">Completado</SelectItem>
          </SelectContent>
        </Select>

        {initiatives && initiatives.length > 0 && (
          <Select
            value={filters.initiativeFilter}
            onValueChange={(v) => onFiltersChange({ ...filters, initiativeFilter: v })}
          >
            <SelectTrigger size="sm" className="h-7 w-auto gap-1 text-xs">
              <SelectValue placeholder="Iniciativa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {initiatives.map((ini) => (
                <SelectItem key={ini._id} value={ini._id}>
                  {ini.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {cycles && cycles.length > 0 && (
          <Select
            value={filters.cycleFilter}
            onValueChange={(v) => onFiltersChange({ ...filters, cycleFilter: v })}
          >
            <SelectTrigger size="sm" className="h-7 w-auto gap-1 text-xs">
              <SelectValue placeholder="Ciclo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {cycles.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name || `Ciclo ${c.number}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-muted-foreground"
              onClick={clearFilters}
            >
              <X className="size-3" />
              Limpiar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => setSaveOpen(true)}
            >
              Guardar vista
            </Button>
          </>
        )}
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium text-muted-foreground">
              Guardar vista
            </DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="Nombre de la vista"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleSaveView();
            }}
            className="border-none px-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setSaveOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" disabled={!viewName.trim()} onClick={() => void handleSaveView()}>
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function filterIssues(
  issues: Doc<"issues">[],
  filters: SliceFilters,
  currentUserId?: string
): Doc<"issues">[] {
  return issues.filter((issue) => {
    if (filters.assigneeFilter === "me" && issue.assigneeId !== currentUserId)
      return false;
    if (filters.assigneeFilter === "others" && issue.assigneeId === currentUserId)
      return false;
    if (filters.assigneeFilter === "unassigned" && issue.assigneeId)
      return false;
    if (filters.statusFilter !== "all" && issue.status !== filters.statusFilter)
      return false;
    if (filters.initiativeFilter !== "all" && issue.initiativeId !== filters.initiativeFilter)
      return false;
    if (filters.cycleFilter !== "all" && issue.cycleId !== filters.cycleFilter)
      return false;
    return true;
  });
}
