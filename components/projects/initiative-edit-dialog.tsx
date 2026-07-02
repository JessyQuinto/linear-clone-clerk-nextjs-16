"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRIORITIES = [
  { value: "critical", label: "Crítica" },
  { value: "high", label: "Alta" },
  { value: "medium", label: "Media" },
  { value: "low", label: "Baja" },
];

export function InitiativeEditDialog({
  initiative,
  open,
  onOpenChange,
}: {
  initiative: Doc<"initiatives">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateInitiative = useMutation(api.initiatives.update);
  const members = useQuery(api.organizations.listMembers);

  const [name, setName] = useState(initiative.name);
  const [description, setDescription] = useState(initiative.description ?? "");
  const [priority, setPriority] = useState(initiative.priority);
  const [leadId, setLeadId] = useState(initiative.leadId ?? "none");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await updateInitiative({
        initiativeId: initiative._id,
        name: name.trim(),
        description: description.trim() || undefined,
        priority,
        leadId: leadId === "none" ? undefined : leadId,
      });
      toast.success("Iniciativa actualizada");
      onOpenChange(false);
    } catch {
      toast.error("Error al actualizar la iniciativa");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium text-muted-foreground">
            Editar iniciativa
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input
            autoFocus
            placeholder="Nombre de la iniciativa"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                void handleSubmit();
              }
            }}
            className="border-none px-0 text-lg font-medium shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <Textarea
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-16 resize-none border-none px-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger size="sm" className="w-auto gap-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger size="sm" className="w-auto gap-1.5">
                <SelectValue placeholder="Responsable" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">Sin asignar</span>
                </SelectItem>
                {members?.map((m) => (
                  <SelectItem key={m.userId} value={m.userId}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            size="sm"
            disabled={!name.trim() || submitting}
            onClick={() => void handleSubmit()}
          >
            Guardar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
