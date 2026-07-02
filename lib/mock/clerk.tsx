"use client";

/* eslint-disable */
/**
 * Mock implementation of @clerk/nextjs components and hooks.
 * Provides interactive mock components for Sign In, Sign Up, User Avatar dropdown,
 * and Organization Switcher to simulate full auth flow in the frontend.
 */

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, Settings, Building, ChevronDown, Check } from "lucide-react";

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  return {
    isLoaded: true,
    isSignedIn: true,
    userId: "user_jessy",
    orgId: "org_acme",
    orgRole: "org:admin",
    orgSlug: "acme",
    has: ({ role, plan, feature }: { role?: string; plan?: string; feature?: string }) => {
      if (role) return role === "org:admin";
      if (plan) return plan === "pro";
      if (feature) return true;
      return true;
    },
  };
}

export function useUser() {
  return {
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: "user_jessy",
      fullName: "Jessy Quinto",
      primaryEmailAddress: { emailAddress: "jessy@example.com" },
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
    },
  };
}

export function useOrganization<T = any>(options?: T): any {
  return {
    isLoaded: true,
    organization: {
      id: "org_acme",
      name: "STYT LTDA",
      slug: "acme",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=100&q=80",
      membersCount: 2,
      pendingInvitationsCount: 0,
      inviteMember: async (args: { emailAddress: string; role: any }) => {
        return { id: "invite_mock" };
      },
    },
    membership: {
      role: "org:admin",
    },
    memberships: {
      count: 2,
      data: [
        {
          id: "membership_jessy",
          role: "org:admin",
          publicUserData: {
            userId: "user_jessy",
            fullName: "Jessy Quinto",
            primaryEmailAddress: "jessy@example.com",
            imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
          },
        },
        {
          id: "membership_jane",
          role: "org:member",
          publicUserData: {
            userId: "user_jane",
            fullName: "Jane Doe",
            primaryEmailAddress: "jane@acme.com",
            imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
          },
        },
      ],
      isLoading: false,
      fetchNext: () => {},
    },
    invitations: {
      count: 0,
      data: [],
      isLoading: false,
      fetchNext: () => {},
    },
  };
}

export function useOrganizationList({ userMemberships }: any = {}) {
  return {
    isLoaded: true,
    setActive: async (args?: any) => {},
    userMemberships: {
      data: [
        {
          organization: {
            id: "org_acme",
            name: "STYT LTDA",
            slug: "acme",
            imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=100&q=80",
          },
        },
      ],
      isLoading: false,
      hasNextPage: false,
    },
  };
}

export function SignedIn({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  return null; // Always signed in for mockup simplicity
}

export function Show({ when, children }: { when: "signed-in" | "signed-out"; children: React.ReactNode }) {
  if (when === "signed-in") {
    return <>{children}</>;
  }
  return null;
}

// Interactive Mock Components
export function UserButton(props: any) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex size-7 items-center justify-center rounded-full overflow-hidden border border-border focus:outline-none hover:opacity-80"
      >
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
          alt="Jessy Quinto"
          className="size-full object-cover"
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute bottom-9 left-0 z-40 w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in slide-in-from-bottom-2">
            <div className="px-2 py-1.5 text-xs font-semibold">Jessy Quinto</div>
            <div className="px-2 py-0.5 text-2xs text-muted-foreground truncate pb-2 border-b">
              jessy@example.com
            </div>
            <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground">
              <User className="size-3.5" /> Perfil
            </button>
            <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground">
              <Settings className="size-3.5" /> Configuración
            </button>
            <div className="h-px bg-border my-1" />
            <Link
              href="/"
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-3.5" /> Cerrar sesión
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export function OrganizationSwitcher(props: any) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-7 items-center gap-2 rounded px-2 text-xs font-medium border border-border bg-muted/30 hover:bg-muted/50 focus:outline-none"
      >
        <span className="flex size-4 items-center justify-center rounded bg-primary/20 text-xs font-semibold text-primary">
          S
        </span>
        STYT LTDA
        <ChevronDown className="size-3 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-1 z-40 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in slide-in-from-top-2">
            <div className="px-2 py-1 text-2xs text-muted-foreground uppercase tracking-wider font-semibold border-b pb-1 mb-1">
              Espacios de trabajo
            </div>
            <button className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-xs bg-accent text-accent-foreground font-medium">
              <div className="flex items-center gap-2">
                <span className="flex size-4 items-center justify-center rounded bg-primary/20 text-2xs font-semibold text-primary">
                  S
                </span>
                STYT LTDA
              </div>
              <Check className="size-3.5" />
            </button>
            <div className="h-px bg-border my-1" />
            <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground">
              <Building className="size-3.5" /> Crear organización
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function OrganizationList(props: any) {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-sm rounded-lg border bg-card p-6 shadow-md">
      <h2 className="text-lg font-semibold mb-1">Seleccionar espacio de trabajo</h2>
      <p className="text-xs text-muted-foreground mb-4">Elegí una organización para continuar en PANEL STYT.</p>
      <button
        onClick={() => router.push("/acme")}
        className="flex w-full items-center gap-3 rounded-md border p-3 hover:bg-accent text-left"
      >
        <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
          S
        </span>
        <div>
          <div className="text-sm font-semibold">STYT LTDA</div>
          <div className="text-2xs text-muted-foreground">acme.panelstyt.app</div>
        </div>
      </button>
    </div>
  );
}

export function SignIn(props: any) {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-md w-full rounded-lg border bg-card p-8 shadow-md">
      <div className="text-center mb-6">
        <span className="inline-flex size-10 items-center justify-center rounded bg-primary text-lg font-bold text-primary-foreground mb-3">
          P
        </span>
        <h1 className="text-xl font-bold">Iniciar sesión en PANEL STYT</h1>
        <p className="text-xs text-muted-foreground mt-1">Experimentá el gestor de tareas diseñado para la velocidad.</p>
      </div>
      <button
        onClick={() => router.push("/acme")}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary p-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        Ingresar como Usuario Demo (Jessy)
      </button>
    </div>
  );
}

export function SignUp(props: any) {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-md w-full rounded-lg border bg-card p-8 shadow-md">
      <div className="text-center mb-6">
        <span className="inline-flex size-10 items-center justify-center rounded bg-primary text-lg font-bold text-primary-foreground mb-3">
          P
        </span>
        <h1 className="text-xl font-bold">Crear tu cuenta de PANEL STYT</h1>
        <p className="text-xs text-muted-foreground mt-1">Comenzá con un espacio de trabajo de prototipo gratis.</p>
      </div>
      <button
        onClick={() => router.push("/onboarding")}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary p-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        Registrarse como Usuario Demo (Jessy)
      </button>
    </div>
  );
}
