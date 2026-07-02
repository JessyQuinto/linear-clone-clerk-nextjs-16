"use client";

import { ShieldCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const MOCK_QA_ITEMS = [
  {
    id: "QA-01",
    name: "MultiBotsAgent | SOL 14 ➔ Slice 2: Autenticación JWT",
    slice: "Autenticación JWT (MB-I01-SL14-02)",
    dev: "Juan Felipe Lamos",
    severity: "Media",
    result: "Fallido",
    status: "Dev ajustando",
  },
  {
    id: "QA-02",
    name: "MultiBotsAgent | SOL 12 ➔ Slice 1: Consulta de Métricas",
    slice: "Consulta de Métricas (MB-I01-SL12-01)",
    dev: "Juan Felipe Lamos",
    severity: "Alta",
    result: "Observaciones",
    status: "Tester revisando",
  },
  {
    id: "QA-03",
    name: "MultiBotsAgent | SOL 05 ➔ Slice 3: Recepción Mensajes",
    slice: "Recepción Mensajes (MB-I01-SL05-03)",
    dev: "Óscar Javier Gomez",
    severity: "Media",
    result: "Aprobado",
    status: "Aprobado",
  },
  {
    id: "QA-04",
    name: "MultiBotsAgent | SOL 08 ➔ Slice 04: Devolución Control",
    slice: "Devolución Control (MB-I01-SL08-04)",
    dev: "Óscar Javier Gomez",
    severity: "Alta",
    result: "Fallido",
    status: "Pendiente pruebas",
  },
];

export default function QaPage() {
  return (
    <>
      <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Testing & QA</span>
          <span className="text-xs text-muted-foreground">
            {MOCK_QA_ITEMS.length}
          </span>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="flex h-8 items-center gap-3 border-b bg-muted/50 px-4 text-xs text-muted-foreground">
          <span className="w-20">ID</span>
          <span className="flex-1">Caso de Prueba / Bug</span>
          <span className="w-56">Slice Asociado</span>
          <span className="w-36">Dev Responsable</span>
          <span className="w-20">Severidad</span>
          <span className="w-24">Resultado</span>
          <span className="w-28 text-right">Estado QA</span>
        </div>
        {MOCK_QA_ITEMS.map((item) => (
          <div
            key={item.id}
            className="flex h-11 items-center gap-3 border-b px-4 text-sm hover:bg-muted/30"
          >
            <span className="w-20 font-mono text-xs text-muted-foreground">{item.id}</span>
            <span className="flex-1 font-medium truncate">{item.name}</span>
            <span className="w-56 text-xs text-muted-foreground truncate">{item.slice}</span>
            <span className="w-36 text-xs text-muted-foreground truncate">{item.dev}</span>
            <span className="w-20 text-xs">
              <span className={`inline-block rounded px-1 py-0.5 text-[9px] font-medium ${
                item.severity === "Crítica" || item.severity === "Alta" ? "text-red-400 bg-red-500/10" : "text-yellow-400 bg-yellow-500/10"
              }`}>
                {item.severity}
              </span>
            </span>
            <span className="w-24 text-xs">
              <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                item.result === "Aprobado"
                  ? "bg-green-500/10 text-green-400"
                  : item.result === "Fallido"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-yellow-500/10 text-yellow-400"
              }`}>
                {item.result}
              </span>
            </span>
            <span className="w-28 text-right text-xs">
              <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                item.status === "Aprobado"
                  ? "bg-green-500/10 text-green-400"
                  : item.status === "Dev ajustando"
                  ? "bg-blue-500/10 text-blue-400"
                  : item.status === "Tester revisando"
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-red-500/10 text-red-400"
              }`}>
                {item.status}
              </span>
            </span>
          </div>
        ))}
      </ScrollArea>
    </>
  );
}
