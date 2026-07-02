/* eslint-disable */
/**
 * Mock implementation of @convex-dev/agent/react.
 * Provides hooks and type definitions for the mock AI Agent chat page.
 */

export interface UIMessage {
  key: string;
  role: "user" | "assistant" | "system";
  text?: string;
  status?: any;
  parts: any;
}

export function useSmoothText(text: string, options?: any) {
  return [text];
}

export function useUIMessages(query: any, args?: any, options?: any) {
  const results: UIMessage[] = [
    {
      key: "msg_1",
      role: "assistant",
      status: "completed",
      parts: [
        {
          type: "text",
          text: "¡Hola! Soy tu asistente de Vector. Como estamos en el modo de prototipo local, puedo responder tus dudas generales sobre el frontend, pero la conexión con la base de datos de Convex y OpenAI está desactivada.",
        },
      ],
    },
  ];

  return {
    results,
    status: "Exhausted" as any, // "Exhausted" means no more pages to load, prevents comparisons error
    loadMore: (num?: any) => {},
  };
}

export function optimisticallySendMessage(listMessagesFunc: any) {
  return (store: any, args: { threadId: string; prompt: string }) => {
    // Noop optimistic update in mock mode
  };
}
