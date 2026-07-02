"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { QaCreateDialog } from "./qa-create-dialog";
import { DocumentationPanel } from "./documentation-panel";

interface QaRecordWithDetails extends Doc<"qaRecords"> {
  sliceName: string;
  sliceNumber: number;
  testerName: string;
  testerImageUrl?: string;
  devName: string;
  devImageUrl?: string;
}

function QaRow({
  record,
  orgSlug,
  resultColors,
  resultLabels,
  severityColors,
  severityLabels,
}: {
  record: QaRecordWithDetails;
  orgSlug: string;
  resultColors: Record<string, string>;
  resultLabels: Record<string, string>;
  severityColors: Record<string, string>;
  severityLabels: Record<string, string>;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-muted/10 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="py-3 px-4 font-medium max-w-64 truncate">
          <div className="flex items-center gap-1.5">
            {expanded ? (
              <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
            )}
            <Link
              href={`/${orgSlug}/issue/${record.sliceId}`}
              className="text-primary hover:underline inline-flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="font-mono text-xs text-muted-foreground shrink-0">
                ING-{record.sliceNumber}
              </span>
              <span className="truncate">{record.sliceName}</span>
            </Link>
          </div>
        </td>
        <td className="py-3 px-4">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
              resultColors[record.result]
            }`}
          >
            {resultLabels[record.result]}
          </span>
        </td>
        <td className="py-3 px-4">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
              severityColors[record.severity]
            }`}
          >
            {severityLabels[record.severity]}
          </span>
        </td>
        <td className="py-3 px-4">
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-1.5">
              <UserAvatar name={record.testerName} imageUrl={record.testerImageUrl} />
              <span className="truncate text-muted-foreground">QA: {record.testerName.split(" ")[0]}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UserAvatar name={record.devName} imageUrl={record.devImageUrl} />
              <span className="truncate text-muted-foreground">Dev: {record.devName.split(" ")[0]}</span>
            </div>
          </div>
        </td>
        <td className="py-3 px-4 text-xs text-muted-foreground max-w-md">
          <p className="line-clamp-2" title={record.description}>
            {record.description}
          </p>
          {record.testsRun && record.testsRun.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {record.testsRun.map((test) => (
                <span
                  key={test}
                  className="px-1.5 py-0.5 rounded bg-accent text-[10px] text-accent-foreground border"
                >
                  {test}
                </span>
              ))}
            </div>
          )}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} className="px-4 py-3 bg-muted/10">
            <DocumentationPanel entityId={record._id} />
          </td>
        </tr>
      )}
    </>
  );
}

export function QaSummaryTable({
  qaRecords,
  projectId,
  issues,
}: {
  qaRecords: QaRecordWithDetails[] | undefined;
  projectId: Id<"projects">;
  issues: Doc<"issues">[];
}) {
  const params = useParams<{ orgSlug: string }>();
  const [filterResult, setFilterResult] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);

  if (qaRecords === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-xs text-muted-foreground">Cargando registros QA...</span>
      </div>
    );
  }

  // Stats calculation
  const total = qaRecords.length;
  const approved = qaRecords.filter((r) => r.result === "aprobado").length;
  const failed = qaRecords.filter((r) => r.result === "fallido").length;
  const obs = qaRecords.filter((r) => r.result === "observaciones").length;

  const filteredRecords = qaRecords.filter((r) => {
    if (filterResult === "all") return true;
    return r.result === filterResult;
  });

  const resultColors = {
    aprobado: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    fallido: "bg-red-500/10 text-red-500 border-red-500/20",
    observaciones: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-500",
  };

  const resultLabels = {
    aprobado: "Aprobado",
    fallido: "Fallido",
    observaciones: "Observaciones",
  };

  const severityColors = {
    critica: "bg-red-950/40 text-red-400 border-red-900/50",
    alta: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    media: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    baja: "bg-muted text-muted-foreground border-muted-foreground/20",
  };

  const severityLabels = {
    critica: "Crítica",
    alta: "Alta",
    media: "Media",
    baja: "Baja",
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Minimalist Filter & Stats strip */}
      <div className="flex gap-6 border-b pb-3 text-xs font-medium">
        <button
          onClick={() => setFilterResult("all")}
          className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-colors ${
            filterResult === "all" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>Todos</span>
          <span className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{total}</span>
        </button>
        <button
          onClick={() => setFilterResult("aprobado")}
          className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-colors ${
            filterResult === "aprobado" ? "border-emerald-500 text-emerald-500" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span>Aprobados</span>
          <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px] text-emerald-600 dark:text-emerald-400">{approved}</span>
        </button>
        <button
          onClick={() => setFilterResult("fallido")}
          className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-colors ${
            filterResult === "fallido" ? "border-red-500 text-red-500" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="size-1.5 rounded-full bg-red-500" />
          <span>Fallidos</span>
          <span className="bg-red-500/10 px-1.5 py-0.5 rounded text-[10px] text-red-600 dark:text-red-400">{failed}</span>
        </button>
        <button
          onClick={() => setFilterResult("observaciones")}
          className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-colors ${
            filterResult === "observaciones" ? "border-yellow-500 text-yellow-600 dark:text-yellow-400" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="size-1.5 rounded-full bg-yellow-500" />
          <span>Con Observaciones</span>
          <span className="bg-yellow-500/10 px-1.5 py-0.5 rounded text-[10px] text-yellow-600 dark:text-yellow-400">{obs}</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="rounded-lg border bg-card">
        <div className="flex h-10 items-center justify-between border-b px-4 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Registros de QA ({filteredRecords.length})
          </span>
          <div className="flex items-center gap-2">
            {filterResult !== "all" && (
              <button
                onClick={() => setFilterResult("all")}
                className="text-xs text-primary hover:underline"
              >
                Limpiar filtro
              </button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-6 gap-1 text-xs"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-3" />
              Registrar QA
            </Button>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground">
            No se encontraron registros de QA con el filtro seleccionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/10 text-xs text-muted-foreground font-medium">
                  <th className="py-2.5 px-4">Slice</th>
                  <th className="py-2.5 px-4 w-28">Resultado</th>
                  <th className="py-2.5 px-4 w-24">Severidad</th>
                  <th className="py-2.5 px-4 w-32">Responsables</th>
                  <th className="py-2.5 px-4">Hallazgos / Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredRecords.map((record) => (
                  <QaRow
                    key={record._id}
                    record={record}
                    orgSlug={params.orgSlug}
                    resultColors={resultColors}
                    resultLabels={resultLabels}
                    severityColors={severityColors}
                    severityLabels={severityLabels}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <QaCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        projectId={projectId}
        issues={issues}
      />
    </div>
  );
}
