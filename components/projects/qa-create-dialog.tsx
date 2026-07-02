"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const RESULTS = [
  { value: "aprobado", label: "Aprobado" },
  { value: "fallido", label: "Fallido" },
  { value: "observaciones", label: "Con observaciones" },
];

const SEVERITIES = [
  { value: "critica", label: "Crítica" },
  { value: "alta", label: "Alta" },
  { value: "media", label: "Media" },
  { value: "baja", label: "Baja" },
];

const TEST_TYPES = ["Funcionales", "Usabilidad", "Seguridad", "Integración"];

export function QaCreateDialog({
  open,
  onOpenChange,
  projectId,
  issues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: Id<"projects">;
  issues: Doc<"issues">[];
}) {
  const createQa = useMutation(api.qa.create);
  const members = useQuery(api.organizations.listMembers);

  const [sliceId, setSliceId] = useState<string>("");
  const [result, setResult] = useState<string>("aprobado");
  const [severity, setSeverity] = useState<string>("media");
  const [testerId, setTesterId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [testsRun, setTestsRun] = useState<string[]>(["Funcionales"]);
  const [submitting, setSubmitting] = useState(false);

  const candidateIssues = issues.filter(
    (i) => i.status === "in_progress" || i.status === "todo" || i.status === "done"
  );

  const handleSubmit = async () => {
    if (!sliceId) return;
    const slice = issues.find((i) => i._id === sliceId);
    setSubmitting(true);
    try {
      await createQa({
        sliceId,
        projectId,
        testerId: testerId || undefined,
        devId: slice?.assigneeId || undefined,
        result,
        severity,
        testsRun,
        description: description.trim() || undefined,
      });
      toast.success("Registro QA creado");
      onOpenChange(false);
      setSliceId("");
      setResult("aprobado");
      setSeverity("media");
      setTesterId("");
      setDescription("");
      setTestsRun(["Funcionales"]);
    } catch {
      toast.error("Error al crear el registro QA");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTest = (test: string) => {
    setTestsRun((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium text-muted-foreground">
            Registrar QA
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Slice</label>
            <Select value={sliceId} onValueChange={setSliceId}>
              <SelectTrigger size="sm">
                <SelectValue placeholder="Seleccionar slice" />
              </SelectTrigger>
              <SelectContent>
                {candidateIssues.map((i) => (
                  <SelectItem key={i._id} value={i._id}>
                    ING-{i.number} — {i.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs text-muted-foreground">Resultado</label>
              <Select value={result} onValueChange={setResult}>
                <SelectTrigger size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESULTS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs text-muted-foreground">Severidad</label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Tester</label>
            <Select
              value={testerId || "none"}
              onValueChange={(v) => setTesterId(v === "none" ? "" : v)}
            >
              <SelectTrigger size="sm">
                <SelectValue placeholder="Seleccionar tester" />
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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Notas</label>
            <Textarea
              placeholder="Detallar hallazgos…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-16 resize-none border-none px-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Pruebas realizadas</label>
            <div className="flex flex-wrap gap-3">
              {TEST_TYPES.map((test) => (
                <label
                  key={test}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer"
                >
                  <Checkbox
                    checked={testsRun.includes(test)}
                    onCheckedChange={() => toggleTest(test)}
                  />
                  {test}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            size="sm"
            disabled={!sliceId || submitting}
            onClick={() => void handleSubmit()}
          >
            Registrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
