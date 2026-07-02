"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import {
  Bot,
  LayoutDashboard,
  FolderKanban,
  RefreshCcw,
  Search,
  SquarePen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCommands } from "@/components/commands/command-provider";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { useSidebar } from "./sidebar-context";

interface NavLinkProps {
  href: string;
  exact?: boolean;
  icon: ReactNode;
  children: ReactNode;
}

function NavLink({ href, exact, icon, children }: NavLinkProps) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex h-7 items-center gap-2 rounded px-2 text-sm transition-colors",
        active
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{children}</span>
    </Link>
  );
}

export function AppSidebar() {
  const params = useParams<{ orgSlug: string }>();
  const { openCreateIssue, openPalette } = useCommands();
  const base = `/${params.orgSlug}`;
  const { isCollapsed, setIsCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "relative flex shrink-0 flex-col border-r bg-sidebar transition-all duration-300",
        isCollapsed ? "w-0" : "w-60"
      )}
    >
      <div
        className={cn(
          "w-60 flex flex-col h-full shrink-0 transition-opacity duration-200",
          isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <div className="flex items-center justify-between gap-2 p-3">
          <OrganizationSwitcher
            hidePersonal
            afterSelectOrganizationUrl="/:slug"
            afterCreateOrganizationUrl="/:slug"
            appearance={{
              elements: {
                rootBox: "min-w-0",
                organizationSwitcherTrigger: "max-w-44",
              },
            }}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={openCreateIssue}
                aria-label="Nueva tarea"
              >
                <SquarePen className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Nueva tarea (C)</TooltipContent>
          </Tooltip>
        </div>

        <div className="px-3 pb-2">
          <button
            onClick={openPalette}
            className="flex h-7 w-full items-center gap-2 rounded-md border bg-background px-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Search className="size-3.5" />
            Buscar…
            <kbd className="ml-auto rounded border bg-muted px-1 font-mono text-[10px]">
              Key K
            </kbd>
          </button>
        </div>

        <ScrollArea className="flex-1 px-3">
          <nav className="flex flex-col gap-0.5 pb-2">
            <NavLink href={base} exact icon={<LayoutDashboard className="size-4" />}>
              Espacio de trabajo
            </NavLink>
            <NavLink href={`${base}/projects`} icon={<FolderKanban className="size-4" />}>
              Productos
            </NavLink>
            <NavLink href={`${base}/cycles`} icon={<RefreshCcw className="size-4" />}>
              Ciclos
            </NavLink>
            <NavLink href={`${base}/ai`} icon={<Bot className="size-4" />}>
              Agente IA
            </NavLink>
          </nav>
        </ScrollArea>

        <div className="flex items-center justify-between border-t p-3">
          <UserButton />
          <ThemeToggle />
        </div>
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-1/2 -right-3 -translate-y-1/2 z-50 flex size-6 items-center justify-center rounded-full border bg-background shadow hover:bg-accent cursor-pointer transition-colors"
        aria-label={isCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
      >
        {isCollapsed ? (
          <ChevronRight className="size-3.5 text-muted-foreground" />
        ) : (
          <ChevronLeft className="size-3.5 text-muted-foreground" />
        )}
      </button>
    </aside>
  );
}
