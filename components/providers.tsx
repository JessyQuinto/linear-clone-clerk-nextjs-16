"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {/* Radix tooltips require a root provider; the ui/tooltip primitive
          does not self-wrap, so every bare <Tooltip> depends on this. */}
      <TooltipProvider>{children}</TooltipProvider>
    </ThemeProvider>
  );
}
