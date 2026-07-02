"use client";

import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DAY_MS, inputDateToMs, msToInputDate } from "@/components/projects/dates";

export function CreateCycleDialog({
  open,
  onOpenChange,
  defaultProjectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProjectId?: Id<"projects">;
}) {
  const params = useParams<{ orgSlug?: string }>();
  const router = useRouter();
  const projects = useQuery(api.projects.list, open ? {} : "skip");
  const createCycle = useMutation(api.cycles.create);

  const [selectedProjectId, setSelectedProjectId] = useState<
    Id<"projects"> | undefined
  >(undefined);
  const [name, setName] = useState("");
  const [start, setStart] = useState(() => msToInputDate(Date.now()));
  const [end, setEnd] = useState(() => msToInputDate(Date.now() + 13 * DAY_MS));
  const [submitting, setSubmitting] = useState(false);

  // Fall back to the default/first project without needing an effect.
  const projectId = selectedProjectId ?? defaultProjectId ?? projects?.[0]?._id;

  const startMs = inputDateToMs(start);
  const endMs = inputDateToMs(end, "end");
  const datesValid =
    startMs !== undefined && endMs !== undefined && endMs > startMs;

  const handleSubmit = async () => {
    if (!projectId || !datesValid) {
      return;
    }
    setSubmitting(true);
    try {
      const cycleId = await createCycle({
        projectId,
        name: name.trim() || undefined,
        startDate: startMs,
        endDate: endMs,
      });
      toast.success("Ciclo creado");
      onOpenChange(false);
      setName("");
      setStart(msToInputDate(Date.now()));
      setEnd(msToInputDate(Date.now() + 13 * DAY_MS));
      if (params.orgSlug) {
        router.push(`/${params.orgSlug}/cycles/${cycleId}`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear el ciclo"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium text-muted-foreground">
            Nuevo ciclo
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            autoFocus
            placeholder="Nombre del ciclo (opcional — predeterminado: Ciclo N)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                void handleSubmit();
              }
            }}
            className="border-none px-0 text-lg font-medium shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Producto / Proyecto</Label>
              <Select
                value={projectId ?? ""}
                onValueChange={(value) =>
                  setSelectedProjectId(value as Id<"projects">)
                }
              >
                <SelectTrigger size="sm" className="w-auto gap-1.5">
                  <SelectValue placeholder="Producto" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((proj) => (
                    <SelectItem key={proj._id} value={proj._id}>
                      {proj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Inicio</Label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                aria-label="Fecha de inicio"
                className="h-8 rounded-md border bg-transparent px-2 text-xs text-foreground outline-none [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Fin</Label>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                aria-label="Fecha de fin"
                className="h-8 rounded-md border bg-transparent px-2 text-xs text-foreground outline-none [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>
          {!datesValid && (
            <p className="text-xs text-destructive">
              La fecha de fin debe ser posterior a la fecha de inicio.
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            size="sm"
            disabled={!projectId || !datesValid || submitting}
            onClick={() => void handleSubmit()}
          >
            Crear ciclo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
