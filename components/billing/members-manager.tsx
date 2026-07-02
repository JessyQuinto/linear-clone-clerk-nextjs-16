"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import type {
  OrganizationCustomRoleKey,
  OrganizationInvitationResource,
  OrganizationMembershipResource,
} from "@clerk/nextjs/types";
import { Loader2, Mail, Trash2, UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserAvatar } from "@/components/shared/user-avatar";

const ROLES: { value: OrganizationCustomRoleKey; label: string }[] = [
  { value: "org:member", label: "Miembro" },
  { value: "org:admin", label: "Admin" },
];

type OrgListsReturn = ReturnType<
  typeof useOrganization<{
    memberships: { infinite: true };
    invitations: { infinite: true };
  }>
>;

function clerkErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "errors" in error) {
    const errors = (
      error as { errors?: { longMessage?: string; message?: string }[] }
    ).errors;
    const first = errors?.[0];
    if (first?.longMessage ?? first?.message) {
      return first.longMessage ?? first.message ?? fallback;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function membershipDisplayName(
  membership: OrganizationMembershipResource
): string {
  const data = membership.publicUserData;
  const name = [data?.firstName, data?.lastName].filter(Boolean).join(" ");
  return name || (data?.identifier ?? "Unknown user");
}

/**
 * Members management: Clerk-backed member list, role management, removal,
 * and email invitations.
 */
export function MembersManager() {
  const { isLoaded, organization, membership, memberships, invitations } =
    useOrganization({
      memberships: { infinite: true },
      invitations: { infinite: true },
    });

  if (!isLoaded || !organization) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isAdmin = membership?.role === "org:admin";
  const memberCount = memberships?.count ?? organization.membersCount;
  const pendingCount =
    invitations?.count ?? organization.pendingInvitationsCount;

  return (
    <>
      <div>
        <h1 className="text-base font-semibold">Miembros</h1>
        <p className="text-xs text-muted-foreground">
          {memberCount} {memberCount === 1 ? "miembro" : "miembros"}
          {pendingCount > 0 && ` · ${pendingCount} pendiente${pendingCount > 1 ? "s" : ""}`}
        </p>
      </div>

      {isAdmin && (
        <InviteMemberForm
          onInvited={() => void invitations?.revalidate?.()}
        />
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Personas</h2>
        <MembersTable isAdmin={isAdmin} memberships={memberships} />
      </section>

      {(invitations?.data?.length ?? 0) > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">Invitaciones pendientes</h2>
          <PendingInvitations isAdmin={isAdmin} invitations={invitations} />
        </section>
      )}
    </>
  );
}

function InviteMemberForm({
  onInvited,
}: {
  onInvited: () => void;
}) {
  const { organization } = useOrganization();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrganizationCustomRoleKey>("org:member");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const emailAddress = email.trim();
    if (!organization || !emailAddress || submitting) {
      return;
    }
    setSubmitting(true);
    try {
      await organization.inviteMember({ emailAddress, role });
      toast.success(`Invitación enviada a ${emailAddress}`);
      setEmail("");
      onInvited();
    } catch (error) {
      toast.error(clerkErrorMessage(error, "Error al enviar la invitación"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="flex items-center gap-2"
    >
      <div className="relative flex-1">
        <Mail className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="email"
          required
          placeholder="colega@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-8 pl-8 text-sm"
        />
      </div>
      <Select
        value={role}
        onValueChange={(value) => setRole(value as OrganizationCustomRoleKey)}
      >
        <SelectTrigger size="sm" className="w-28 gap-1.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" disabled={!email.trim() || submitting}>
        <UserPlus className="size-3.5" />
        Invitar
      </Button>
    </form>
  );
}

function MembersTable({
  isAdmin,
  memberships,
}: {
  isAdmin: boolean;
  memberships: OrgListsReturn["memberships"];
}) {
  const { user } = useUser();

  const handleRoleChange = async (
    member: OrganizationMembershipResource,
    role: OrganizationCustomRoleKey
  ) => {
    try {
      await member.update({ role });
      toast.success(`${membershipDisplayName(member)} ahora es ${role === "org:admin" ? "admin" : "miembro"}`);
      await memberships?.revalidate?.();
    } catch (error) {
      toast.error(clerkErrorMessage(error, "Error al actualizar el rol"));
    }
  };

  const handleRemove = async (member: OrganizationMembershipResource) => {
    try {
      await member.destroy();
      toast.success(`Eliminado ${membershipDisplayName(member)}`);
      await memberships?.revalidate?.();
    } catch (error) {
      toast.error(clerkErrorMessage(error, "Error al eliminar el miembro"));
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-3 text-xs">Usuario</TableHead>
            <TableHead className="text-xs">Se unió</TableHead>
            <TableHead className="w-32 text-xs">Rol</TableHead>
            {isAdmin && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {memberships?.data?.map((member) => {
            const isSelf = member.publicUserData?.userId === user?.id;
            const name = membershipDisplayName(member);
            return (
              <TableRow key={member.id} className="hover:bg-muted/20">
                <TableCell className="px-3 py-2">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar
                      name={name}
                      imageUrl={member.publicUserData?.imageUrl}
                      className="size-6"
                    />
                    <div className="flex min-w-0 flex-col">
                      <span className="flex items-center gap-1.5 truncate text-xs font-medium">
                        {name}
                        {isSelf && (
                          <Badge
                            variant="secondary"
                            className="h-4 rounded-full px-1.5 text-[10px]"
                          >
                            Vos
                          </Badge>
                        )}
                      </span>
                      <span className="truncate text-[11px] text-muted-foreground">
                        {member.publicUserData?.identifier}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-2 text-xs text-muted-foreground">
                  {formatDate(member.createdAt)}
                </TableCell>
                <TableCell className="py-2">
                  {isAdmin && !isSelf ? (
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        void handleRoleChange(
                          member,
                          value as OrganizationCustomRoleKey
                        )
                      }
                    >
                      <SelectTrigger size="sm" className="h-7 w-28 gap-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {member.role === "org:admin" ? "Admin" : "Miembro"}
                    </span>
                  )}
                </TableCell>
                {isAdmin && (
                  <TableCell className="py-2 pr-3 text-right">
                    {!isSelf && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Eliminar ${name}`}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              ¿Eliminar {name}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Perderá acceso inmediato a este espacio de trabajo
                              y sus tareas. Podés invitarlo nuevamente después.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => void handleRemove(member)}
                            >
                              Eliminar miembro
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {memberships?.hasNextPage && (
        <div className="border-t p-2 text-center">
          <Button
            variant="ghost"
            size="sm"
            disabled={memberships.isFetching}
            onClick={() => memberships.fetchNext?.()}
          >
            Cargar más
          </Button>
        </div>
      )}
    </div>
  );
}

function PendingInvitations({
  isAdmin,
  invitations,
}: {
  isAdmin: boolean;
  invitations: OrgListsReturn["invitations"];
}) {
  const handleRevoke = async (invitation: OrganizationInvitationResource) => {
    try {
      await invitation.revoke();
      toast.success(`Invitación a ${invitation.emailAddress} revocada`);
      await invitations?.revalidate?.();
    } catch (error) {
      toast.error(clerkErrorMessage(error, "Error al revocar la invitación"));
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableBody>
          {invitations?.data?.map((invitation) => (
            <TableRow key={invitation.id} className="hover:bg-muted/20">
              <TableCell className="px-3 py-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-6 items-center justify-center rounded-full bg-muted">
                    <Mail className="size-3 text-muted-foreground" />
                  </span>
                  <span className="text-xs font-medium">
                    {invitation.emailAddress}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-2 text-xs text-muted-foreground">
                Invitado {formatDate(invitation.createdAt)}
              </TableCell>
              <TableCell className="py-2 text-xs text-muted-foreground">
                {invitation.role === "org:admin" ? "Admin" : "Miembro"}
              </TableCell>
              {isAdmin && (
                <TableCell className="w-20 py-2 pr-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => void handleRevoke(invitation)}
                  >
                    Revocar
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
