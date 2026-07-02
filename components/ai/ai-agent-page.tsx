"use client";

import { optimisticallySendMessage } from "@convex-dev/agent/react";
import { useMutation, useQuery } from "convex/react";
import { Bot, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { AiComposer } from "./composer";
import { convexErrorMessage } from "./convex-error";
import { AiConversation } from "./conversation";
import { ThreadList } from "./thread-list";
import { useAiAccess } from "./use-ai-access";

const SUGGESTIONS = [
  "¿En qué debería trabajar a continuación?",
  "Escribir un reporte de standup para las últimas 24 horas",
  "Resumir el ciclo actual",
  "Buscar tareas que parezcan duplicadas",
];

export function AiAgentPage() {
  const { isLoaded } = useAiAccess();

  if (!isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return <AiWorkspace />;
}

function AiWorkspace() {
  const threads = useQuery(api.agent.chat.listThreads);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const createThread = useMutation(api.agent.chat.createThread);
  const deleteThread = useMutation(api.agent.chat.deleteThread);
  const ensureOrgEmbeddings = useMutation(api.agent.embeddings.ensureOrgEmbeddings);
  const sendMessage = useMutation(
    api.agent.chat.sendMessage
  ).withOptimisticUpdate((store, args) => {
    optimisticallySendMessage(api.agent.chat.listMessages)(store, {
      threadId: args.threadId,
      prompt: args.prompt,
    });
  });

  const backfillRequested = useRef(false);
  useEffect(() => {
    if (!backfillRequested.current) {
      backfillRequested.current = true;
      ensureOrgEmbeddings({}).catch(() => {});
    }
  }, [ensureOrgEmbeddings]);

  const send = async (prompt: string) => {
    try {
      let threadId = selectedThreadId;
      if (!threadId) {
        threadId = await createThread({});
        setSelectedThreadId(threadId);
      }
      await sendMessage({ threadId, prompt });
    } catch (error) {
      toast.error(
        convexErrorMessage(error, "Error al enviar el mensaje. Por favor intentá de nuevo.")
      );
      throw error;
    }
  };

  const removeThread = (threadId: string) => {
    deleteThread({ threadId })
      .then(() => {
        if (selectedThreadId === threadId) {
          setSelectedThreadId(null);
        }
      })
      .catch((error: unknown) => {
        toast.error(
          convexErrorMessage(error, "Error al eliminar la conversación.")
        );
      });
  };

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <Bot className="size-4 text-primary" />
        <h1 className="text-sm font-medium">Agente IA</h1>
      </header>
      <div className="flex min-h-0 flex-1">
        <ThreadList
          threads={threads}
          selectedThreadId={selectedThreadId}
          onSelect={setSelectedThreadId}
          onNew={() => setSelectedThreadId(null)}
          onDelete={removeThread}
        />
        <main className="flex min-w-0 flex-1 flex-col">
          {selectedThreadId ? (
            <AiConversation threadId={selectedThreadId} />
          ) : (
            <EmptyState onSuggestion={send} />
          )}
          <AiComposer disabled={false} onSend={send} />
        </main>
      </div>
    </>
  );
}

function EmptyState({
  onSuggestion,
}: {
  onSuggestion: (prompt: string) => Promise<void>;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="flex w-full max-w-md flex-col items-center gap-5 text-center">
        <div className="flex size-10 items-center justify-center rounded-lg border bg-primary/10">
          <Sparkles className="size-5 text-primary" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">Preguntale a PANEL STYT</h2>
          <p className="text-sm text-muted-foreground">
            PANEL STYT conoce tus equipos, tareas, proyectos y ciclos — y puede
            crear o actualizar tareas por vos.
          </p>
        </div>
        <div className="flex w-full flex-col gap-1.5">
          {SUGGESTIONS.map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              className="justify-start font-normal text-muted-foreground"
              onClick={() => void onSuggestion(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
