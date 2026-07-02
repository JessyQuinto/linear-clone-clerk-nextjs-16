"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Left-hand navigation for the workspace settings section. */
export function SettingsNav() {
  const params = useParams<{ orgSlug: string }>();
  const pathname = usePathname();
  const base = `/${params.orgSlug}/settings`;
  const href = `${base}/members`;
  const active = pathname.startsWith(href);

  return (
    <nav className="flex w-44 shrink-0 flex-col gap-0.5 border-r p-3">
      <span className="px-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        Workspace
      </span>
      <Link
        href={href}
        className={cn(
          "flex h-7 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
          active && "bg-accent text-foreground"
        )}
      >
        <Users className="size-4" />
        Miembros
      </Link>
    </nav>
  );
}
