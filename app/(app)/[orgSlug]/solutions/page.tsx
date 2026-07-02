"use client";

import { Wrench } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const MOCK_SOLUTIONS = [
  {
    id: "SOL-02",
    name: "Motor de Agente RAG",
    initiative: "MB-I01 Plataforma de Agentes",
    priority: "Alta",
    progress: "50%",
    status: "En desarrollo",
  },
  {
    id: "SOL-03",
    name: "Motor de Agente Cotizador",
    initiative: "MB-I01 Plataforma de Agentes",
    priority: "Alta",
    progress: "75%",
    status: "En desarrollo",
  },
  {
    id: "SOL-12",
    name: "Sistema de Métricas y Analíticas",
    initiative: "MB-I01 Plataforma de Agentes",
    priority: "Media",
    progress: "100%",
    status: "Completada",
  },
  {
    id: "SOL-14",
    name: "Gestión de Empresas y Acceso (JWT)",
    initiative: "MB-I01 Plataforma de Agentes",
    priority: "Media",
    progress: "30%",
    status: "En desarrollo",
  },
];

export default function SolutionsPage() {
  return (
    <>
      <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Soluciones</span>
          <span className="text-xs text-muted-foreground">
            {MOCK_SOLUTIONS.length}
          </span>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="flex h-8 items-center gap-3 border-b bg-muted/50 px-4 text-xs text-muted-foreground">
          <span className="w-20">ID</span>
          <span className="flex-1">Nombre de la Solución</span>
          <span className="w-48">Iniciativa</span>
          <span className="w-24">Prioridad</span>
          <span className="w-24">Avance</span>
          <span className="w-28 text-right">Estado</span>
        </div>
        {MOCK_SOLUTIONS.map((sol) => (
          <div
            key={sol.id}
            className="flex h-11 items-center gap-3 border-b px-4 text-sm hover:bg-muted/30"
          >
            <span className="w-20 font-mono text-xs text-muted-foreground">{sol.id}</span>
            <span className="flex-1 font-medium">{sol.name}</span>
            <span className="w-48 text-xs text-muted-foreground truncate">{sol.initiative}</span>
            <span className="w-24 text-xs text-muted-foreground">{sol.priority}</span>
            <span className="w-24 text-xs text-muted-foreground">{sol.progress}</span>
            <span className="w-28 text-right text-xs">
              <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                sol.status === "Completada" ? "bg-green-500/10 text-green-400" : "bg-blue-500/10 text-blue-400"
              }`}>
                {sol.status}
              </span>
            </span>
          </div>
        ))}
      </ScrollArea>
    </>
  );
}
