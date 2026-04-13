"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { DirectoryRole } from "@/lib/constants/directory-roles";
import { DIRECTORY_ROLE_LABELS } from "@/lib/constants/directory-roles";
import type { ProfileRow } from "@/lib/types/profile";
import {
  fetchAdminProfiles,
  mergeProfileIntoRoleCache,
  patchAdminProfile,
} from "@/lib/query/admin-profiles";
import { queryKeys } from "@/lib/query/query-keys";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DirectoryUserDetailClientProps = {
  role: DirectoryRole;
  profile: ProfileRow;
};

function normalizeProfile(p: ProfileRow): ProfileRow {
  return { ...p, is_active: p.is_active !== false };
}

export function DirectoryUserDetailClient({
  role,
  profile: initialProfile,
}: DirectoryUserDetailClientProps) {
  const queryClient = useQueryClient();
  const listQuery = useQuery({
    queryKey: queryKeys.admin.profiles(role),
    queryFn: () => fetchAdminProfiles(role),
  });

  const displayProfile = useMemo(() => {
    const fromCache = listQuery.data?.find((p) => p.id === initialProfile.id);
    return normalizeProfile(fromCache ?? initialProfile);
  }, [listQuery.data, initialProfile]);

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(
    () => initialProfile.full_name ?? "",
  );
  const [draftActive, setDraftActive] = useState(
    () => initialProfile.is_active !== false,
  );

  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const patchMutation = useMutation({
    mutationFn: () =>
      patchAdminProfile(initialProfile.id, {
        role,
        full_name: draftName.trim(),
        is_active: draftActive,
      }),
    onSuccess: (updated) => {
      setEditError(null);
      mergeProfileIntoRoleCache(queryClient, role, updated);
      setDraftName(updated.full_name ?? "");
      setDraftActive(updated.is_active !== false);
      setEditing(false);
    },
    onError: (err: Error) => {
      setEditError(err.message);
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/admin/profiles/${encodeURIComponent(initialProfile.id)}/send-onboarding`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ role }),
        },
      );
      const data = (await res.json()) as {
        error?: string;
        inviteUrl?: string;
        message?: string;
        sentAt?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not create invite");
      }
      return data;
    },
    onSuccess: (data) => {
      setSendError(null);
      setNotice(data.message ?? "Onboarding invite created.");
      setInviteUrl(
        typeof data.inviteUrl === "string" && data.inviteUrl ? data.inviteUrl : null,
      );
      const sentAt = data.sentAt;
      if (sentAt) {
        queryClient.setQueryData<ProfileRow[]>(
          queryKeys.admin.profiles(role),
          (old) =>
            old?.map((p) =>
              p.id === initialProfile.id
                ? { ...p, onboarding_sent_at: sentAt }
                : p,
            ),
        );
      }
    },
    onError: (err: Error) => {
      setNotice(null);
      setInviteUrl(null);
      setSendError(err.message);
    },
  });

  const segmentLabel = DIRECTORY_ROLE_LABELS[role];
  const sentLabel = displayProfile.onboarding_sent_at
    ? new Date(displayProfile.onboarding_sent_at).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  const startEdit = () => {
    setEditError(null);
    setDraftName(displayProfile.full_name ?? "");
    setDraftActive(displayProfile.is_active);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditError(null);
    setDraftName(displayProfile.full_name ?? "");
    setDraftActive(displayProfile.is_active);
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          render={<Link href={`/admin/directory/${role}`} />}
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="w-fit px-0 text-muted-foreground"
        >
          ← Back to {segmentLabel} directory
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {displayProfile.full_name?.trim() || "Unnamed user"}
          </CardTitle>
          <CardDescription>
            {segmentLabel} · {displayProfile.email ?? "No email"} ·{" "}
            <span
              className={
                displayProfile.is_active
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-muted-foreground"
              }
            >
              {displayProfile.is_active ? "Active" : "Inactive"}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Edit account
              </h3>
              {!editing ? (
                <Button type="button" variant="outline" size="sm" onClick={startEdit}>
                  Edit
                </Button>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={patchMutation.isPending}
                    onClick={() => patchMutation.mutate()}
                  >
                    {patchMutation.isPending ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={patchMutation.isPending}
                    onClick={cancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {editError ? (
              <Alert variant="destructive" className="mt-3">
                <AlertTitle>Could not save</AlertTitle>
                <AlertDescription>{editError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`dir-edit-name-${initialProfile.id}`}>
                  Full name
                </Label>
                <Input
                  id={`dir-edit-name-${initialProfile.id}`}
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  disabled={!editing || patchMutation.isPending}
                  autoComplete="name"
                />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  id={`dir-edit-active-${initialProfile.id}`}
                  type="checkbox"
                  className="size-4 rounded border border-input accent-primary"
                  checked={draftActive}
                  onChange={(e) => setDraftActive(e.target.checked)}
                  disabled={!editing || patchMutation.isPending}
                />
                <Label
                  htmlFor={`dir-edit-active-${initialProfile.id}`}
                  className="text-sm font-normal text-foreground"
                >
                  Active (user can sign in and access the workspace)
                </Label>
              </div>
            </div>
          </div>

          <dl className="grid gap-2 border-t border-border pt-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">User ID</dt>
              <dd className="font-mono text-xs text-foreground">{displayProfile.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Added</dt>
              <dd className="text-foreground">
                {new Date(displayProfile.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </dd>
            </div>
            {sentLabel ? (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Last onboarding sent</dt>
                <dd className="text-foreground">{sentLabel}</dd>
              </div>
            ) : null}
          </dl>

          {sendError ? (
            <Alert variant="destructive">
              <AlertTitle>Send failed</AlertTitle>
              <AlertDescription>{sendError}</AlertDescription>
            </Alert>
          ) : null}

          {notice && !sendMutation.isPending ? (
            <div
              className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
              role="status"
            >
              {notice}
            </div>
          ) : null}

          {inviteUrl ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-xs break-all text-muted-foreground">
              <span className="font-medium text-foreground">Development link:</span>{" "}
              {inviteUrl}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button
              type="button"
              disabled={sendMutation.isPending}
              onClick={() => {
                setSendError(null);
                setNotice(null);
                setInviteUrl(null);
                sendMutation.mutate();
              }}
            >
              {sendMutation.isPending ? "Creating invite…" : "Send onboarding"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Creates a one-time link (7 days) for this user to set their password
            and profile. In production, email the link through your org; in
            development the API returns the URL for testing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
