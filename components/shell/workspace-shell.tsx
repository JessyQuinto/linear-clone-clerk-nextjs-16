"use client";

import { useOrganizationList } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { CommandProvider } from "@/components/commands/command-provider";
import { AppSidebar } from "./app-sidebar";

function FullScreenLoader({ label }: { label: string }) {
  return (
    <div className="flex h-dvh items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
  );
}

/**
 * Authenticated workspace shell.
 *
 * 1. Makes sure the Clerk active org matches the org slug in the URL.
 * 2. Waits for the Clerk → Convex webhook sync (user + org docs) before
 *    rendering, so org-scoped queries never throw during onboarding.
 */
export function WorkspaceShell({
  orgSlug,
  children,
}: {
  orgSlug: string;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const router = useRouter();
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: { infinite: true },
  });

  const targetMembership = userMemberships.data?.find(
    (m) => m.organization.slug === orgSlug
  );
  const needsSwitch = isLoaded && targetMembership !== undefined;

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    if (targetMembership) {
      void setActive({ organization: targetMembership.organization.id });
    } else if (!userMemberships.isLoading && !userMemberships.hasNextPage) {
      router.replace("/onboarding");
    }
  }, [
    isLoaded,
    targetMembership,
    userMemberships.isLoading,
    userMemberships.hasNextPage,
    setActive,
    router,
  ]);

  const currentUser = useQuery(api.users.current);
  const currentOrg = useQuery(api.organizations.current);

  if (!mounted || !isLoaded || (needsSwitch && currentOrg === undefined)) {
    return <FullScreenLoader label="Cargando espacio de trabajo…" />;
  }

  if (currentUser === null || currentOrg === null) {
    return <FullScreenLoader label="Configurando tu espacio de trabajo…" />;
  }

  if (currentUser === undefined || currentOrg === undefined) {
    return <FullScreenLoader label="Cargando espacio de trabajo…" />;
  }

  if (currentOrg.slug !== orgSlug) {
    return <FullScreenLoader label="Cambiando de organización…" />;
  }

  return (
    <CommandProvider>
      <div className="flex h-dvh overflow-hidden">
        <AppSidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </CommandProvider>
  );
}
