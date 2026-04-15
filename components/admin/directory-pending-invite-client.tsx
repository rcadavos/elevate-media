"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DIRECTORY_ROLE_LABELS } from "@/lib/constants/directory-roles";
import { ClientProfilePhotoSlot } from "@/components/admin/client-profile-photo-slot";
import { queryKeys } from "@/lib/query/query-keys";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type PendingInviteDetail = {
  id: string;
  email: string;
  pending_full_name: string | null;
  business_name: string | null;
  expires_at: string;
  created_at: string;
};

type DirectoryPendingInviteClientProps = {
  invite: PendingInviteDetail;
};

export function DirectoryPendingInviteClient({
  invite,
}: DirectoryPendingInviteClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  // Wall-clock snapshot for admin-only UI (recomputed after router.refresh()).
  // eslint-disable-next-line react-hooks/purity -- compare invite expiry to current time
  const inviteExpired = new Date(invite.expires_at).getTime() < Date.now();
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const resendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/admin/client-invites/${encodeURIComponent(invite.id)}/resend`,
        {
          method: "POST",
          credentials: "same-origin",
        },
      );
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        inviteUrl?: string;
        emailSent?: boolean;
        emailError?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not resend invite");
      }
      return data;
    },
    onSuccess: async (data) => {
      setSendError(null);
      setNotice(data.message ?? "Invite updated.");
      setInviteUrl(
        typeof data.inviteUrl === "string" && data.inviteUrl ? data.inviteUrl : null,
      );
      await queryClient.invalidateQueries({
        queryKey: queryKeys.admin.profiles("client"),
      });
      router.refresh();
    },
    onError: (err: Error) => {
      setNotice(null);
      setInviteUrl(null);
      setSendError(err.message);
    },
  });

  const expiresLabel = new Date(invite.expires_at).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const businessDisplay = invite.business_name?.trim() || "—";
  const clientNameDisplay = invite.pending_full_name?.trim() || "—";
  const noopUpload = async () => {};

  const onboardingFooter = (
    <>
      {sendError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not resend</AlertTitle>
          <AlertDescription>{sendError}</AlertDescription>
        </Alert>
      ) : null}

      {notice && !resendMutation.isPending ? (
        <div
          className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
          role="status"
        >
          {notice}
        </div>
      ) : null}

      {inviteUrl ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-xs break-all text-muted-foreground">
          <span className="font-medium text-foreground">Invite link:</span>{" "}
          {inviteUrl}
        </div>
      ) : null}
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          render={<Link href="/admin/directory/client" />}
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="inline-flex w-fit items-center gap-1.5 px-0 text-muted-foreground"
        >
          <ChevronLeft className="size-4 shrink-0" aria-hidden />
          Back to {DIRECTORY_ROLE_LABELS.client} directory
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-0 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="shrink-0">
                <ClientProfilePhotoSlot
                  kind="business_logo"
                  url={null}
                  disabled
                  variant="square"
                  onPickFile={noopUpload}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-xl font-semibold tracking-tight text-foreground">
                  {businessDisplay}
                </p>
                <p className="font-mono text-xs text-muted-foreground break-all">
                  {invite.id}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="toolbar"
                disabled={resendMutation.isPending}
                onClick={() => {
                  setSendError(null);
                  setNotice(null);
                  setInviteUrl(null);
                  resendMutation.mutate();
                }}
              >
                {resendMutation.isPending ? "Working…" : "Resend onboarding"}
              </Button>
            </div>
          </div>

          <div
            className="my-6 border-b border-border"
            role="separator"
            aria-hidden
          />

          {inviteExpired ? (
            <Alert className="mb-4">
              <AlertTitle>Invite link expired</AlertTitle>
              <AlertDescription>
                Resend onboarding email to generate a new 7-day link and email it to
                the client.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="mt-8 space-y-4">
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-center sm:gap-6">
              <div className="text-sm text-muted-foreground">Avatar</div>
              <div className="min-w-0">
                <ClientProfilePhotoSlot
                  kind="avatar"
                  url={null}
                  disabled
                  variant="round"
                  compact
                  onPickFile={noopUpload}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-center sm:gap-6">
              <div className="text-sm text-muted-foreground">Client name</div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {clientNameDisplay}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-center sm:gap-6">
              <div className="text-sm text-muted-foreground">Active profile</div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">—</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-center sm:gap-6">
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="min-w-0 break-all text-sm font-medium text-foreground">
                {invite.email}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-center sm:gap-6">
              <div className="text-sm text-muted-foreground">Date joined</div>
              <div className="text-sm font-medium text-foreground">—</div>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-6 text-sm">
            <span className="text-muted-foreground">Invite expires</span>
            <p className="mt-1 font-medium text-foreground">{expiresLabel}</p>
          </div>

          <div className="mt-6 space-y-3 border-t border-border pt-6">
            {onboardingFooter}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
